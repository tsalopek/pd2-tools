/*
  - Stop ingestion job   
  npx ts-node scripts/backfill-mercenaries.ts
*/

import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const BATCH_SIZE = 100;

interface MercData {
  description?: string;
  items?: Array<{
    name?: string;
    quality?: { name?: string };
    runeword?: boolean;
  }>;
}

interface CharacterRow {
  character_db_id: number;
  full_response_json: {
    mercenary?: MercData;
  };
}

async function getOrInsertLookupId(
  pool: Pool,
  tableName: string,
  nameColumn: string,
  value: string
): Promise<number | null> {
  if (!value) return null;

  const idColumnMap: Record<string, string> = {
    BaseItems: "base_item_id",
    Qualities: "quality_id",
  };

  const idColumnName = idColumnMap[tableName];
  if (!idColumnName) {
    throw new Error(`ID column name not defined for table: ${tableName}`);
  }

  const query = `
    WITH ins AS (
      INSERT INTO ${tableName} (${nameColumn})
      VALUES ($1)
      ON CONFLICT (${nameColumn}) DO NOTHING
      RETURNING ${idColumnName}
    )
    SELECT ${idColumnName} FROM ins
    UNION ALL
    SELECT ${idColumnName} FROM ${tableName} WHERE ${nameColumn} = $1 AND NOT EXISTS (SELECT 1 FROM ins)
  `;

  const { rows } = await pool.query(query, [value]);
  return rows[0] ? rows[0][idColumnName] : null;
}

async function backfillMercenaries() {
  const pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "pd2",
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  });

  try {
    console.log("🔍 Finding characters with mercenary data...");

    const { rows } = await pool.query<CharacterRow>(`
      SELECT character_db_id, full_response_json
      FROM Characters
      WHERE full_response_json->'mercenary' IS NOT NULL
      ORDER BY character_db_id
    `);

    console.log(`✅ Found ${rows.length} characters with mercenaries\n`);

    if (rows.length === 0) {
      console.log("Nothing to backfill!");
      await pool.end();
      return;
    }

    let totalProcessed = 0;
    let totalMercTypes = 0;
    let totalMercItems = 0;
    let skippedInvalidDesc = 0;
    let skippedInvalidItems = 0;

    // Process in batches
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        for (const row of batch) {
          const mercData = row.full_response_json.mercenary;
          if (!mercData) continue;

          // Validate and insert mercenary type
          if (
            mercData.description &&
            typeof mercData.description === "string"
          ) {
            await client.query(
              `INSERT INTO CharacterMercenaries (character_db_id, description)
               VALUES ($1, $2)
               ON CONFLICT (character_db_id) DO UPDATE SET description = $2`,
              [row.character_db_id, mercData.description]
            );
            totalMercTypes++;
          } else {
            skippedInvalidDesc++;
            console.warn(
              `  ⚠️  Character ${row.character_db_id}: Invalid merc description`
            );
          }

          // Delete old merc items first (in case of re-run)
          await client.query(
            "DELETE FROM MercenaryItems WHERE character_db_id = $1",
            [row.character_db_id]
          );

          // Insert merc items
          if (Array.isArray(mercData.items) && mercData.items.length > 0) {
            for (const item of mercData.items) {
              if (!item.name || !item.quality?.name) {
                skippedInvalidItems++;
                continue;
              }

              const baseItemId = await getOrInsertLookupId(
                client,
                "BaseItems",
                "name",
                item.name
              );
              const qualityId = await getOrInsertLookupId(
                client,
                "Qualities",
                "name",
                item.quality.name
              );

              if (baseItemId !== null && qualityId !== null) {
                await client.query(
                  `INSERT INTO MercenaryItems (character_db_id, base_item_id, quality_id, is_runeword)
                   VALUES ($1, $2, $3, $4)`,
                  [row.character_db_id, baseItemId, qualityId, !!item.runeword]
                );
                totalMercItems++;
              }
            }
          }

          totalProcessed++;
        }

        await client.query("COMMIT");
        console.log(
          `✅ Processed batch: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`
        );
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`❌ Batch failed at character ${i}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log("\n🎉 Backfill completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total characters processed: ${totalProcessed}`);
    console.log(`   Mercenary types inserted: ${totalMercTypes}`);
    console.log(`   Mercenary items inserted: ${totalMercItems}`);
    if (skippedInvalidDesc > 0) {
      console.log(`   ⚠️  Skipped invalid descriptions: ${skippedInvalidDesc}`);
    }
    if (skippedInvalidItems > 0) {
      console.log(`   ⚠️  Skipped invalid items: ${skippedInvalidItems}`);
    }

    // Verification
    console.log("\n🔍 Verifying results...");
    const verifyQuery = `
      SELECT
        COUNT(*) FILTER (WHERE full_response_json->'mercenary' IS NOT NULL) as jsonb_mercs,
        (SELECT COUNT(*) FROM CharacterMercenaries) as normalized_mercs
      FROM Characters;
    `;
    const verifyResult = await pool.query(verifyQuery);
    const { jsonb_mercs, normalized_mercs } = verifyResult.rows[0];

    console.log(`   Characters with merc in JSONB: ${jsonb_mercs}`);
    console.log(`   CharacterMercenaries rows: ${normalized_mercs}`);

    if (parseInt(jsonb_mercs) === parseInt(normalized_mercs)) {
      console.log("   ✅ Counts match perfectly!");
    } else {
      console.log(
        `   ⚠️  Mismatch detected! Difference: ${parseInt(jsonb_mercs) - parseInt(normalized_mercs)}`
      );
    }
  } catch (error) {
    console.error("\n❌ Backfill failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the backfill
backfillMercenaries()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });

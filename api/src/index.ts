import { createServer, startServer } from "./server";
import { closeAllDatabases } from "./database";
import { logger as mainLogger } from "./config";

const logger = mainLogger.createNamedLogger("API");

// Create and start the server
const app = createServer();
startServer(app);

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  try {
    await closeAllDatabases();
    logger.info("Database connections closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error });
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received: closing HTTP server");
  try {
    await closeAllDatabases();
    logger.info("Database connections closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error });
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", { error });
  process.exit(1);
});

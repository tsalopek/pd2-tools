import { Router } from "express";
import healthRoutes from "./health";
import charactersRoutes from "./characters";
import economyRoutes from "./economy";
import statisticsRoutes from "./statistics";

const router = Router();

router.use("/health", healthRoutes);
router.use("/characters", charactersRoutes);
router.use("/economy", economyRoutes);
router.use("/statistics", statisticsRoutes);

export default router;

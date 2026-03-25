import { Router } from "express";
import {
  getAnalytics,
  getCompetitorComparison,
  getGaps,
} from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/:id/analytics", getAnalytics);
router.get("/:id/analytics/compare", getCompetitorComparison);
router.get("/:id/analytics/gaps", getGaps);

export default router;

import { Router } from "express";
import {
  generateGapAnalysis,
  generateContentPlan,
  generateGrowthStrategy,
  generateContentIdeas,
  getAIHistory,
} from "../controllers/aiController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/:id/ai/gap-analysis", generateGapAnalysis);
router.post("/:id/ai/content-plan", generateContentPlan);
router.post("/:id/ai/growth-strategy", generateGrowthStrategy);
router.post("/:id/ai/content-ideas", generateContentIdeas);
router.get("/:id/ai/history", getAIHistory);

export default router;

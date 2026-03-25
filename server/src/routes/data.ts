import { Router } from "express";
import {
  fetchWorkspaceData,
  fetchTrends,
  getProfiles,
  getPosts,
} from "../controllers/dataController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/:id/fetch", fetchWorkspaceData);
router.post("/:id/fetch/trends", fetchTrends);
router.get("/:id/profiles", getProfiles);
router.get("/:id/posts", getPosts);

export default router;

import { Router } from "express";
import passport from "passport";
import {
  signup,
  login,
  refresh,
  logout,
  getMe,
  googleCallback,
  getApiKeys,
  updateApiKeys,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.get("/api-keys", authMiddleware, getApiKeys);
router.put("/api-keys", authMiddleware, updateApiKeys);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

export default router;

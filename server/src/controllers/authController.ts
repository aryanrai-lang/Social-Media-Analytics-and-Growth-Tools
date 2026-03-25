import { Request, Response } from "express";
import { User } from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/authMiddleware";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // set to true in production
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: "No refresh token" });
      return;
    }

    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(String(user._id));
    const newRefreshToken = generateRefreshToken(String(user._id));

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("refreshToken", { path: "/" });
  res.json({ message: "Logged out" });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as any;
    if (!user) {
      res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
      return;
    }

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.redirect(`${env.CLIENT_URL}/oauth/callback?token=${accessToken}`);
  } catch {
    res.redirect(`${env.CLIENT_URL}/login?error=server_error`);
  }
};

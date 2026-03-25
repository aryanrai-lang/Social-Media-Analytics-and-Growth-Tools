import { Response } from "express";
import { Workspace } from "../models/Workspace";
import { AuthRequest } from "../middleware/authMiddleware";

export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, instagramUsername, competitors } = req.body;

    if (!name || !instagramUsername) {
      res.status(400).json({ message: "Name and Instagram username are required" });
      return;
    }

    if (competitors && competitors.length > 20) {
      res.status(400).json({ message: "Maximum 20 competitors allowed" });
      return;
    }

    const workspace = await Workspace.create({
      owner: req.userId,
      name,
      instagramUsername: instagramUsername.toLowerCase().replace("@", ""),
      competitors: (competitors || []).map((c: any) => ({
        username: c.username?.toLowerCase().replace("@", ""),
        businessId: c.businessId,
      })),
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspaces = await Workspace.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json(workspaces);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.json(workspace);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, instagramUsername, competitors } = req.body;

    if (competitors && competitors.length > 20) {
      res.status(400).json({ message: "Maximum 20 competitors allowed" });
      return;
    }

    const update: Record<string, any> = {};
    if (name) update.name = name;
    if (instagramUsername) update.instagramUsername = instagramUsername.toLowerCase().replace("@", "");
    if (competitors) {
      update.competitors = competitors.map((c: any) => ({
        username: c.username?.toLowerCase().replace("@", ""),
        businessId: c.businessId,
      }));
    }

    const workspace = await Workspace.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      update,
      { new: true }
    );

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.json(workspace);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.json({ message: "Workspace deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

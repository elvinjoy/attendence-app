import { Request, Response } from "express";
import { registerAdmin, loginAdmin } from "../functions/adminFunction";

export const registerAdminController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerAdmin(name, email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const loginAdminController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

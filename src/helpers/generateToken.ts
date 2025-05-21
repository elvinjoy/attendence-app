import jwt from "jsonwebtoken";
import { ADMIN_JWT_SECRET } from "../config/db";

export const generateToken = (adminId: string) => {
  return jwt.sign({ adminId }, ADMIN_JWT_SECRET, {
    expiresIn: "7d",
  });
};
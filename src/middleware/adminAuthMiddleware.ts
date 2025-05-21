import { Request, Response, NextFunction } from "express"; 
import jwt from "jsonwebtoken"; 
import { ADMIN_JWT_SECRET } from "../config/db"; 
import { Admin } from "../models/adminModel"; 
 
// Extend the Request interface to include admin 
interface AuthenticatedAdminRequest extends Request { 
  admin?: any; // Replace 'any' with your Admin type if defined (e.g., `AdminDocument`) 
} 
 
export const adminProtect = async ( 
  req: AuthenticatedAdminRequest, 
  res: Response, 
  next: NextFunction 
) => { 
  try { 

    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) throw new Error("Token missing"); 
 
    // console.log("Received token:", token); 
 
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as { adminId: string }; 
    // console.log("Decoded token:", decoded); 
    
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) throw new Error("Admin not found"); 
    
    // console.log("Admin found:", admin); 
    req.admin = admin; 
    next(); 
  } catch (err: any) { 
    console.error("Admin auth error:", err.message || err); 
    res.status(401).json({ error: "Admin not authorized" }); 
  } 
};
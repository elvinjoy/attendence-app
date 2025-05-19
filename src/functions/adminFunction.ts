import { Admin } from "../models/adminModel";
import bcrypt from "bcryptjs";
import { validateEmail } from "../utils/validateEmail";
import { validatePassword } from "../utils/validatePassword";
import { generateToken } from "../helpers/generateToken";

export const registerAdmin = async (
  name: string,
  email: string,
  password: string
) => {
  if (!name || !email || !password) throw new Error("All fields are required");

  if (!validateEmail(email)) throw new Error("Invalid email");

  if (!validatePassword(password))
    throw new Error(
      "password must contain At least 6 chars, 1 number, 1 lowercase, 1 uppercase"
    );

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) throw new Error("Admin already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    _id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    token: generateToken(newAdmin._id.toString()),
  };
};

export const loginAdmin = async (email: string, password: string) => {
  if (!email || !password) throw new Error("Email and password required");

  if (!validateEmail(email)) throw new Error("Invalid email");

  if (!validatePassword(password))
    throw new Error(
      "password must contain At least 6 chars, 1 number, 1 lowercase, 1 uppercase"
    );

  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id.toString()),
  };
};

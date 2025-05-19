import express from "express";
import { registerAdminController, loginAdminController } from "../controllers/adminController";

const router = express.Router();

router.post("/register", registerAdminController);
router.post("/login", loginAdminController);

export default router;

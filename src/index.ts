import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import adminRoutes from "./routes/adminRoutes";
import employeeRoutes from "./routes/employeeRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("attendense API is running...");
});


app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

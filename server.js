import express from "express";
import dotenv from "dotenv";
import connectDB from "./connectDb.js";
import morgan from "morgan";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./eblog-c9db6-firebase-adminsdk-y3ld0-2ee4640f9e.json" assert { type: "json" };

// Route imports
import authRoutes from "./routes/auth/index.js";
import postRoutes from "./routes/post/index.js";

// App config
dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/api/v1", (req, res) => {
  return res.status(200).json({
    message: "Welcome to Eblog API!",
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);

const PORT = process.env.PORT || 3001;

// Initialize firebase service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// Runs app on port PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

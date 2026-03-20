import express from "express";
import { app, server } from "./lib/socket.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "./lib/passport.js";
import connectDB from "./lib/db.js";
import { notFoundError } from "./middleware/notFoundErrorMiddleware.js";
import { errorHandler } from "./middleware/errorHandlerMiddleware.js";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 8000;
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/profile", profileRoutes);

app.use(notFoundError);

app.use(errorHandler);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

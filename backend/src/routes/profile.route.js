import express from "express";
import { updateProfile } from "../controllers/profile.controller.js";
import { uploadMemoryProfilePic } from "../middleware/uploadMiddleware.js";
import { AppError } from "../utils/AppError.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch(
  "/update-profile",
  authMiddleware,
  (req, res, next) => {
    uploadMemoryProfilePic(req, res, (err) => {
      if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError("Allowed only 1 image", 400));
      }
      if (err) {
        return next(new AppError(err.message, 400));
      }

      next();
    });
  },
  updateProfile,
);

export default router;

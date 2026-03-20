import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  deleteMessage,
  editMessage,
  getMseeages,
  getUsersForSideBar,
  searchUsers,
  sendMessags,
} from "../controllers/message.controller.js";
import { requireJson } from "../middleware/requireJsonMiddleware.js";
import { uploadMemoryFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, getUsersForSideBar);
router.get("/search", authMiddleware, searchUsers);
router.get("/:id", authMiddleware, getMseeages);
router.post(
  "/send/:id",
  authMiddleware,
  requireJson,
  uploadMemoryFiles,
  sendMessags,
);
router.patch(
  "/edit/:id",
  authMiddleware,
  requireJson,
  uploadMemoryFiles,
  editMessage,
);
router.delete("/delete/:id", authMiddleware, deleteMessage);

export default router;

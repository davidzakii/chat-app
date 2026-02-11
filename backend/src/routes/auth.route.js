import express from "express";
import {
  checkAuth,
  forgetPassword,
  googleCallback,
  login,
  logout,
  resetPassword,
  signup,
  verifyOTP,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  registerUserSchema,
  loginUserSchema,
  logoutSchema,
  otpSchema,
  forgotPasswordUserSchema,
  resetPasswordUserSchema,
} from "../validation/userValidation.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { loginLimiter, otpLimiter, signupLimiter } from "../lib/limiter.js";
import passport from "../lib/passport.js";
import { requireJson } from "../middleware/requireJsonMiddleware.js";

const router = express.Router();

router.post(
  "/signup",
  signupLimiter,
  requireJson,
  validate(registerUserSchema),
  signup,
);

router.post(
  "/verify-otp",
  otpLimiter,
  requireJson,
  validate(otpSchema),
  verifyOTP,
);

router.post("/forgot-password", requireJson,validate(forgotPasswordUserSchema), forgetPassword);
router.post("/reset-password/:token", requireJson,validate(resetPasswordUserSchema) ,resetPassword);

router.post(
  "/login",
  loginLimiter,
  requireJson,
  validate(loginUserSchema),
  login,
);

router.post(
  "/logout",
  requireJson,
  validate(logoutSchema),
  authMiddleware,
  logout,
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback,
);

router.get("/check", authMiddleware, checkAuth);

export default router;

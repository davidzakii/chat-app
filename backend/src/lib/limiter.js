import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req),
  message: {
    isPass: false,
    data: null,
    message: "Too many login attempts, please try again later",
    status: 429,
  },
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    isPass: false,
    data: null,
    message: "Too many signup attempts, please try again later",
    status: 429,
  },
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 3,
  keyGenerator: (req) => req.body?.email || ipKeyGenerator(req),
  message: {
    isPass: false,
    data: null,
    message: "Too many OTP requests, please try again after 1 hour",
    status: 429,
  },
});

import { errorResponse, successResponse } from "../utils/api.responses.js";
import User from "../models/user.model.js";
import { generateToken } from "../lib/jwt.js";
import crypto from "crypto";
import { sendOTPEmail, sendRestPasswordEmail } from "../lib/nodeEmailer.js";

export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    const existUserByEmail = await User.findOne({ email });
    const existUserByFullName = await User.findOne({ fullName });
    if (existUserByEmail) {
      return res.status(409).json(errorResponse("Email already exists", 409));
    }
    if (existUserByFullName) {
      return res
        .status(409)
        .json(
          errorResponse("Name already exists, Please enter another name", 409),
        );
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = new User({ email, password, fullName, otp, otpExpires });
    await user.save();

    await sendOTPEmail(email, otp);

    res
      .status(201)
      .json(
        successResponse(
          null,
          "User created successfully. Please verify your email.",
        ),
      );
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(errorResponse("User not found", 404));
    }

    if (user.isVerified) {
      return res.status(400).json(errorResponse("User already verified", 400));
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json(errorResponse("Invalid or expired OTP", 400));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json(successResponse(null, "User verified successfully"));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json(errorResponse("Invalid credentials", 400));
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json(errorResponse("Invalid credentials", 400));
  }
  if (!user.isVerified) {
    return res
      .status(400)
      .json(errorResponse("Please verify your email before logging in", 400));
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json(errorResponse("Invalid credentials", 400));
  }
  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    profilePic: user.profilePic,
  };
  const token = generateToken(payload);
  const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
  };
  res.cookie("token", token, cookieOptions);
  res.status(200).json(successResponse(null, "User login successfully"));
};

export const googleCallback = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect("http://localhost:4200/login?error=google");
  }

  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
  };

  const token = generateToken(payload);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  /* res.redirect("http://localhost:3000/api/auth/google/callback") // mistack cause of proplem ;
     res.redirect("http://localhost:4200/home")=> correct
  */
  // res.status(200).json(successResponse(null, "User login successfully"));
  res.redirect("http://localhost:4200/google-login");
};

export const checkAuth = async (req, res) => {
  const user = await User.findById(req.user._id, {
    password: 0,
    isGoogleUser: 0,
    isVerified: 0,
    googleId: 0,
    otp: 0,
    otpExpires: 0,
    profilePicPublicId: 0,
  });

  res.status(200).json(successResponse(user, "User is authenticated"));
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json(errorResponse("User not found", 404));

  // Generate a cryptographically secure token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store hashed token and expiry (e.g., 1 hour)
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  // In production, send this via email using Nodemailer or SendGrid
  const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
  await sendRestPasswordEmail(email, resetUrl);
  res
    .status(200)
    .json(successResponse(null, "Password reset link sent to email"));
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res
      .status(400)
      .json(errorResponse("Password not match confirm password", 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json(errorResponse("Invalid or expired token", 400));

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.status(200).json(successResponse(null, "Password successfully updated"));
};

export const logout = (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json(successResponse(null, "Logged out successfully"));
};

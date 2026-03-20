import cloudinary from "../lib/cloudinary.js";
import { bufferToStream } from "../middleware/uploadMiddleware.js";
import User from "../models/user.model.js";
import { errorResponse, successResponse } from "../utils/api.responses.js";
import { AppError } from "../utils/AppError.js";

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body || {};

    if (!fullName && !req.file) {
      return next(new AppError("No data provided", 400));
    }

    const user = await User.findById(req.user._id, { password: 0 });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (fullName && fullName !== user.fullName) {
      const existUserByFullName = await User.findOne({ fullName });
      if (existUserByFullName) {
        return res.status(409).json(errorResponse("Name already exists", 409));
      }
      user.fullName = fullName;
    }

    if (req.file) {
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      }
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "chatapp",
              transformation: [
                { width: 200, height: 200, crop: "thumb", gravity: "face" },
                { fetch_format: "auto", quality: "auto" }, // لتقليل حجم الصورة وسرعة التحميل
              ],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

          bufferToStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();

      user.profilePic = result.secure_url;
      user.profilePicPublicId = result.public_id;
    }

    await user.save();

    const {
      isGoogleUser,
      isVerified,
      googleId,
      otp,
      otpExpires,
      profilePicPublicId,
      ...customFieldUser
    } = user.toObject();

    return res
      .status(200)
      .json(successResponse(customFieldUser, "User updated successfully"));
  } catch (err) {
    next(err);
  }
};

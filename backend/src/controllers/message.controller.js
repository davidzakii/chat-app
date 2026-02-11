import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { bufferToStream } from "../middleware/uploadMiddleware.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { successResponse } from "../utils/api.responses.js";
import { AppError } from "../utils/AppError.js";

export const getUsersForSideBar = async (req, res) => {
  const loggedInUserId = req.user._id;

  // جلب المعرفات الفريدة لكل الأشخاص الذين أرسلت لهم أو استقبلت منهم رسائل
  const interactedUserIds = await Message.distinct("receiverId", {
    senderId: loggedInUserId,
  });
  const receivedUserIds = await Message.distinct("senderId", {
    receiverId: loggedInUserId,
  });

  const allIds = [...new Set([...interactedUserIds, ...receivedUserIds])];

  const filteredUsers = await User.find({
    _id: { $in: allIds, $ne: loggedInUserId },
  }).select(
    "-password -otp -otpExpires -isVerified -__v -profilePicPublicId -googleId -isGoogleUser",
  );

  res.status(200).json(successResponse(filteredUsers));
};

export const getMseeages = async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;
  const messages = await Message.find({
    $or: [
      {
        senderId: myId,
        receiverId: userToChatId,
      },
      {
        senderId: userToChatId,
        receiverId: myId,
      },
    ],
  }).sort({ createdAt: 1 });
  res
    .status(200)
    .json(successResponse(messages, "Messages retrive successfully"));
};

export const sendMessags = async (req, res, next) => {
  const { id: userReciverdId } = req.params;
  let { text } = req.body || {};
  const myId = req.user._id;

  if (!text && (!req.files || req.files.length === 0)) {
    return next(new AppError("No data provided", 400));
  }

  let uploadedFiles = [];

  if (req.files && req.files.length > 0) {
    const streamUpload = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chatapp" },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        bufferToStream(fileBuffer).pipe(stream);
      });

    // Upload all files in parallel
    const uploadPromises = req.files.map((file) => streamUpload(file.buffer));
    const results = await Promise.all(uploadPromises);

    // Map results to your desired format
    uploadedFiles = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
  }

  // Save to database (assumes your schema supports an array of files)
  const message = new Message({
    senderId: myId,
    receiverId: userReciverdId,
    text,
    files: uploadedFiles,
  });

  await message.save();

  const receiverSocketId = getReceiverSocketId(userReciverdId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }

  res.status(201).json(successResponse(message, "Messages sent successfully"));
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const myId = req.user._id;
    const message = await Message.findById(messageId);

    if (!message) {
      return next(new AppError("Message not found", 404));
    }
    if (message.senderId.toString() !== myId.toString()) {
      return next(
        new AppError("You are not authorized to delete this message", 403),
      );
    }
    const receiverId = message.receiverId; // نحفظ المعرف قبل الحذف

    await Promise.all(
      message.files.map((f) => cloudinary.uploader.destroy(f.publicId)),
    );

    await Message.deleteOne({ _id: messageId });

    // إبلاغ الطرف الآخر بأن الرسالة حُذفت
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }
    res.status(200).json(successResponse(null, "Message deleted successfully"));
  } catch (err) {
    next(err);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body || {};
    const myId = req.user._id;
    if (!text) {
      return next(new AppError("No text provided", 400));
    }
    const message = await Message.findById(messageId);

    if (!message) {
      return next(new AppError("Message not found", 404));
    }
    if (message.senderId.toString() !== myId.toString())
      return next(
        new AppError("You are not authorized to edit this message", 403),
      );
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text },
      { new: true },
    );
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }
    res
      .status(200)
      .json(successResponse(updatedMessage, "Message updated successfully"));
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  const { name } = req.query;
  const loggedInUserId = req.user._id;

  if (!name) return res.status(200).json(successResponse([]));

  // البحث عن مستخدمين اسمهم يحتوي على النص المكتوب
  const users = await User.find({
    fullName: { $regex: name, $options: "i" },
    _id: { $ne: loggedInUserId }, // استبعاد المستخدم الحالي
  })
    .select("fullName profilePic _id createdAt updatedAt")
    .limit(10); // تحديد العدد لسرعة الأداء

  res.status(200).json(successResponse(users));
};

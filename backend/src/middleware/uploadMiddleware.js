import multer from "multer";
import { Readable } from "stream";

export const uploadMemoryProfilePic = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
}).single("profilePic");

export const uploadMemoryFiles = multer({
  storage: multer.memoryStorage(),
}).array("files", 10);

// تحويل buffer لـ Readable stream
export const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

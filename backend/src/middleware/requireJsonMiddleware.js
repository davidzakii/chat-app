import { AppError } from "../utils/AppError.js";

export const requireJson = (req, res, next) => {
  if (
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.headers["content-length"] > 0 &&
    !req.is("application/json") &&
    !req.is("multipart/form-data")
  ) {
    return next(new AppError("Content-Type not supported", 415));
  }

  next();
};

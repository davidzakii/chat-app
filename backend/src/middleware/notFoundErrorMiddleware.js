import { AppError } from "../utils/AppError.js";

export const notFoundError = (req, res, next) => {
  next(new AppError("Route not found", 404));
};

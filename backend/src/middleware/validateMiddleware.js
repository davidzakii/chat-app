import { AppError } from "../utils/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return next(
        new AppError(error.details.map((d) => d.message).join(", "), 400)
      );
    }

    req.body = value;
    next();
  };
};

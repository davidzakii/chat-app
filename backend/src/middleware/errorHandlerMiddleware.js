import { logger } from "../lib/logger.js";
import { errorResponse } from "../utils/api.responses.js";

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  logger.error({
    message: err.message,
    stack: err.stack,
    status,
    method: req.method,
    url: req.originalUrl,
  });

  const clientMessage = status === 500 ? "Internal Server Error" : err.message;

  res
    .status(status)
    .json({ ...errorResponse(clientMessage, status), errDetails: err.message });
};

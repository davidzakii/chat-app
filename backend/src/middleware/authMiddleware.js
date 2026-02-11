import { errorResponse } from "../utils/api.responses.js";
import { verifyToken } from "../lib/jwt.js";

export const authMiddleware = (req, res, next) => {
  if (!req.cookies) {
    return res.status(401).json(errorResponse("Unauthorized", 401));
  }
  try {
    const token = req.cookies.token;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(errorResponse("Unauthorized", 401));
  }
};

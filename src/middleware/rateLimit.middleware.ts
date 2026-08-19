import { Request, Response } from "express";
import status from "http-status";
import { rateLimit } from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(status.TOO_MANY_REQUESTS).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
    });
  },
});

export default loginRateLimiter;

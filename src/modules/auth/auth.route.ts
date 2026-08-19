import { Router } from "express";
import loginRateLimiter from "../../middleware/rateLimit.middleware";
import validateRequest from "../../middleware/validate.middleware";
import { loginHandler, refreshHandler } from "./auth.controller";
import { loginSchema, refreshSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimiter,
  validateRequest(loginSchema),
  loginHandler,
);
authRouter.post("/refresh", validateRequest(refreshSchema), refreshHandler);

export default authRouter;

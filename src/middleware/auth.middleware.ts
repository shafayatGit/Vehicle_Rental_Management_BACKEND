import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../config/env";
import AppError from "../errors/AppError";
import { verifyToken } from "../utils/jwt";

const auth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(status.UNAUTHORIZED, "Access token is required");
  }

  const token = authorization.slice("Bearer ".length);
  const payload = verifyToken(token, envVars.ACCESS_TOKEN_SECRET);

  req.user = { id: payload.id, email: payload.email };
  next();
};

export default auth;

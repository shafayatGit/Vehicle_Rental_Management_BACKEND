import { NextFunction, Request, Response } from "express";
import status from "http-status";
import authService from "./auth.service";

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as { email: string; password: string };
    const data = await authService.login(body.email, body.password);

    res.status(status.OK).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as { refreshToken: string };
    const data = await authService.refresh(body.refreshToken);

    res.status(status.OK).json({
      success: true,
      message: "Token refreshed",
      data,
    });
  } catch (error) {
    next(error);
  }
};

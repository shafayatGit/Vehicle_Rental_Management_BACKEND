import { NextFunction, Request, Response } from "express";
import multer from "multer";
import status from "http-status";
import AppError from "../errors/AppError";

import { envVars } from "../config/env";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";

export const globalErrorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(
      "Error from Global Error Handler",
      err instanceof Error ? err.message : err,
      err instanceof Error ? err.stack : "",
    );
  }

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = err.errorSources ?? [];
  } else if (err instanceof multer.MulterError) {
    statusCode = status.BAD_REQUEST;
    message = err.message;
  }

  const errorResponse: TErrorResponse = {
    statusCode,
    success: false,
    message,
    errorSources,
    error:
      envVars.NODE_ENV === "development"
        ? err instanceof Error
          ? { message: err.message, stack: err.stack }
          : err
        : undefined,
    stack: envVars.NODE_ENV === "development" ? message : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

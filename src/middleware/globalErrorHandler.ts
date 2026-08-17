/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errors/AppError";

import { envVars } from "../config/env";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : undefined,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

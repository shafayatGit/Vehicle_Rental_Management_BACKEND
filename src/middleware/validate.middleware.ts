import { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import status from "http-status";
import AppError from "../errors/AppError";
import type { TErrorSources } from "../interfaces/error.interface";

type ValidationSource = "body" | "query" | "params";

const getSource = (req: Request, source: ValidationSource) => {
  if (source === "body") {
    return req.body;
  }
  if (source === "query") {
    return req.query;
  }
  return req.params;
};

const validateRequest = (
  schema: ObjectSchema,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const input = getSource(req, source);
    const { error, value } = schema.validate(input, { abortEarly: false });

    if (error) {
      const errorSources: TErrorSources[] = error.details.map((detail) => ({
        path: detail.path.join("."),
        message: detail.message,
      }));
      throw new AppError(status.BAD_REQUEST, "Validation error", errorSources);
    }

    if (source === "body") {
      req.body = value;
    } else if (source === "query") {
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req.params = value;
    }
    next();
  };
};

export default validateRequest;

import jwt, { type SignOptions } from "jsonwebtoken";
import status from "http-status";
import { envVars } from "../config/env";
import AppError from "../errors/AppError";

export interface TokenPayload {
  id: number;
  email: string;
}

const signToken = (
  payload: TokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign(payload, secret, options);
};

export const signAccessToken = (payload: TokenPayload): string =>
  signToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    envVars.ACCESS_TOKEN_EXPIRES_IN,
  );

export const signRefreshToken = (payload: TokenPayload): string =>
  signToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    envVars.REFRESH_TOKEN_EXPIRES_IN,
  );

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "string" || !decoded.id || !decoded.email) {
      throw new Error("Invalid token payload");
    }
    return { id: decoded.id as number, email: decoded.email as string };
  } catch {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired token");
  }
};

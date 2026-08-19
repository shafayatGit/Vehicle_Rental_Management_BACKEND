import bcrypt from "bcryptjs";
import status from "http-status";
import { envVars } from "../../config/env";
import db from "../../config/database";
import AppError from "../../errors/AppError";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type TokenPayload,
} from "../../utils/jwt";
import {
  LoginResult,
  RefreshResult,
  StaffResponse,
  StaffRow,
} from "./auth.interface";

class AuthService {
  private toStaffResponse(staff: StaffRow): StaffResponse {
    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const staff = await db<StaffRow>("staff").where({ email }).first();

    if (!staff || !(await bcrypt.compare(password, staff.password_hash))) {
      throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }

    const payload: TokenPayload = { id: staff.id, email: staff.email };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      staff: this.toStaffResponse(staff),
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const payload = verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);

    const staff = await db<StaffRow>("staff").where({ id: payload.id }).first();
    if (!staff) {
      throw new AppError(status.UNAUTHORIZED, "Staff no longer exists");
    }

    const newPayload: TokenPayload = { id: staff.id, email: staff.email };

    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    };
  }
}

export default new AuthService();

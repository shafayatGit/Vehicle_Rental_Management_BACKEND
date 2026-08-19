export interface StaffRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

export interface StaffResponse {
  id: number;
  email: string;
  name: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  staff: StaffResponse;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

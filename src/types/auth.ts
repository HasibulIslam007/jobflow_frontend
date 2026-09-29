/**
 * Auth domain types. API envelope shapes mirror docs/04-api.md §1.1
 * and the Laravel AuthController contract.
 */

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type AuthPayload = {
  token: string;
  user: User;
  authenticated: boolean;
};

export type MePayload = {
  user: User;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

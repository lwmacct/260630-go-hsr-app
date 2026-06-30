import { apiPost } from "@/shared/api/client";

export interface AuthSession {
  authenticated: boolean;
  expiresAt?: string;
  user?: {
    id: number;
    username: string;
    displayName: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    admin: boolean;
  };
}

export type ChallengeProvider = "image" | "hcaptcha" | "turnstile";

export interface AuthChallengeConfig {
  provider: ChallengeProvider;
  sitekey?: string;
}

export interface AuthPublicConfig {
  local: {
    loginEnabled: boolean;
    registrationEnabled: boolean;
  };
  oauth: {
    enabled: boolean;
    providers: OAuthProvider[];
  };
  challenge: AuthChallengeConfig;
}

export interface OAuthProvider {
  provider: string;
  label: string;
}

export interface AuthState {
  config: AuthPublicConfig;
  session: AuthSession;
}

export interface ImageChallenge {
  provider: "image";
  challengeId: string;
  image: string;
  expiresAt: string;
}

export type AuthChallengeResponse =
  | { provider: "image"; challengeId: string; answer: string }
  | { provider: "hcaptcha"; token: string }
  | { provider: "turnstile"; token: string };

export const defaultAuthConfig: AuthPublicConfig = {
  local: { loginEnabled: true, registrationEnabled: true },
  oauth: { enabled: false, providers: [] },
  challenge: { provider: "image" },
};

export async function fetchAuthSession(): Promise<AuthSession> {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return (await response.json()) as AuthSession;
}

export async function fetchAuthPublicConfig(): Promise<AuthPublicConfig> {
  const response = await fetch("/api/auth/config", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    return defaultAuthConfig;
  }

  return (await response.json()) as AuthPublicConfig;
}

export async function fetchAuthState(): Promise<AuthState> {
  const [session, config] = await Promise.all([
    fetchAuthSession(),
    fetchAuthPublicConfig(),
  ]);

  return { config, session };
}

export async function createImageChallenge(): Promise<ImageChallenge> {
  return apiPost<ImageChallenge>("/api/auth/challenges");
}

export async function login(
  username: string,
  password: string,
  challenge: AuthChallengeResponse,
): Promise<void> {
  await apiPost<void>("/api/auth/password/login", { username, password, challenge });
}

export async function register(
  username: string,
  password: string,
  challenge: AuthChallengeResponse,
): Promise<void> {
  await apiPost<void>("/api/auth/password/register", {
    username,
    password,
    challenge,
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<AuthSession> {
  try {
    return await apiPost<AuthSession>("/api/auth/password/change", {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "密码修改失败";
    throw new Error(toPasswordChangeMessage(message), { cause: error });
  }
}

function toPasswordChangeMessage(message: string): string {
  if (message === "current password is incorrect") {
    return "当前密码不正确";
  }
  if (message === "weak password") {
    return "新密码强度不足";
  }
  if (message === "unauthorized") {
    return "登录已失效，请重新登录";
  }
  return message;
}

export function startOAuthLogin(provider: string): void {
  const returnTo = window.location.hash || "#/console";
  const params = new URLSearchParams({ provider, returnTo });
  window.location.href = `/api/auth/oauth/start?${params.toString()}`;
}

export async function logout(): Promise<void> {
  await apiPost<void>("/api/auth/logout");
}

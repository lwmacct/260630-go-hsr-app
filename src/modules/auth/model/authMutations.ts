import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  fetchAuthState,
  login,
  logout,
  register,
  type AuthChallengeResponse,
} from "../api/authApi";
import { authKeys } from "./authQueries";

async function syncAuthState(queryClient: ReturnType<typeof useQueryClient>) {
  const nextState = await fetchAuthState();
  queryClient.setQueryData(authKeys.state, nextState);
  return nextState;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challenge,
      password,
      username,
    }: {
      challenge: AuthChallengeResponse;
      password: string;
      username: string;
    }) => login(username, password, challenge),
    onSuccess: async () => {
      await syncAuthState(queryClient);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challenge,
      password,
      username,
    }: {
      challenge: AuthChallengeResponse;
      password: string;
      username: string;
    }) => register(username, password, challenge),
    onSuccess: async () => {
      await syncAuthState(queryClient);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await syncAuthState(queryClient);
    },
  });
}

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      await syncAuthState(queryClient);
    },
  });
}

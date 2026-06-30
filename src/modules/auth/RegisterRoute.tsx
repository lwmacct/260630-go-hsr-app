import {
  WorkbenchAuthScreen,
  type WorkbenchAuthSubmitValues,
} from "@lwmacct/260627-antd-workbench";
import { Link, Navigate } from "react-router-dom";
import { appPaths } from "@/app/router/navigation";
import { useAuthStateQuery } from "@/modules/auth";
import { createImageChallenge, startOAuthLogin } from "./api/authApi";
import { useRegisterMutation } from "./model/authMutations";

export function RegisterRoute() {
  const authState = useAuthStateQuery();
  const registerMutation = useRegisterMutation();

  if (authState.data && !authState.data.config.local.registrationEnabled) {
    return <Navigate to={appPaths.login} replace />;
  }

  function submit(values: WorkbenchAuthSubmitValues) {
    return registerMutation.mutateAsync({
      challenge: values.challenge,
      password: values.password,
      username: values.username,
    });
  }

  return (
    <WorkbenchAuthScreen
      config={authState.data?.config}
      createImageChallenge={createImageChallenge}
      error={registerMutation.error?.message}
      loading={registerMutation.isPending}
      mode="register"
      onOAuthLogin={(provider) => startOAuthLogin(provider.provider)}
      onSubmit={submit}
      renderModeSwitch={({ children, targetMode }) => (
        <Link to={targetMode === "login" ? appPaths.login : appPaths.register}>
          {children}
        </Link>
      )}
    />
  );
}

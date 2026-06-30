import {
  WorkbenchAuthScreen,
  type WorkbenchAuthSubmitValues,
} from "@lwmacct/260627-antd-workbench";
import { Link } from "react-router-dom";
import { appPaths } from "@/app/router/navigation";
import { createImageChallenge, startOAuthLogin } from "./api/authApi";
import { useLoginMutation } from "./model/authMutations";
import { useAuthStateQuery } from "./model/authQueries";

export function LoginRoute() {
  const authState = useAuthStateQuery();
  const loginMutation = useLoginMutation();

  function submit(values: WorkbenchAuthSubmitValues) {
    return loginMutation.mutateAsync({
      challenge: values.challenge,
      password: values.password,
      username: values.username,
    });
  }

  return (
    <WorkbenchAuthScreen
      config={authState.data?.config}
      createImageChallenge={createImageChallenge}
      error={loginMutation.error?.message}
      loading={loginMutation.isPending}
      mode="login"
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

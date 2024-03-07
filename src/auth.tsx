import { webpack, settings, logger } from "replugged";
import { ReviewDBAuth } from "./entities";
import { users, modal } from "replugged/common";
import { showToast } from "./utils";

const { OAuth2AuthorizeModal } = webpack.getByProps("OAuth2AuthorizeModal");
const { ToastType } = webpack.getByProps(["createToast", "showToast"]);

const DATA_STORE_KEY = "rdb-auth";

export let Auth: ReviewDBAuth = {};
export const defaultSettings = {};
export const authorizationToken = await settings.init("reviewdb.auth", defaultSettings);

export async function initAuth() {
  Auth = await getAuth() ?? {};
}

export async function getAuth(): Promise<ReviewDBAuth | undefined> {
  const auth = await authorizationToken.get(DATA_STORE_KEY);
  return auth?.[users.getCurrentUser()?.id];
}

export async function getToken() {
  const auth = await getAuth();
  return auth?.token;
}

export async function updateAuth(newAuth: ReviewDBAuth) {
  return authorizationToken.set(DATA_STORE_KEY, auth => {
      auth ??= {};
      Auth = auth[users.getCurrentUser().id] ??= {};

      if (newAuth.token) Auth.token = newAuth.token;
      if (newAuth.user) Auth.user = newAuth.user;

      return auth;
  });
}

export function authorize(callback?: any) {
  modal.openModal(props =>
      <OAuth2AuthorizeModal
          {...props}
          scopes={["identify"]}
          responseType="code"
          redirectUri="https://manti.vendicated.dev/api/reviewdb/auth"
          permissions={0n}
          clientId="915703782174752809"
          cancelCompletesFlow={false}
          callback={async (response: any) => {
              try {
                  const url = new URL(response.location);
                  url.searchParams.append("clientMod", "replugged");
                  const res = await fetch(url, {
                      headers: { Accept: "application/json" }
                  });

                  if (!res.ok) {
                      const { message } = await res.json();
                      showToast(message || "An error occured while authorizing", ToastType.FAILURE);
                      return;
                  }

                  const { token } = await res.json();
                  updateAuth({ token });
                  showToast("Successfully logged in!", ToastType.SUCCESS);
                  callback?.();
              } catch (e) {
                  logger.error("Failed to authorize", e);
              }
          }}
      />
  );
}

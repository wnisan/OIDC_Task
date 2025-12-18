import { WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts";

const {
    VITE_OIDC_AUTHORITY,
    VITE_OIDC_CLIENT_ID,
    VITE_OIDC_REDIRECT_URI,
    VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
    VITE_OIDC_SCOPE,
} = import.meta.env;

export const oidcConfig: UserManagerSettings = {
    authority: VITE_OIDC_AUTHORITY ?? "https://auth.cloud.yandex.ru",
    client_id: VITE_OIDC_CLIENT_ID ?? "aje27so1a2ijsc18b80t",
    redirect_uri: VITE_OIDC_REDIRECT_URI ?? "http://localhost:5173/signin-callback",
    post_logout_redirect_uri:
        VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? "http://localhost:5173/",
    scope: VITE_OIDC_SCOPE ?? "openid profile api",
    response_type: "code",
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};
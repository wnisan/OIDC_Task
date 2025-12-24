import type { UserManagerSettings } from "oidc-client-ts";
import { CookieStateStore } from "./stores/CookieStateStore";

const {
    VITE_OIDC_AUTHORITY,
    VITE_OIDC_CLIENT_ID,
    VITE_OIDC_REDIRECT_URI,
    VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
    VITE_OIDC_SCOPE,
    VITE_GOOGLE_CLIENT_SECRET,
} = import.meta.env;

export const oidcConfig: UserManagerSettings = {
    // Google OpenID Provider
    authority: VITE_OIDC_AUTHORITY ?? "https://accounts.google.com",
    // client_id для "Web application" из Google Cloud
    client_id:
        VITE_OIDC_CLIENT_ID ??
        "200783178468-gp5ael3ruc8b2qrgkkfr348oovqno48q.apps.googleusercontent.com",
    redirect_uri:
        VITE_OIDC_REDIRECT_URI ?? "http://localhost:5173/signin-callback",
    post_logout_redirect_uri:
        VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? "http://localhost:5173/",
    scope: VITE_OIDC_SCOPE ?? "openid profile email",
    response_type: "code",
    loadUserInfo: true,
    // для Google Web client требуется client_secret при обмене кода на токены
    client_secret: VITE_GOOGLE_CLIENT_SECRET ?? "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",
    // Просим у Google выдавать refresh_token (access_type=offline) и всегда явно запрашиваем consent
    extraQueryParams: {
        access_type: "offline",
        prompt: "consent",
    },
    // Используем cookies вместо localStorage для безопасности
    userStore: new CookieStateStore("oidc."),
};
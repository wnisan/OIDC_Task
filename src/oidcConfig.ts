import { WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts";

export const oidcConfig: UserManagerSettings = {
    // Полный URL провайдера OpenID Connect (иначе браузер пытается ходить на localhost/auth.cloud.yandex.ru/...)
    authority: "https://auth.cloud.yandex.ru",
    client_id: "aje27so1a2ijsc18b80t", 
    // В режиме разработки используем http, как и Vite по умолчанию
    redirect_uri: "http://localhost:5173/signin-callback",
    post_logout_redirect_uri: "http://localhost:5173/",
    scope: "openid profile api", 
    response_type: "code",      
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
};
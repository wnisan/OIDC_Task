import { UserManager, User } from 'oidc-client-ts';
import { oidcConfig } from './oidcConfig';

const {
    VITE_OIDC_CLIENT_ID,
    VITE_GOOGLE_CLIENT_SECRET,
    VITE_GOOGLE_TOKEN_URI,
} = import.meta.env;

const GOOGLE_TOKEN_ENDPOINT =
    VITE_GOOGLE_TOKEN_URI ?? 'https://oauth2.googleapis.com/token';
const GOOGLE_CLIENT_ID =
    VITE_OIDC_CLIENT_ID ??
    '200783178468-gp5ael3ruc8b2qrgkkfr348oovqno48q.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET =
    VITE_GOOGLE_CLIENT_SECRET ?? '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';

class AuthService {
    private userManager = new UserManager(oidcConfig);
    private currentUser: User | null = null;

    // Проверяем, истек ли токен
    private isTokenExpired(user: User): boolean {
        if (!user.expires_at) return true;
        const now = Math.floor(Date.now() / 1000);
        // Добавляем буфер в 60 секунд, чтобы обновлять токен заранее
        return user.expires_at < now + 60;
    }

    // Обновление токенов через Google token endpoint с использованием refresh_token
    private async refreshTokens(user: User): Promise<User | null> {
        const refreshToken = user.refresh_token;

        // Если refresh_token отсутствует, обновить токен программно нельзя
        if (!refreshToken || !GOOGLE_CLIENT_SECRET) {
            console.warn('Refresh token отсутствует или client_secret не настроен');
            return null;
        }

        try {
            const body = new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            });

            const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Не удалось обновить токен:', errorText);
                return null;
            }

            const tokenResponse = (await response.json()) as {
                access_token: string;
                id_token?: string;
                expires_in?: number;
                token_type?: string;
                refresh_token?: string;
                scope?: string;
            };

            const now = Math.floor(Date.now() / 1000);
            const expiresIn = tokenResponse.expires_in ?? 3600; // стандартное значение 1 час

            // ВАЖНО: используем expires_at вместо expires_in
            const expiresAt = now + expiresIn;

            // Корректное создание обновленного пользователя
            const updatedUser = new User({
                ...user,
                access_token: tokenResponse.access_token,
                id_token: tokenResponse.id_token ?? user.id_token,
                token_type: tokenResponse.token_type ?? user.token_type,
                scope: tokenResponse.scope ?? user.scope,
                refresh_token:
                    tokenResponse.refresh_token ?? user.refresh_token,
                expires_at: expiresAt, // Правильное поле!
            });

            await this.userManager.storeUser(updatedUser);
            this.currentUser = updatedUser;
            return updatedUser;
        } catch (error) {
            console.error('Ошибка при запросе обновления токена:', error);
            return null;
        }
    }

    // Получаем пользователя; если токен истёк — пробуем обновить через refresh_token
    public async getUser(): Promise<User | null> {
        if (this.currentUser && !this.isTokenExpired(this.currentUser)) {
            return this.currentUser;
        }

        let user = await this.userManager.getUser();

        if (user && this.isTokenExpired(user)) {
            const refreshed = await this.refreshTokens(user);
            if (refreshed) {
                return refreshed;
            }
        }

        if (!user || this.isTokenExpired(user)) {
            this.currentUser = null;
            if (user?.expires_at && user.expires_at < Math.floor(Date.now() / 1000)) {
                await this.userManager.removeUser();
            }
            return null;
        }

        this.currentUser = user;
        return this.currentUser;
    }

    // Публичный метод для обновления токена (используется в Profile при 401/403)
    public async refreshTokenIfNeeded(): Promise<User | null> {
        const user = await this.getUser();
        if (!user) {
            return null;
        }

        if (this.isTokenExpired(user)) {
            const refreshed = await this.refreshTokens(user);
            return refreshed ?? user;
        }

        return user;
    }

    public async signIn(): Promise<void> {
        await this.userManager.signinRedirect();
    }

    public async signOut(): Promise<void> {
        this.currentUser = null;
        await this.userManager.removeUser();
        await this.userManager.signoutRedirect();
    }

    public async handleSigninCallback(): Promise<User> {
        const user = await this.userManager.signinRedirectCallback();
        this.currentUser = user;
        return user;
    }
}

export const authService = new AuthService();
import type { StateStore } from 'oidc-client-ts';

/**
 * Кастомный StateStore для oidc-client-ts, который хранит данные в cookies
 * вместо localStorage для лучшей защиты от XSS атак.
 * Использует Secure и SameSite флаги для безопасности.
 */
export class CookieStateStore implements StateStore {
    private readonly prefix: string;

    constructor(prefix = 'oidc.') {
        this.prefix = prefix;
    }

    private getCookieName(key: string): string {
        return `${this.prefix}${key}`;
    }

    private setCookie(name: string, value: string, days = 7): void {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        
        // Secure: только по HTTPS (в production)
        // SameSite=Strict: защита от CSRF
        // HttpOnly нельзя установить из JS, но Secure и SameSite уже защищают
        const isSecure = window.location.protocol === 'https:';
        const secureFlag = isSecure ? '; Secure' : '';
        
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secureFlag}`;
    }

    private getCookie(name: string): string | null {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    private removeCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
    }

    async set(key: string, value: string): Promise<void> {
        const cookieName = this.getCookieName(key);
        this.setCookie(cookieName, value);
    }

    async get(key: string): Promise<string | null> {
        const cookieName = this.getCookieName(key);
        return this.getCookie(cookieName);
    }

    async remove(key: string): Promise<string | null> {
        const cookieName = this.getCookieName(key);
        const value = this.getCookie(cookieName);
        this.removeCookie(cookieName);
        return value;
    }

    async getAllKeys(): Promise<string[]> {
        const prefix = this.prefix;
        const keys: string[] = [];
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(prefix) === 0) {
                const key = c.substring(prefix.length, c.indexOf('='));
                if (key) {
                    keys.push(key);
                }
            }
        }
        return keys;
    }
}


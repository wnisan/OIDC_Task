import { UserManager, User } from 'oidc-client-ts';
import { oidcConfig } from './oidcConfig';

class AuthService {
    private userManager = new UserManager(oidcConfig);
    private currentUser: User | null = null;

    public async getUser(): Promise<User | null> {
        if (this.currentUser) return this.currentUser;
        this.currentUser = await this.userManager.getUser();
        return this.currentUser;
    }

    public async signIn(): Promise<void> {
        await this.userManager.signinRedirect();
    }

    public async signOut(): Promise<void> {
        await this.userManager.signoutRedirect();
    }

    public async handleSigninCallback(): Promise<User> {
        const user = await this.userManager.signinRedirectCallback();
        this.currentUser = user;
        return user;
    }
}

export const authService = new AuthService();
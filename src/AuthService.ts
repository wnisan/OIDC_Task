import { UserManager, User } from 'oidc-client-ts';
import { oidcConfig } from './oidcConfig';

class AuthService {
    private userManager = new UserManager(oidcConfig);
    private currentUser: User | null = null;

    public async getUser(): Promise<User | null> {
        if (this.currentUser && !this.currentUser.expired) {
            return this.currentUser;
        }

        const user = await this.userManager.getUser();

        if (!user || user.expired) {
            this.currentUser = null;
            if (user?.expired) {
                await this.userManager.removeUser();
            }
            return null;
        }

        this.currentUser = user;
        return this.currentUser;
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
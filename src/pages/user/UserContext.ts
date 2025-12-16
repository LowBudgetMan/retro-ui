import {User, UserManager, UserManagerSettings} from "oidc-client-ts";
import {ApiConfig, waitForAppConfiguration} from "../../config/ApiConfig";

let userManagerInstance: UserManager | null = null;

function getUserManagerSettings(): UserManagerSettings {
    return {
        authority: `${ApiConfig.authConfig().authority}`,
        client_id: `${ApiConfig.authConfig().clientId}`,
        redirect_uri: `${window.location.origin}/auth-redirect`,
        post_logout_redirect_uri: `${window.location.origin}/`,
        automaticSilentRenew: true,
        filterProtocolClaims: true,
        silent_redirect_uri: `${window.location.origin}/silent-redirect`,
        includeIdTokenInSilentRenew: true,
        extraQueryParams: {
            audience: `${ApiConfig.baseApiUrl()}/api`,
        }

    };
}

export function getUserManager(): UserManager {
    if (!userManagerInstance) {
        userManagerInstance = new UserManager(getUserManagerSettings());
    }
    return userManagerInstance;
}

export async function attemptSilentSignIn(): Promise<boolean> {
    return await getUserManager().signinSilent()
        .then((user) => !!user && !user.expired)
        .catch(() => false);
}

export async function getCurrentUser(): Promise<User | null> {
    return getUserManager().getUser()
        .then((user) => (user && !user.expired ? user : null))
        .catch(() => null);
}

export async function isAuthenticated(): Promise<boolean> {
    return await getCurrentUser()
        .then((user) => !!user && !user.expired)
        .catch(() => false);
}

export async function waitForAuthInitialization(): Promise<void> {
    await waitForAppConfiguration();

    if (!await isAuthenticated()) {
        return;
    } else {
        await attemptSilentSignIn();
    }
}

export function storeReturnUrl(url?: string): void {
    const returnUrl = url || (window.location.pathname + window.location.search);
    localStorage.setItem('auth_return_url', returnUrl);
}

export function getReturnUrl(): string | null {
    const returnUrl = localStorage.getItem('auth_return_url');
    if (returnUrl) {
        localStorage.removeItem('auth_return_url');
    }
    return returnUrl;
}

export async function initiateLoginWithReturnUrl(returnUrl?: string): Promise<void> {
    const userManager = getUserManager();
    
    storeReturnUrl(returnUrl);
    await userManager.signinRedirect();
}

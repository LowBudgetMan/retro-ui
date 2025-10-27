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

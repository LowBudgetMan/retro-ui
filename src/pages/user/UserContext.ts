import {User, UserManager, UserManagerSettings} from "oidc-client-ts";
import {ApiConfig} from "../../config/ApiConfig";

const settings: UserManagerSettings = {
    authority: `${ApiConfig.authConfig().authority}`,
    client_id: `${ApiConfig.authConfig().clientId}`,
    redirect_uri: `${window.location.origin}/auth-redirect`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    silent_redirect_uri: `${window.location.origin}/silent-redirect`,
    includeIdTokenInSilentRenew: true,
};

export async function attemptSilentSignIn(): Promise<boolean> {
    return await userManager.signinSilent()
        .then((user) => !!user && !user.expired)
        .catch(() => false);
}

export async function getCurrentUser(): Promise<User | null> {
    return userManager.getUser()
        .then((user) => (user && !user.expired ? user : null))
        .catch(() => null);
}

export async function isAuthenticated(): Promise<boolean> {
    return await getCurrentUser()
        .then((user) => !!user && !user.expired)
        .catch(() => false);
}

export async function waitForAuthInitialization(): Promise<void> {
    if (await isAuthenticated()) {
        return;
    } else {
        await attemptSilentSignIn();
    }
}

export const userManager = new UserManager(settings);

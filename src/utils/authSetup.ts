import {waitForAuthInitialization, isAuthenticated, initiateLoginWithReturnUrl} from "../pages/user/UserContext.ts";

export async function ensureAuthenticatedApi(): Promise<void> {
    await waitForAuthInitialization();
}

export async function ensureAuthenticatedWithReturnUrl(): Promise<void> {
    await waitForAuthInitialization();

    if (!await isAuthenticated()) {
        await initiateLoginWithReturnUrl();
    }
}

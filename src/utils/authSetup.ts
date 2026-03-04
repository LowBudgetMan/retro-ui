import {waitForAuthInitialization, isAuthenticated, initiateLoginWithReturnUrl} from "../pages/user/UserContext.ts";

export async function ensureAuthenticatedApi(): Promise<void> {
    await waitForAuthInitialization();
}

export async function ensureAuthenticatedWithReturnUrl(): Promise<void> {
    await waitForAuthInitialization();

    if (!await isAuthenticated()) {
        await initiateLoginWithReturnUrl();
        // signinRedirect sets window.location but doesn't navigate immediately.
        // Return a never-resolving promise to prevent callers from continuing
        // with unauthenticated API calls before the browser navigates away.
        return new Promise<void>(() => {});
    }
}

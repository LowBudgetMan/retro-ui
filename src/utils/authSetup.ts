import {waitForAuthInitialization} from "../pages/user/UserContext.ts";

export async function ensureAuthenticatedApi(): Promise<void> {
    await waitForAuthInitialization();
}

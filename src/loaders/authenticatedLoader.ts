import {waitForAuthInitialization, isAuthenticated, initiateLoginWithReturnUrl} from "../pages/user/UserContext.ts";
import {getShareTokenForUrl} from "../services/anonymous-auth/AnonymousAuthService.ts";
import {waitForAppConfiguration} from "../config/ApiConfig.ts";
import {LoaderFunctionArgs} from "react-router-dom";

export async function authenticatedLoader({request}: LoaderFunctionArgs): Promise<null> {
    if (getShareTokenForUrl(request.url)) {
        await waitForAppConfiguration();
        return null;
    }

    await waitForAuthInitialization();

    if (!await isAuthenticated()) {
        const url = new URL(request.url);
        await initiateLoginWithReturnUrl(url.pathname + url.search);
        return new Promise<null>(() => {});
    }

    return null;
}

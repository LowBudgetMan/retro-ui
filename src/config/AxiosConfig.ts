import axios from "axios";
import {getUserManager} from "../pages/user/UserContext.ts";
import {waitForAppConfiguration} from "./ApiConfig";
import {getShareTokenForUrl} from "../services/anonymous-auth/AnonymousAuthService.ts";

export async function configureAxios() {
    await waitForAppConfiguration();

    axios.interceptors.request.use(async function (config) {
        const userManager = getUserManager();
        if (userManager) {
            await userManager.getUser()
                .then(user => {
                    if (user?.access_token) {
                        config.headers.setAuthorization(`Bearer ${user.access_token}`);
                    }
                })
                .catch(error => {
                    console.log('Error getting user token for request:', error)
                });
        }

        const shareToken = getShareTokenForUrl(config.url);
        if (shareToken) {
            config.headers.set('X-Share-Token', shareToken);
        }

        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
        return response;
    }, error => {
        if (error.response?.status === 401 && !getShareTokenForUrl(error.config?.url)) {
            getUserManager()?.signoutRedirect().then();
        }
        return Promise.reject(error);
    });
}

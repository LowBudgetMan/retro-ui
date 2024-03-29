import axios from "axios";
import {userManager} from "../pages/user/UserContext.ts";

export function configureAxios() {
    axios.interceptors.request.use(async function (config) {
        config.headers.setAuthorization(`Bearer ${(await userManager.getUser())?.access_token}`)
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
        return response;
    }, error => {
        if (error.response.status === 401) {
            userManager.signoutRedirect().then();
        }
        return Promise.reject(error);
    });
}
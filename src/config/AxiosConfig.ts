import axios from "axios";
import {getUserManager} from "../pages/user/UserContext.ts";
import {waitForAppConfiguration} from "./ApiConfig";

export async function configureAxios() {
    await waitForAppConfiguration();

    axios.interceptors.request.use(async function (config) {
        await getUserManager()?.getUser()
            .then(user => {
                if (user?.access_token) {
                    config.headers.setAuthorization(`Bearer ${user.access_token}`);
                }
            })
            .catch(error => {
                console.log('Error getting user token for request:', error)
            });
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
        return response;
    }, error => {
        if (error.response?.status === 401) {
            getUserManager()?.signoutRedirect().then();
        }
        return Promise.reject(error);
    });
}

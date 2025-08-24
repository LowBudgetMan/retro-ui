import axios from "axios";
import {userManager} from "../pages/user/UserContext.ts";

export function configureAxios() {
    axios.interceptors.request.use(async function (config) {
            await userManager.getUser()
                .then(user => {
                    if(user?.access_token) {
                        config.headers.setAuthorization(`Bearer ${user.access_token}`);
                    }
                })
                .catch(error => {console.log('Error getting user token for request:', error)});
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    axios.interceptors.response.use(response => {
        return response;
    }, error => {
        if (error.response?.status === 401) {
            userManager.signoutRedirect().then();
        }
        return Promise.reject(error);
    });
}

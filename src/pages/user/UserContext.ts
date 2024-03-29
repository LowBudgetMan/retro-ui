import {UserManager, UserManagerSettings} from "oidc-client-ts";

const settings: UserManagerSettings = {
    authority: 'http://localhost:8010/realms/myrealm',
    client_id: 'retroquest-web',
    redirect_uri: `${window.location.origin}/auth-redirect`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    // popup_redirect_uri: url + '/sample-popup-signin.html',
    // popup_post_logout_redirect_uri: url + '/sample-popup-signout.html',
    // silent_redirect_uri: url + '/sample-silent.html',
    //silentRequestTimeout: 10000,
};

export const userManager = new UserManager(settings);
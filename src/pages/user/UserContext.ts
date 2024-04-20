import {UserManager, UserManagerSettings} from "oidc-client-ts";

const settings: UserManagerSettings = {
    authority: 'http://localhost:8010/realms/myrealm',
    client_id: 'retroquest-web',
    redirect_uri: `${window.location.origin}/auth-redirect`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    automaticSilentRenew: true,
    filterProtocolClaims: true,
};

export const userManager = new UserManager(settings);
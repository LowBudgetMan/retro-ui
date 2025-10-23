import axios from "axios";
import {AuthConfig, RemoteConfig} from "./ApiConfigTypes.ts";

interface ApiConfig {
    baseApiUrl: () => string;
    websocketUrl: () => string;
    authConfig: () => AuthConfig;
}

const baseApiUrl = 'http://localhost:8080';
const remoteConfig = (await axios.get(`${baseApiUrl}/api/configuration`, {})).data as RemoteConfig;
const websocketUrl = `${remoteConfig.websocketEnvironmentConfig.baseUrl}/websocket/websocket`;
const localAuthConfig: AuthConfig = { ...remoteConfig.webAuthentication }

const getBaseApiUrl = () => {
    return baseApiUrl;
}

const getWebsocketUrl = () => {
    return websocketUrl;
}

const getAuthConfig = (): AuthConfig => {
    return localAuthConfig;
}

export const ApiConfig: ApiConfig = {
    baseApiUrl: getBaseApiUrl,
    websocketUrl: getWebsocketUrl,
    authConfig: getAuthConfig
}

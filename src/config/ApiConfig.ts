import axios from "axios";
import {AuthConfig, RemoteConfig} from "./ApiConfigTypes";

interface ApiConfig {
    baseApiUrl: () => string;
    websocketUrl: () => string;
    authConfig: () => AuthConfig;
}

const baseApiUrl = 'http://localhost:8080';

let websocketUrl: string
let localAuthConfig: AuthConfig
let isLoadingConfig = false;
let configLoadPromise: Promise<void> | null = null;

const getBaseApiUrl = () => {
    return baseApiUrl;
}

const isConfigured = () => {
    return websocketUrl != undefined && localAuthConfig != undefined;
}

const getWebsocketUrl = () => {
    if (!websocketUrl) {
        throw new Error('Configuration not initialized. Call initializeConfig() first.');
    }
    return websocketUrl;
}

const getAuthConfig = (): AuthConfig => {
    if (!localAuthConfig) {
        throw new Error('Configuration not initialized. Call initializeConfig() first.');
    }
    return localAuthConfig;
}

export async function initializeConfig(): Promise<void> {
    try {
        const remoteConfig = (await axios.get(`${getBaseApiUrl()}/api/configuration`)).data as RemoteConfig;
        websocketUrl = `${remoteConfig.websocketEnvironmentConfig.baseUrl}/websocket/websocket`;
        localAuthConfig = { ...remoteConfig.webAuthentication };
    } catch (error) {
        console.error('Failed to initialize configuration:', error);
        throw error;
    }
}

export async function waitForAppConfiguration(): Promise<void> {
    if (isConfigured()) {
        return Promise.resolve();
    }

    if (isLoadingConfig) {
        return configLoadPromise!;
    }

    isLoadingConfig = true;
    configLoadPromise = initializeConfig()
        .finally(() => {
            isLoadingConfig = false;
            configLoadPromise = null;
        });

    return configLoadPromise;
}

export const ApiConfig: ApiConfig = {
    baseApiUrl: getBaseApiUrl,
    websocketUrl: getWebsocketUrl,
    authConfig: getAuthConfig
}

import {fetchClient} from "../../config/FetchClient";
import {ApiConfig} from "../../config/ApiConfig";

export interface ApiToken {
    id: string;
    name: string;
    tokenPrefix: string;
    scopes: string[];
    createdAt: Date;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
}

export interface CreateTokenRequest {
    name: string;
    scopes: string[];
    expiresAt?: string;
}

export interface CreateTokenResponse {
    id: string;
    name: string;
    scopes: string[];
    expiresAt: string | null;
    tokenPrefix: string;
    token: string;
}

async function getTokens(teamId: string): Promise<ApiToken[]> {
    return fetchClient.get<ApiToken[]>(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/api-tokens`)
        .then(response => response.data.map(transform));
}

async function createToken(teamId: string, request: CreateTokenRequest): Promise<CreateTokenResponse> {
    return fetchClient.post<CreateTokenResponse>(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/api-tokens`, request)
        .then(response => response.data);
}

async function deleteToken(teamId: string, tokenId: string): Promise<void> {
    await fetchClient.delete(`${ApiConfig.baseApiUrl()}/api/teams/${teamId}/api-tokens/${tokenId}`);
}

function transform(token: ApiToken): ApiToken {
    return {
        ...token,
        createdAt: new Date(token.createdAt),
        expiresAt: token.expiresAt ? new Date(token.expiresAt) : null,
        lastUsedAt: token.lastUsedAt ? new Date(token.lastUsedAt) : null,
    };
}

export const ApiTokenService = {
    getTokens,
    createToken,
    deleteToken,
};

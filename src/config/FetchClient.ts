import {getUserManager, waitForAuthInitialization} from "../pages/user/UserContext.ts";
import {waitForAppConfiguration} from "./ApiConfig";
import {getShareTokenForUrl} from "../services/anonymous-auth/AnonymousAuthService.ts";

/**
 * Response shape returned by all {@link fetchClient} methods.
 * @typeParam T - The expected type of the parsed JSON body (defaults to `unknown`).
 */
export interface FetchResponse<T = unknown> {
    data: T;
    status: number;
    headers: Headers;
}

/**
 * Thrown on non-2xx responses so callers can reject on request failures.
 */
export class FetchError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.name = 'FetchError';
        this.status = status;
        this.data = data;
    }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<FetchResponse<T>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    await waitForAuthInitialization();
    const userManager = getUserManager();
    if (userManager) {
        try {
            const user = await userManager.getUser();
            if (user?.access_token) {
                headers['Authorization'] = `Bearer ${user.access_token}`;
            }
        } catch (error) {
            console.log('Error getting user token for request:', error);
        }
    }

    const shareToken = getShareTokenForUrl(url);
    if (shareToken) {
        headers['X-Share-Token'] = shareToken;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (response.status === 401 && !getShareTokenForUrl(url)) {
            getUserManager()?.signoutRedirect().then();
        }

        let errorData: unknown = null;
        try {
            errorData = await response.json();
        } catch {
            // empty or non-JSON response body
        }

        throw new FetchError(
            `Request failed with status ${response.status}`,
            response.status,
            errorData,
        );
    }

    let data: T = null as T;
    try {
        data = await response.json() as T;
    } catch {
        // empty body (e.g. 204 No Content)
    }

    return {data, status: response.status, headers: response.headers};
}

/**
 * Thin wrapper around the native Fetch API:
 * - Adds Bearer token and X-Share-Token headers per request when needed
 * - Throws {@link FetchError} on non-2xx responses
 * - Triggers signout on 401 (if no share token is passed)
 * - Returns a {@link FetchResponse} with the parsed body, status, and headers
 *
 * Must be initialized via {@link configureFetchClient} before use.
 *
 * @example
 * const response = await fetchClient.get<Retro[]>(url);
 * response.data.map(transformRetro);
 */
export const fetchClient = {
    get<T>(url: string): Promise<FetchResponse<T>> {
        return request<T>('GET', url);
    },
    post<T>(url: string, body?: unknown): Promise<FetchResponse<T>> {
        return request<T>('POST', url, body);
    },
    put<T>(url: string, body?: unknown): Promise<FetchResponse<T>> {
        return request<T>('PUT', url, body);
    },
    delete<T>(url: string): Promise<FetchResponse<T>> {
        return request<T>('DELETE', url);
    },
};

/** Gets app configuration before any fetchClient calls are made. Called once at startup. */
export async function configureFetchClient() {
    await waitForAppConfiguration();
}

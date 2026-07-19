import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManager, User } from 'oidc-client-ts';
import { fetchClient, configureFetchClient, FetchError } from './FetchClient';
import { getUserManager } from '../pages/user/UserContext';
import { getShareTokenForUrl } from '../services/anonymous-auth/AnonymousAuthService';
import { notifyToast } from '../context/toast/toastBus.ts';
import { ToastType } from '../context/toast/ToastContextTypes.ts';

vi.mock('../pages/user/UserContext', () => ({
    getUserManager: vi.fn(),
    waitForAuthInitialization: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./ApiConfig', () => ({
    waitForAppConfiguration: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/anonymous-auth/AnonymousAuthService', () => ({
    getShareTokenForUrl: vi.fn(),
}));

vi.mock('../context/toast/toastBus.ts', () => ({
    notifyToast: vi.fn(),
}));

const mockUserManager = {
    getUser: vi.fn(),
    signoutRedirect: vi.fn(),
} as unknown as UserManager;

vi.mocked(getUserManager).mockReturnValue(mockUserManager);

describe('FetchClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserManager).mockReturnValue(mockUserManager);
        (getShareTokenForUrl as Mock).mockReturnValue(null);
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({success: true}), {status: 200})
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('configureFetchClient', () => {
        it('should call waitForAppConfiguration', async () => {
            const {waitForAppConfiguration} = await import('./ApiConfig');
            await configureFetchClient();
            expect(waitForAppConfiguration).toHaveBeenCalled();
        });
    });

    describe('Request Headers', () => {
        it('should add Authorization header when user has access token', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);

            await fetchClient.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-token',
                }),
            }));
        });

        it('should not add Authorization header when user has no access token', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: ''} as User);

            await fetchClient.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            const callHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1]?.headers as Record<string, string>;
            expect(callHeaders['Authorization']).toBeUndefined();
        });

        it('should not add Authorization header when user is null', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue(null);

            await fetchClient.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            const callHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1]?.headers as Record<string, string>;
            expect(callHeaders['Authorization']).toBeUndefined();
        });

        it('should handle errors when getting user and continue with request', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            (mockUserManager.getUser as Mock).mockRejectedValue(new Error('User fetch failed'));

            await fetchClient.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('Error getting user token for request:', expect.any(Error));
            const callHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1]?.headers as Record<string, string>;
            expect(callHeaders['Authorization']).toBeUndefined();
        });

        it('should send both Bearer and X-Share-Token when authenticated user has share token for retro URL', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'jwt-token'} as User);
            (getShareTokenForUrl as Mock).mockReturnValue('share-token-123');

            await fetchClient.get('/teams/t1/retros/r1');

            expect(globalThis.fetch).toHaveBeenCalledWith('/teams/t1/retros/r1', expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer jwt-token',
                    'X-Share-Token': 'share-token-123',
                }),
            }));
        });

        it('should send only Bearer when authenticated user has no share token for URL', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'jwt-token'} as User);
            (getShareTokenForUrl as Mock).mockReturnValue(null);

            await fetchClient.get('/teams/t1');

            const callHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1]?.headers as Record<string, string>;
            expect(callHeaders['Authorization']).toBe('Bearer jwt-token');
            expect(callHeaders['X-Share-Token']).toBeUndefined();
        });

        it('should send only X-Share-Token when unauthenticated user has share token', async () => {
            vi.mocked(getUserManager).mockReturnValue(null as unknown as UserManager);
            (getShareTokenForUrl as Mock).mockReturnValue('share-token-456');

            await fetchClient.get('/teams/t1/retros/r1/thoughts');

            const callHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1]?.headers as Record<string, string>;
            expect(callHeaders['Authorization']).toBeUndefined();
            expect(callHeaders['X-Share-Token']).toBe('share-token-456');
        });
    });

    describe('Response Handling', () => {
        it('should return response data for successful responses', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({success: true}), {status: 200})
            );

            const response = await fetchClient.get('/test');

            expect(response.data).toEqual({success: true});
            expect(response.status).toBe(200);
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should handle empty body (204 No Content)', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(null, {status: 204})
            );

            const response = await fetchClient.put('/test');

            expect(response.data).toBeNull();
            expect(response.status).toBe(204);
        });

        it('should throw FetchError on non-2xx response', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Server Error'}), {status: 500})
            );

            await expect(fetchClient.get('/test')).rejects.toThrow(FetchError);
            await expect(fetchClient.get('/test')).rejects.toThrow('Request failed with status 500');
        });

        it('should call signoutRedirect when response status is 401', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            (mockUserManager.signoutRedirect as Mock).mockResolvedValue(undefined);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Unauthorized'}), {status: 401})
            );

            await expect(fetchClient.get('/test')).rejects.toThrow(FetchError);
            expect(mockUserManager.signoutRedirect).toHaveBeenCalledTimes(1);
        });

        it('should not call signoutRedirect when response status is not 401', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Forbidden'}), {status: 403})
            );

            await expect(fetchClient.get('/test')).rejects.toThrow(FetchError);
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should not call signoutRedirect on 401 when URL has a share token', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            (mockUserManager.signoutRedirect as Mock).mockResolvedValue(undefined);
            (getShareTokenForUrl as Mock).mockReturnValue('share-token-123');
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Unauthorized'}), {status: 401})
            );

            await expect(fetchClient.get('/teams/t1/retros/r1')).rejects.toThrow(FetchError);
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should call signoutRedirect on 401 when URL has no share token', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            (mockUserManager.signoutRedirect as Mock).mockResolvedValue(undefined);
            (getShareTokenForUrl as Mock).mockReturnValue(null);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Unauthorized'}), {status: 401})
            );

            await expect(fetchClient.get('/teams/t1')).rejects.toThrow(FetchError);
            expect(mockUserManager.signoutRedirect).toHaveBeenCalledTimes(1);
        });

        it('should notify a failure toast when signoutRedirect itself rejects', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            const redirectError = new Error('redirect failed');
            (mockUserManager.signoutRedirect as Mock).mockRejectedValue(redirectError);
            vi.mocked(globalThis.fetch).mockResolvedValue(
                new Response(JSON.stringify({error: 'Unauthorized'}), {status: 401})
            );

            await expect(fetchClient.get('/test')).rejects.toThrow(FetchError);
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(consoleSpy).toHaveBeenCalledWith('Error during signout redirect:', redirectError);
            expect(notifyToast).toHaveBeenCalledWith({
                message: "Your session has ended. Please refresh the page to continue.",
                type: ToastType.FAILURE,
            });

            consoleSpy.mockRestore();
        });

        it('should reject when fetch throws a network error', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(fetchClient.get('/test')).rejects.toThrow('Failed to fetch');
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });
    });

    describe('HTTP Methods', () => {
        beforeEach(() => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
        });

        it('should send GET request', async () => {
            await fetchClient.get('/test');
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({method: 'GET'}));
        });

        it('should send POST request with body', async () => {
            await fetchClient.post('/test', {key: 'value'});
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({key: 'value'}),
            }));
        });

        it('should send PUT request with body', async () => {
            await fetchClient.put('/test', {key: 'value'});
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({key: 'value'}),
            }));
        });

        it('should send DELETE request', async () => {
            await fetchClient.delete('/test');
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({method: 'DELETE'}));
        });

        it('should send POST request without body', async () => {
            await fetchClient.post('/test');
            expect(globalThis.fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
                method: 'POST',
                body: undefined,
            }));
        });
    });
});

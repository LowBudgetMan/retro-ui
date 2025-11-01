import {Mock, afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {User, UserManager} from 'oidc-client-ts';
import {configureAxios} from './AxiosConfig';
import {getUserManager} from '../pages/user/UserContext';

vi.mock('../pages/user/UserContext', () => ({
    getUserManager: vi.fn(),
}));

vi.mock('./ApiConfig', () => ({
    waitForAppConfiguration: vi.fn().mockResolvedValue(undefined),
}));

const mockUserManager = {
    getUser: vi.fn(),
    signoutRedirect: vi.fn(),
} as unknown as UserManager;

vi.mocked(getUserManager).mockReturnValue(mockUserManager);

describe('AxiosConfig', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        vi.clearAllMocks();
        axios.interceptors.request.clear();
        axios.interceptors.response.clear();
        mock = new MockAdapter(axios);
        configureAxios();
    });

    afterEach(() => {
        mock.restore();
    });

    describe('Request Interceptor', () => {
        it('should add Authorization header when user has access token', async () => {

            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            mock.onGet('/test').reply(200, {success: true});

            await axios.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-token');
        });

        it('should not add Authorization header when user has no access token', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: ''} as User);
            mock.onGet('/test').reply(200, {success: true});

            await axios.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
        });

        it('should not add Authorization header when user is null', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue(null);
            mock.onGet('/test').reply(200, {success: true});

            await axios.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
        });

        it('should handle errors when getting user and continue with request', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
            });
            (mockUserManager.getUser as Mock).mockRejectedValue(new Error('User fetch failed'));
            mock.onGet('/test').reply(200, {success: true});

            await axios.get('/test');

            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('Error getting user token for request:', expect.any(Error));
            expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
            consoleSpy.mockRestore();
        });

        it('should reject promise when request error handler is called', async () => {
            (mockUserManager.getUser as Mock).mockResolvedValue({access_token: 'test-token'} as User);
            mock.onGet('/test').reply(() => {
                throw new Error('Network error');
            });

            await expect(axios.get('/test')).rejects.toThrow('Network error');
            expect(mockUserManager.getUser).toHaveBeenCalledTimes(1);
        });
    });

    describe('Response Interceptor', () => {
        it('should return response as-is for successful responses', async () => {
            const mockResponse = {data: {success: true}, status: 200};
            mock.onGet('/test').reply(200, mockResponse.data);

            const response = await axios.get('/test');

            expect(response.data).toEqual(mockResponse.data);
            expect(response.status).toBe(200);
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should call signoutRedirect when response status is 401', async () => {
            (mockUserManager.signoutRedirect as Mock).mockResolvedValue(undefined);
            mock.onGet('/test').reply(401, {error: 'Unauthorized'});

            await expect(axios.get('/test')).rejects.toThrow();
            expect(mockUserManager.signoutRedirect).toHaveBeenCalledTimes(1);
        });

        it('should not call signoutRedirect when response status is not 401', async () => {
            mock.onGet('/test').reply(403, {error: 'Forbidden'});

            await expect(axios.get('/test')).rejects.toThrow();
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should not call signoutRedirect when error has no response', async () => {
            mock.onGet('/test').reply(() => {
                throw new Error('Network error');
            });

            await expect(axios.get('/test')).rejects.toThrow('Network error');
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });

        it('should not call signoutRedirect when error response has no status', async () => {
            mock.onGet('/test').reply(() => {
                const error = new Error('Server error') as Error & { response?: Record<string, unknown> };
                error.response = {};
                throw error;
            });

            await expect(axios.get('/test')).rejects.toThrow('Server error');
            expect(mockUserManager.signoutRedirect).not.toHaveBeenCalled();
        });
    });
});

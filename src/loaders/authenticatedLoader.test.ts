import {authenticatedLoader} from './authenticatedLoader';
import {waitForAuthInitialization, isAuthenticated, initiateLoginWithReturnUrl} from '../pages/user/UserContext';
import {getShareTokenForUrl} from '../services/anonymous-auth/AnonymousAuthService';
import {waitForAppConfiguration} from '../config/ApiConfig';
import {Mock} from 'vitest';

vi.mock('../pages/user/UserContext');
vi.mock('../services/anonymous-auth/AnonymousAuthService');
vi.mock('../config/ApiConfig');

const mockWaitForAuthInitialization = waitForAuthInitialization as Mock;
const mockIsAuthenticated = isAuthenticated as Mock;
const mockInitiateLoginWithReturnUrl = initiateLoginWithReturnUrl as Mock;
const mockGetShareTokenForUrl = getShareTokenForUrl as Mock;
const mockWaitForAppConfiguration = waitForAppConfiguration as Mock;

function makeArgs(url: string) {
    return {request: new Request(url), params: {}} as never;
}

describe('authenticatedLoader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetShareTokenForUrl.mockReturnValue(null);
        mockWaitForAuthInitialization.mockResolvedValue(undefined);
        mockIsAuthenticated.mockResolvedValue(true);
        mockInitiateLoginWithReturnUrl.mockResolvedValue(undefined);
        mockWaitForAppConfiguration.mockResolvedValue(undefined);
    });

    it('should return null for authenticated users', async () => {
        const result = await authenticatedLoader(makeArgs('http://localhost:3000/user'));
        expect(result).toBeNull();
        expect(mockWaitForAuthInitialization).toHaveBeenCalledTimes(1);
    });

    it('should redirect unauthenticated users and never resolve', async () => {
        mockIsAuthenticated.mockResolvedValue(false);

        const resultPromise = authenticatedLoader(makeArgs('http://localhost:3000/user'));

        // Wait for the login redirect to be called
        await vi.waitFor(() => {
            expect(mockInitiateLoginWithReturnUrl).toHaveBeenCalledWith('/user');
        });

        // Verify the promise never resolves
        const raceResult = await Promise.race([
            resultPromise,
            new Promise(resolve => setTimeout(() => resolve('timeout'), 10))
        ]);
        expect(raceResult).toBe('timeout');
    });

    it('should preserve query params in the return URL', async () => {
        mockIsAuthenticated.mockResolvedValue(false);

        authenticatedLoader(makeArgs('http://localhost:3000/invite?package=abc123'));

        await vi.waitFor(() => {
            expect(mockInitiateLoginWithReturnUrl).toHaveBeenCalledWith('/invite?package=abc123');
        });
    });

    it('should skip auth but wait for app configuration for share token users', async () => {
        mockGetShareTokenForUrl.mockReturnValue('some-share-token');

        const result = await authenticatedLoader(makeArgs('http://localhost:3000/teams/t1/retros/r1'));
        expect(result).toBeNull();
        expect(mockWaitForAppConfiguration).toHaveBeenCalledTimes(1);
        expect(mockWaitForAuthInitialization).not.toHaveBeenCalled();
        expect(mockIsAuthenticated).not.toHaveBeenCalled();
    });
});

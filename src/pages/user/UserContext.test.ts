import {describe, it, expect, vi, beforeEach} from 'vitest';

const mockSigninSilent = vi.fn();
const mockGetUser = vi.fn();
const mockRemoveUser = vi.fn().mockResolvedValue(undefined);
const mockUserSignedOut = vi.fn();

vi.mock('../../config/ApiConfig', () => ({
    waitForAppConfiguration: vi.fn().mockResolvedValue(undefined),
    ApiConfig: {
        authConfig: () => ({
            authority: 'https://dummy.auth.com',
            clientId: 'dummy-client',
        }),
        baseApiUrl: () => 'http://localhost:8080',
    },
}));

vi.mock('oidc-client-ts', () => {
    return {
        UserManager: class MockUserManager {
            signinSilent = mockSigninSilent;
            getUser = mockGetUser;
            removeUser = mockRemoveUser;
            events = {
                addUserSignedOut: mockUserSignedOut,
            };
        },
    };
});

describe('waitForAuthInitialization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    async function callWaitForAuthInitialization() {
        const {waitForAuthInitialization} = await import('./UserContext');
        return waitForAuthInitialization();
    }

    it('should attempt silent sign-in when user is not authenticated', async () => {
        mockGetUser.mockResolvedValue(null);
        mockSigninSilent.mockResolvedValue(null);

        await callWaitForAuthInitialization();

        expect(mockSigninSilent).toHaveBeenCalledTimes(1);
    });

    it('should attempt silent sign-in when user token is expired', async () => {
        mockGetUser.mockResolvedValue({expired: true, access_token: 'token'});
        mockSigninSilent.mockResolvedValue(null);

        await callWaitForAuthInitialization();

        expect(mockSigninSilent).toHaveBeenCalledTimes(1);
    });

    it('should not attempt silent sign-in when user is already authenticated', async () => {
        mockGetUser.mockResolvedValue({expired: false, access_token: 'token'});

        await callWaitForAuthInitialization();

        expect(mockSigninSilent).not.toHaveBeenCalled();
    });

    it('should not throw when silent sign-in fails', async () => {
        mockGetUser.mockResolvedValue(null);
        mockSigninSilent.mockRejectedValue(new Error('Silent sign-in failed'));

        await expect(callWaitForAuthInitialization()).resolves.not.toThrow();
    });
});

describe('registerCrossTabLogoutListener', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    async function registerAndFireSignedOutEvent() {
        const {registerCrossTabLogoutListener} = await import('./UserContext');
        registerCrossTabLogoutListener();

        const signedOutCallback = mockUserSignedOut.mock.calls[0][0];
        await signedOutCallback();
    }

    it('should remove user when signed out event fires', async () => {
        await registerAndFireSignedOutEvent();

        expect(mockRemoveUser).toHaveBeenCalledTimes(1);
    });

    it('should redirect to root when signed out event fires', async () => {
        await registerAndFireSignedOutEvent();

        expect(window.location.href).toContain('/');
    });
});

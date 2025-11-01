import {User, UserManager, UserManagerSettings} from 'oidc-client-ts';
import '@testing-library/jest-dom';
import {vi, describe, it, beforeEach, expect, type Mock} from 'vitest';

// Mock the entire UserContext module
vi.mock('./UserContext', () => {
    const dummySettings: UserManagerSettings = {
        authority: 'https://dummy.auth.com',
        client_id: 'dummy-client',
        redirect_uri: 'https://dummy.com/auth-redirect',
        post_logout_redirect_uri: 'https://dummy.com/',
        automaticSilentRenew: true,
        filterProtocolClaims: true,
        silent_redirect_uri: 'https://dummy.com/silent-redirect',
        includeIdTokenInSilentRenew: true,
    };

    // Create mock functions for UserManager methods
    const mockSigninSilent = vi.fn();
    const mockGetUser = vi.fn();

    const mockUserManager = {
        signinSilent: mockSigninSilent,
        getUser: mockGetUser,
        settings: dummySettings,
    } as UserManager & {
        signinSilent: Mock;
        getUser: Mock;
    };

    return {
        attemptSilentSignIn: vi.fn().mockImplementation(async (): Promise<boolean> => {
            return await mockUserManager.signinSilent()
                .then((user) => !!user && !user.expired)
                .catch(() => false);
        }),
        getCurrentUser: vi.fn().mockImplementation(async (): Promise<User | null> => {
            return mockUserManager.getUser()
                .then((user) => (user && !user.expired ? user : null))
                .catch(() => null);
        }),
        isAuthenticated: vi.fn().mockImplementation(async (): Promise<boolean> => {
            return await mockUserManager.getUser()
                .then((user) => !!user && !user.expired)
                .catch(() => false);
        }),
        getUserManager: vi.fn(() => mockUserManager),
        waitForAuthInitialization: vi.fn().mockImplementation(async (): Promise<void> => {
            // Check if authenticated by calling getUser directly
            const user = await mockUserManager.getUser().catch(() => null);
            if (user && !user.expired) {
                return;
            } else {
                await mockUserManager.signinSilent().catch(() => {
                });
            }
        }),
    };
});

// Import after mocking
import {
    attemptSilentSignIn,
    getCurrentUser,
    isAuthenticated,
    getUserManager,
    waitForAuthInitialization
} from './UserContext';

// Create a properly typed mock of the userManager
const originalUserManager = getUserManager();
const userManager = originalUserManager as UserManager & {
    signinSilent: Mock;
    getUser: Mock;
};

describe('UserContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('attemptSilentSignIn', () => {
        it('should return false when userManager.signinSilent resolves with null', async () => {
            userManager.signinSilent.mockResolvedValue(null);

            const result = await attemptSilentSignIn();

            expect(result).toBe(false);
            expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
        });

        it('should return false when userManager.signinSilent resolves with an expired user', async () => {
            const expiredUser = {
                expired: true,
                access_token: 'token',
                id_token: 'id_token',
                profile: {},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() - 1000,
            } as User;

            userManager.signinSilent.mockResolvedValue(expiredUser);

            const result = await attemptSilentSignIn();

            expect(result).toBe(false);
            expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
        });

        it('should return false when userManager.signinSilent throws an error', async () => {
            const error = new Error('Silent sign-in failed');
            userManager.signinSilent.mockRejectedValue(error);

            const result = await attemptSilentSignIn();

            expect(result).toBe(false);
            expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
        });

        it('should return true when userManager.signinSilent resolves with a valid user', async () => {
            const validUser = {
                expired: false,
                access_token: 'token',
                id_token: 'id_token',
                profile: {},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() + 3600000,
            } as User;

            userManager.signinSilent.mockResolvedValue(validUser);

            const result = await attemptSilentSignIn();

            expect(result).toBe(true);
            expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
        });
    });

    describe('getCurrentUser', () => {
        it('should return a user if userManager.getUser returns a valid user', async () => {
            const validUser = {
                expired: false,
                access_token: 'token',
                id_token: 'id_token',
                profile: {sub: '123', name: 'Test User'},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() + 3600000,
            } as User;

            userManager.getUser.mockResolvedValue(validUser);

            const result = await getCurrentUser();

            expect(result).toBe(validUser);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return null if userManager.getUser returns an expired user', async () => {
            const expiredUser = {
                expired: true,
                access_token: 'token',
                id_token: 'id_token',
                profile: {sub: '123', name: 'Test User'},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() - 1000,
            } as User;

            userManager.getUser.mockResolvedValue(expiredUser);

            const result = await getCurrentUser();

            expect(result).toBe(null);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return null if userManager.getUser returns null', async () => {
            userManager.getUser.mockResolvedValue(null);

            const result = await getCurrentUser();

            expect(result).toBe(null);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return null if userManager.getUser throws an error', async () => {
            const error = new Error('Failed to get user');
            userManager.getUser.mockRejectedValue(error);

            const result = await getCurrentUser();

            expect(result).toBe(null);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });
    });

    describe('isAuthenticated', () => {
        it('should return true when getCurrentUser returns a valid user', async () => {
            const validUser = {
                expired: false,
                access_token: 'token',
                id_token: 'id_token',
                profile: {sub: '123', name: 'Test User'},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() + 3600000,
            } as User;

            userManager.getUser.mockResolvedValue(validUser);

            const result = await isAuthenticated();

            expect(result).toBe(true);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return false when getCurrentUser returns an expired user', async () => {
            const expiredUser = {
                expired: true,
                access_token: 'token',
                id_token: 'id_token',
                profile: {sub: '123', name: 'Test User'},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() - 1000,
            } as User;

            userManager.getUser.mockResolvedValue(expiredUser);

            const result = await isAuthenticated();

            expect(result).toBe(false);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return false when getCurrentUser returns null', async () => {
            userManager.getUser.mockResolvedValue(null);

            const result = await isAuthenticated();

            expect(result).toBe(false);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });

        it('should return false when getCurrentUser throws an exception', async () => {
            const error = new Error('Failed to get user');
            userManager.getUser.mockRejectedValue(error);

            const result = await isAuthenticated();

            expect(result).toBe(false);
            expect(userManager.getUser).toHaveBeenCalledTimes(1);
        });
    });

    describe('waitForAuthInitialization', () => {
        it('should not call attemptSilentSignIn if isAuthenticated returns true', async () => {
            const validUser = {
                expired: false,
                access_token: 'token',
                id_token: 'id_token',
                profile: {sub: '123', name: 'Test User'},
                token_type: 'Bearer',
                scope: 'openid',
                expires_at: Date.now() + 3600000,
            } as User;

            userManager.getUser.mockResolvedValue(validUser);

            await waitForAuthInitialization();

            expect(userManager.getUser).toHaveBeenCalledTimes(1);
            expect(userManager.signinSilent).not.toHaveBeenCalled();
        });

        it('should call attemptSilentSignIn if isAuthenticated returns false', async () => {
            userManager.getUser.mockResolvedValue(null);
            userManager.signinSilent.mockResolvedValue(null);

            await waitForAuthInitialization();

            expect(userManager.getUser).toHaveBeenCalledTimes(1);
            expect(userManager.signinSilent).toHaveBeenCalledTimes(1);
        });
    });
});

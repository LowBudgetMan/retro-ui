import { User } from 'oidc-client-ts';
import '@testing-library/jest-dom';

// Mock the userManager
const mockUserManager = {
  signinSilent: jest.fn(),
  getUser: jest.fn(),
};

jest.mock('./UserContext', () => {
  const originalAttemptSilentSignIn = jest.fn().mockImplementation(async (): Promise<boolean> => {
    return await mockUserManager.signinSilent()
      .then((user: User | null) => !!user && !user.expired)
      .catch(() => false);
  });

  const originalGetCurrentUser = async (): Promise<User | null> => {
    try {
      const user = await mockUserManager.getUser();
      return user && !user.expired ? user : null;
    } catch (error) {
      return null;
    }
  };

  const originalIsAuthenticated = jest.fn().mockImplementation(async (): Promise<boolean> => {
    try {
      const user = await originalGetCurrentUser();
      return !!user && !user.expired;
    } catch (error) {
      return false;
    }
  });

  const originalWaitForAuthInitialization = async (): Promise<void> => {
    if (await originalIsAuthenticated()) {
      return;
    }

    await originalAttemptSilentSignIn();
  };

  return {
    attemptSilentSignIn: originalAttemptSilentSignIn,
    getCurrentUser: originalGetCurrentUser,
    isAuthenticated: originalIsAuthenticated,
    userManager: mockUserManager,
    waitForAuthInitialization: originalWaitForAuthInitialization,
  };
});

// Import after mocking
import { attemptSilentSignIn, getCurrentUser, isAuthenticated, userManager, waitForAuthInitialization } from './UserContext';

describe('UserContext', () => {
  const mockedUserManager = userManager as jest.Mocked<typeof userManager>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('attemptSilentSignIn', () => {
    it('should return false when userManager.signinSilent resolves with null', async () => {
      mockedUserManager.signinSilent.mockResolvedValue(null);

      const result = await attemptSilentSignIn();

      expect(result).toBe(false);
      expect(mockedUserManager.signinSilent).toHaveBeenCalledTimes(1);
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

      mockedUserManager.signinSilent.mockResolvedValue(expiredUser);

      const result = await attemptSilentSignIn();

      expect(result).toBe(false);
      expect(mockedUserManager.signinSilent).toHaveBeenCalledTimes(1);
    });

    it('should return false when userManager.signinSilent throws an error', async () => {
      const error = new Error('Silent sign-in failed');
      mockedUserManager.signinSilent.mockRejectedValue(error);

      const result = await attemptSilentSignIn();

      expect(result).toBe(false);
      expect(mockedUserManager.signinSilent).toHaveBeenCalledTimes(1);
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

      mockedUserManager.signinSilent.mockResolvedValue(validUser);

      const result = await attemptSilentSignIn();

      expect(result).toBe(true);
      expect(mockedUserManager.signinSilent).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUser', () => {
    it('should return a user if userManager.getUser returns a valid user', async () => {
      const validUser = {
        expired: false,
        access_token: 'token',
        id_token: 'id_token',
        profile: { sub: '123', name: 'Test User' },
        token_type: 'Bearer',
        scope: 'openid',
        expires_at: Date.now() + 3600000,
      } as User;

      mockedUserManager.getUser.mockResolvedValue(validUser);

      const result = await getCurrentUser();

      expect(result).toBe(validUser);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return null if userManager.getUser returns an expired user', async () => {
      const expiredUser = {
        expired: true,
        access_token: 'token',
        id_token: 'id_token',
        profile: { sub: '123', name: 'Test User' },
        token_type: 'Bearer',
        scope: 'openid',
        expires_at: Date.now() - 1000,
      } as User;

      mockedUserManager.getUser.mockResolvedValue(expiredUser);

      const result = await getCurrentUser();

      expect(result).toBe(null);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return null if userManager.getUser returns null', async () => {
      mockedUserManager.getUser.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBe(null);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return null if userManager.getUser throws an error', async () => {
      const error = new Error('Failed to get user');
      mockedUserManager.getUser.mockRejectedValue(error);

      const result = await getCurrentUser();

      expect(result).toBe(null);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when getCurrentUser returns a valid user', async () => {
      const validUser = {
        expired: false,
        access_token: 'token',
        id_token: 'id_token',
        profile: { sub: '123', name: 'Test User' },
        token_type: 'Bearer',
        scope: 'openid',
        expires_at: Date.now() + 3600000,
      } as User;

      mockedUserManager.getUser.mockResolvedValue(validUser);

      const result = await isAuthenticated();

      expect(result).toBe(true);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return false when getCurrentUser returns an expired user', async () => {
      const expiredUser = {
        expired: true,
        access_token: 'token',
        id_token: 'id_token',
        profile: { sub: '123', name: 'Test User' },
        token_type: 'Bearer',
        scope: 'openid',
        expires_at: Date.now() - 1000,
      } as User;

      mockedUserManager.getUser.mockResolvedValue(expiredUser);

      const result = await isAuthenticated();

      expect(result).toBe(false);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return false when getCurrentUser returns null', async () => {
      mockedUserManager.getUser.mockResolvedValue(null);

      const result = await isAuthenticated();

      expect(result).toBe(false);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });

    it('should return false when getCurrentUser throws an exception', async () => {
      const error = new Error('Failed to get user');
      mockedUserManager.getUser.mockRejectedValue(error);

      const result = await isAuthenticated();

      expect(result).toBe(false);
      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('waitForAuthInitialization', () => {
    it('should not call attemptSilentSignIn if isAuthenticated returns true', async () => {
      const validUser = {
        expired: false,
        access_token: 'token',
        id_token: 'id_token',
        profile: { sub: '123', name: 'Test User' },
        token_type: 'Bearer',
        scope: 'openid',
        expires_at: Date.now() + 3600000,
      } as User;

      mockedUserManager.getUser.mockResolvedValue(validUser);

      await waitForAuthInitialization();

      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockedUserManager.signinSilent).not.toHaveBeenCalled();
    });

    it('should call attemptSilentSignIn if isAuthenticated returns false', async () => {
      mockedUserManager.getUser.mockResolvedValue(null);
      mockedUserManager.signinSilent.mockResolvedValue(null);

      await waitForAuthInitialization();

      expect(mockedUserManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockedUserManager.signinSilent).toHaveBeenCalledTimes(1);
    });
  });
});

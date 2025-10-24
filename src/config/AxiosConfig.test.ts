import { vi } from 'vitest';
import { User } from 'oidc-client-ts';
import { configureAxios } from './AxiosConfig.ts';

// Mock userManager
vi.mock('../pages/user/UserContext.ts', () => ({
  userManager: {
    getUser: vi.fn(),
    signoutRedirect: vi.fn(),
  },
}));

// Mock axios interceptors
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual,
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    },
  };
});

// Import after mocking
import axios from 'axios';
import { userManager } from '../pages/user/UserContext.ts';

describe('AxiosConfig', () => {
  let requestInterceptor: (config: unknown) => Promise<unknown>;
  let responseInterceptor: (response: unknown) => unknown;
  let requestErrorHandler: (error: unknown) => Promise<never>;
  let responseErrorHandler: (error: unknown) => Promise<never>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Capture the interceptor functions when configureAxios is called
    (axios.interceptors.request.use as any).mockImplementation((successHandler: any, errorHandler: any) => {
      requestInterceptor = successHandler;
      requestErrorHandler = errorHandler;
    });

    (axios.interceptors.response.use as any).mockImplementation((successHandler: any, errorHandler: any) => {
      responseInterceptor = successHandler;
      responseErrorHandler = errorHandler;
    });
    
    configureAxios();
  });

  describe('Request Interceptor', () => {
    interface MockConfig {
      headers: {
        setAuthorization: any;
      };
    }

    let mockConfig: MockConfig;

    beforeEach(() => {
      mockConfig = {
        headers: {
          setAuthorization: vi.fn(),
        },
      };
    });

    it('should add Authorization header when user has access token', async () => {
      const mockUser: Partial<User> = {
        access_token: 'test-token',
      };

      (userManager.getUser as any).mockResolvedValue(mockUser);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).toHaveBeenCalledWith('Bearer test-token');
      expect(result).toBe(mockConfig);
    });

    it('should not add Authorization header when user has no access token', async () => {
      const mockUser: Partial<User> = {
        access_token: undefined,
      };

      (userManager.getUser as any).mockResolvedValue(mockUser);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);
    });

    it('should not add Authorization header when user is null', async () => {
      (userManager.getUser as any).mockResolvedValue(null);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);
    });

    it('should handle errors when getting user and continue with request', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation();
      const error = new Error('Failed to get user');

      (userManager.getUser as any).mockRejectedValue(error);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Error getting user token for request:', error);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);

      consoleLogSpy.mockRestore();
    });

    it('should reject promise when request error handler is called', async () => {
      const error = new Error('Request error');

      await expect(requestErrorHandler(error)).rejects.toBe(error);
    });
  });

  describe('Response Interceptor', () => {
    it('should return response as-is for successful responses', () => {
      const mockResponse = { data: 'test data', status: 200 };

      const result = responseInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('should call signoutRedirect when response status is 401', async () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      (userManager.signoutRedirect as any).mockResolvedValue(undefined);

      await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

      expect(userManager.signoutRedirect).toHaveBeenCalledTimes(1);
    });

    it('should not call signoutRedirect when response status is not 401', async () => {
      const mockError = {
        response: {
          status: 500,
        },
      };

      await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
    });

    it('should not call signoutRedirect when error has no response', async () => {
      const mockError = {
        message: 'Network error',
      };

      await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
    });

    it('should not call signoutRedirect when error response has no status', async () => {
      const mockError = {
        response: {},
      };

      await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
    });
  });

  describe('configureAxios', () => {
    it('should register both request and response interceptors', () => {
      expect(axios.interceptors.request.use).toHaveBeenCalledTimes(1);
      expect(axios.interceptors.response.use).toHaveBeenCalledTimes(1);
      expect(typeof requestInterceptor).toBe('function');
      expect(typeof responseInterceptor).toBe('function');
      expect(typeof requestErrorHandler).toBe('function');
      expect(typeof responseErrorHandler).toBe('function');
    });
  });
});

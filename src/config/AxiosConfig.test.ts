import '@jest/globals';
import { User } from 'oidc-client-ts';
import { configureAxios } from './AxiosConfig.ts';

// Mock userManager
jest.mock('../pages/user/UserContext.ts', () => ({
  userManager: {
    getUser: jest.fn(),
    signoutRedirect: jest.fn(),
  },
}));

// Mock axios interceptors
jest.mock('axios', () => ({
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
}));

// Import after mocking
import axios from 'axios';
import { userManager } from '../pages/user/UserContext.ts';

describe('AxiosConfig', () => {
  let requestInterceptor: any;
  let responseInterceptor: any;
  let requestErrorHandler: any;
  let responseErrorHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Capture the interceptor functions when configureAxios is called
    (axios.interceptors.request.use as jest.Mock).mockImplementation((successHandler, errorHandler) => {
      requestInterceptor = successHandler;
      requestErrorHandler = errorHandler;
    });
    
    (axios.interceptors.response.use as jest.Mock).mockImplementation((successHandler, errorHandler) => {
      responseInterceptor = successHandler;
      responseErrorHandler = errorHandler;
    });
    
    configureAxios();
  });

  describe('Request Interceptor', () => {
    let mockConfig: any;

    beforeEach(() => {
      mockConfig = {
        headers: {
          setAuthorization: jest.fn(),
        },
      };
    });

    it('should add Authorization header when user has access token', async () => {
      const mockUser: Partial<User> = {
        access_token: 'test-token',
      };

      (userManager.getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).toHaveBeenCalledWith('Bearer test-token');
      expect(result).toBe(mockConfig);
    });

    it('should not add Authorization header when user has no access token', async () => {
      const mockUser: Partial<User> = {
        access_token: undefined,
      };

      (userManager.getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);
    });

    it('should not add Authorization header when user is null', async () => {
      (userManager.getUser as jest.Mock).mockResolvedValue(null);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);
    });

    it('should handle errors when getting user and continue with request', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('Failed to get user');
      
      (userManager.getUser as jest.Mock).mockRejectedValue(error);

      const result = await requestInterceptor(mockConfig);

      expect(userManager.getUser).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Error getting user token for request:', error);
      expect(mockConfig.headers.setAuthorization).not.toHaveBeenCalled();
      expect(result).toBe(mockConfig);

      consoleLogSpy.mockRestore();
    });

    it('should reject promise when request error handler is called', () => {
      const error = new Error('Request error');

      const result = requestErrorHandler(error);

      expect(result).rejects.toBe(error);
    });
  });

  describe('Response Interceptor', () => {
    it('should return response as-is for successful responses', () => {
      const mockResponse = { data: 'test data', status: 200 };

      const result = responseInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('should call signoutRedirect when response status is 401', () => {
      const mockError = {
        response: {
          status: 401,
        },
      };

      (userManager.signoutRedirect as jest.Mock).mockResolvedValue(undefined);

      const result = responseErrorHandler(mockError);

      expect(userManager.signoutRedirect).toHaveBeenCalledTimes(1);
      expect(result).rejects.toBe(mockError);
    });

    it('should not call signoutRedirect when response status is not 401', () => {
      const mockError = {
        response: {
          status: 500,
        },
      };

      const result = responseErrorHandler(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
      expect(result).rejects.toBe(mockError);
    });

    it('should not call signoutRedirect when error has no response', () => {
      const mockError = {
        message: 'Network error',
      };

      const result = responseErrorHandler(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
      expect(result).rejects.toBe(mockError);
    });

    it('should not call signoutRedirect when error response has no status', () => {
      const mockError = {
        response: {},
      };

      const result = responseErrorHandler(mockError);

      expect(userManager.signoutRedirect).not.toHaveBeenCalled();
      expect(result).rejects.toBe(mockError);
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

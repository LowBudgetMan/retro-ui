import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RemoteConfig } from './ApiConfigTypes.ts';

// Mock axios before importing ApiConfig since it has top-level await
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
    },
  };
});

// Import axios after mocking
import axios from 'axios';

describe('ApiConfig', () => {
  const mockRemoteConfig: RemoteConfig = {
    websocketEnvironmentConfig: {
      baseUrl: 'wss://test-websocket.example.com',
    },
    webAuthentication: {
      authority: 'https://auth.example.com',
      clientId: 'test-client-id',
    },
  };

  const mockAxiosGet = vi.mocked(axios.get);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to ensure fresh import for each test
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Module Initialization with Remote Config', () => {
    it('should initialize successfully with valid remote config', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockRemoteConfig,
      } as { data: RemoteConfig });

      // Import the module to trigger the top-level await and axios call
      const { ApiConfig } = await import('./ApiConfig.ts');

      // Verify the axios call was made correctly
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'http://localhost:8080/api/configuration',
        {}
      );

      // Verify the module exports work correctly
      expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
      expect(ApiConfig.websocketUrl()).toBe(
        'wss://test-websocket.example.com/websocket/websocket'
      );
      expect(ApiConfig.authConfig()).toEqual({
        authority: 'https://auth.example.com',
        clientId: 'test-client-id',
      });
    });

    it('should handle axios error during initialization', async () => {
      const error = new Error('Network error');
      mockAxiosGet.mockRejectedValue(error);

      // The module should throw during import when axios fails
      await expect(async () => {
        await import('./ApiConfig.ts');
      }).rejects.toThrow('Network error');
    });

    it('should handle invalid response data', async () => {
      mockAxiosGet.mockResolvedValue({
        data: null,
      } as { data: null });

      await expect(async () => {
        await import('./ApiConfig.ts');
      }).rejects.toThrow();
    });

    it('should handle missing websocket config in remote response', async () => {
      const incompleteConfig: RemoteConfig = {
        websocketEnvironmentConfig: {
          baseUrl: '',
        },
        webAuthentication: {
          authority: 'https://auth.example.com',
          clientId: 'test-client-id',
        },
      };

      mockAxiosGet.mockResolvedValue({
        data: incompleteConfig,
      } as { data: RemoteConfig });

      const { ApiConfig } = await import('./ApiConfig.ts');

      expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
      expect(ApiConfig.websocketUrl()).toBe('/websocket/websocket');
      expect(ApiConfig.authConfig()).toEqual({
        authority: 'https://auth.example.com',
        clientId: 'test-client-id',
      });
    });

    it('should handle missing auth config in remote response', async () => {
      const incompleteConfig: RemoteConfig = {
        websocketEnvironmentConfig: {
          baseUrl: 'wss://test-websocket.example.com',
        },
        webAuthentication: {
          authority: '',
          clientId: '',
        },
      };

      mockAxiosGet.mockResolvedValue({
        data: incompleteConfig,
      } as { data: RemoteConfig });

      const { ApiConfig } = await import('./ApiConfig.ts');

      expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
      expect(ApiConfig.websocketUrl()).toBe(
        'wss://test-websocket.example.com/websocket/websocket'
      );
      expect(ApiConfig.authConfig()).toEqual({
        authority: '',
        clientId: '',
      });
    });

    it('should work with different remote configurations', async () => {
      const differentConfig: RemoteConfig = {
        websocketEnvironmentConfig: {
          baseUrl: 'wss://prod-websocket.example.com',
        },
        webAuthentication: {
          authority: 'https://prod-auth.example.com',
          clientId: 'prod-client-id',
        },
      };

      mockAxiosGet.mockResolvedValue({
        data: differentConfig,
      } as { data: RemoteConfig });

      const { ApiConfig } = await import('./ApiConfig.ts');

      expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
      expect(ApiConfig.websocketUrl()).toBe(
        'wss://prod-websocket.example.com/websocket/websocket'
      );
      expect(ApiConfig.authConfig()).toEqual({
        authority: 'https://prod-auth.example.com',
        clientId: 'prod-client-id',
      });
    });
  });

  describe('Exported Functions', () => {
    beforeEach(async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockRemoteConfig,
      } as { data: RemoteConfig });

      // Import fresh instance for each test
      await import('./ApiConfig.ts');
    });

    describe('baseApiUrl', () => {
      it('should return the correct base API URL', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
      });

      it('should return a string', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(typeof ApiConfig.baseApiUrl()).toBe('string');
      });

      it('should be a function', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(typeof ApiConfig.baseApiUrl).toBe('function');
      });
    });

    describe('websocketUrl', () => {
      it('should return the correct websocket URL', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(ApiConfig.websocketUrl()).toBe(
          'wss://test-websocket.example.com/websocket/websocket'
        );
      });

      it('should return a string', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(typeof ApiConfig.websocketUrl()).toBe('string');
      });

      it('should be a function', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(typeof ApiConfig.websocketUrl).toBe('function');
      });
    });

    describe('authConfig', () => {
      it('should return the correct auth configuration', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        const authConfig = ApiConfig.authConfig();
        expect(authConfig).toEqual({
          authority: 'https://auth.example.com',
          clientId: 'test-client-id',
        });
      });

      it('should return an AuthConfig object', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        const authConfig = ApiConfig.authConfig();
        expect(authConfig).toHaveProperty('authority');
        expect(authConfig).toHaveProperty('clientId');
        expect(typeof authConfig.authority).toBe('string');
        expect(typeof authConfig.clientId).toBe('string');
      });

      it('should be a function', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        expect(typeof ApiConfig.authConfig).toBe('function');
      });

      it('should return the same object instance each time', async () => {
        const { ApiConfig } = await import('./ApiConfig.ts');
        const authConfig1 = ApiConfig.authConfig();
        const authConfig2 = ApiConfig.authConfig();
        expect(authConfig1).toEqual(authConfig2);
        expect(authConfig1).toBe(authConfig2);
      });
    });
  });

  describe('Axios Call Details', () => {
    it('should make axios call with correct URL and options', async () => {
      mockAxiosGet.mockResolvedValue({
        data: mockRemoteConfig,
      } as { data: RemoteConfig });

      await import('./ApiConfig.ts');

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'http://localhost:8080/api/configuration',
        {}
      );
    });

    it('should handle axios timeout', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'TimeoutError';
      mockAxiosGet.mockRejectedValue(timeoutError);

      await expect(async () => {
        await import('./ApiConfig.ts');
      }).rejects.toThrow('Timeout');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockAxiosGet.mockRejectedValue(networkError);

      await expect(async () => {
        await import('./ApiConfig.ts');
      }).rejects.toThrow('Network Error');
    });
  });
});

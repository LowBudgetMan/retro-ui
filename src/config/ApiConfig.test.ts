import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {AuthConfig, RemoteConfig} from './ApiConfigTypes';

describe('ApiConfig', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        vi.resetModules();
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
        vi.clearAllMocks();
    });

    describe('ApiConfig.baseApiUrl', () => {
        it('should return the base API URL', async () => {
            const { ApiConfig } = await import('./ApiConfig');
            expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
        });

        it('should prioritize window.__BASE_API_URL__ over environment variable', async () => {
            // Set window property before module import
            (globalThis.window as Window).__BASE_API_URL__ = 'http://fromwindow.com';
            vi.resetModules();
            const { ApiConfig } = await import('./ApiConfig');
            expect(ApiConfig.baseApiUrl()).toBe('http://fromwindow.com');
            // Cleanup
            delete (globalThis.window as Window).__BASE_API_URL__;
        });
    });

    describe('ApiConfig.websocketUrl', () => {
        it('should throw error when configuration is not initialized', async () => {
            const { ApiConfig } = await import('./ApiConfig');
            expect(() => ApiConfig.websocketUrl()).toThrow('Configuration not initialized. Call initializeConfig() first.');
        });

        it('should return websocket URL when configuration is initialized', async () => {
            const { ApiConfig, initializeConfig } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            await initializeConfig();
            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/websocket/websocket');
        });
    });

    describe('ApiConfig.authConfig', () => {
        it('should throw error when configuration is not initialized', async () => {
            const { ApiConfig } = await import('./ApiConfig');
            expect(() => ApiConfig.authConfig()).toThrow('Configuration not initialized. Call initializeConfig() first.');
        });

        it('should return auth config when configuration is initialized', async () => {
            const { ApiConfig, initializeConfig } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            await initializeConfig();
            const expectedConfig: AuthConfig = { authority: 'auth.com', clientId: 'client1' };
            expect(ApiConfig.authConfig()).toEqual(expectedConfig);
        });
    });

    describe('initializeConfig', () => {
        it('should successfully initialize configuration', async () => {
            const { ApiConfig, initializeConfig } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            await expect(initializeConfig()).resolves.toBeUndefined();

            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/websocket/websocket');
            expect(ApiConfig.authConfig()).toEqual({ authority: 'auth.com', clientId: 'client1' });

            expect(mock.history.get[0].url).toBe('http://localhost:8080/api/configuration');
        });

        it('should throw error when HTTP request fails', async () => {
            const { initializeConfig } = await import('./ApiConfig');

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            mock.onGet('http://localhost:8080/api/configuration').networkError();

            await expect(initializeConfig()).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to initialize configuration:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it('should handle axios errors properly', async () => {
            const { initializeConfig } = await import('./ApiConfig');

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            mock.onGet('http://localhost:8080/api/configuration').reply(500, { error: 'Server error' });

            await expect(initializeConfig()).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to initialize configuration:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('waitForAppConfiguration', () => {
        it('should resolve immediately when already configured', async () => {
            const { initializeConfig, waitForAppConfiguration } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            // Initialize config first
            await initializeConfig();

            // Now waitForAppConfiguration should resolve immediately
            await expect(waitForAppConfiguration()).resolves.toBeUndefined();

            expect(mock.history.get).toHaveLength(1); // Only one call from initializeConfig
        });

        it('should initialize config when not configured', async () => {
            const { waitForAppConfiguration } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            await expect(waitForAppConfiguration()).resolves.toBeUndefined();

            expect(mock.history.get[0].url).toBe('http://localhost:8080/api/configuration');
        });



        it('should prevent duplicate initialization calls', async () => {
            const { waitForAppConfiguration } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            // Call waitForAppConfiguration multiple times concurrently
            const promises = Promise.all([
                waitForAppConfiguration(),
                waitForAppConfiguration(),
                waitForAppConfiguration()
            ]);

            await expect(promises).resolves.toEqual([undefined, undefined, undefined]);

            // Should only make one HTTP call despite multiple concurrent waits
            expect(mock.history.get).toHaveLength(1);
        });
    });

    describe('ApiConfig object interface', () => {
        it('should export all required methods', async () => {
            const { ApiConfig } = await import('./ApiConfig');
            expect(typeof ApiConfig.baseApiUrl).toBe('function');
            expect(typeof ApiConfig.websocketUrl).toBe('function');
            expect(typeof ApiConfig.authConfig).toBe('function');
        });

        it('should provide consistent API through all methods', async () => {
            const { ApiConfig, initializeConfig } = await import('./ApiConfig');

            const mockConfig: RemoteConfig = {
                websocketEnvironmentConfig: { baseUrl: 'ws://test.com' },
                webAuthentication: { authority: 'auth.com', clientId: 'client1' }
            };

            mock.onGet('http://localhost:8080/api/configuration').reply(200, mockConfig);

            // Base URL should work before configuration
            expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');

            await initializeConfig();

            // After configuration, all methods should work
            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/websocket/websocket');
            expect(ApiConfig.authConfig()).toEqual({ authority: 'auth.com', clientId: 'client1' });
        });
    });
});

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AuthConfig, RemoteConfig} from './ApiConfigTypes';

describe('ApiConfig', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.resetModules();
        fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    function mockFetchConfig(config: RemoteConfig) {
        fetchSpy.mockResolvedValue(
            new Response(JSON.stringify(config), {status: 200})
        );
    }

    const defaultMockConfig: RemoteConfig = {
        websocketEnvironmentConfig: {baseUrl: 'ws://test.com'},
        webAuthentication: {authority: 'auth.com', clientId: 'client1'}
    };

    describe('ApiConfig.baseApiUrl', () => {
        it('should return the base API URL', async () => {
            const {ApiConfig} = await import('./ApiConfig');
            expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');
        });

        it('should prioritize window.__BASE_API_URL__ over environment variable', async () => {
            // Set window property before module import
            (globalThis.window as Window).__BASE_API_URL__ = 'http://fromwindow.com';
            vi.resetModules();
            const {ApiConfig} = await import('./ApiConfig');
            expect(ApiConfig.baseApiUrl()).toBe('http://fromwindow.com');
            // Cleanup
            delete (globalThis.window as Window).__BASE_API_URL__;
        });
    });

    describe('ApiConfig.websocketUrl', () => {
        it('should throw error when configuration is not initialized', async () => {
            const {ApiConfig} = await import('./ApiConfig');
            expect(() => ApiConfig.websocketUrl()).toThrow('Configuration not initialized. Call initializeConfig() first.');
        });

        it('should return websocket URL when configuration is initialized', async () => {
            const {ApiConfig, initializeConfig} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            await initializeConfig();
            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/api/websocket');
        });
    });

    describe('ApiConfig.authConfig', () => {
        it('should throw error when configuration is not initialized', async () => {
            const {ApiConfig} = await import('./ApiConfig');
            expect(() => ApiConfig.authConfig()).toThrow('Configuration not initialized. Call initializeConfig() first.');
        });

        it('should return auth config when configuration is initialized', async () => {
            const {ApiConfig, initializeConfig} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            await initializeConfig();
            const expectedConfig: AuthConfig = {authority: 'auth.com', clientId: 'client1'};
            expect(ApiConfig.authConfig()).toEqual(expectedConfig);
        });
    });

    describe('initializeConfig', () => {
        it('should successfully initialize configuration', async () => {
            const {ApiConfig, initializeConfig} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            await expect(initializeConfig()).resolves.toBeUndefined();

            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/api/websocket');
            expect(ApiConfig.authConfig()).toEqual({authority: 'auth.com', clientId: 'client1'});

            expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8080/api/configuration');
        });

        it('should throw error when HTTP request fails', async () => {
            const {initializeConfig} = await import('./ApiConfig');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(initializeConfig()).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to initialize configuration:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });

        it('should handle server errors properly', async () => {
            const {initializeConfig} = await import('./ApiConfig');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            fetchSpy.mockResolvedValue(
                new Response(JSON.stringify({error: 'Server error'}), {status: 500})
            );

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
            const {initializeConfig, waitForAppConfiguration} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            await initializeConfig();
            await expect(waitForAppConfiguration()).resolves.toBeUndefined();

            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        it('should initialize config when not configured', async () => {
            const {waitForAppConfiguration} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            await expect(waitForAppConfiguration()).resolves.toBeUndefined();

            expect(fetchSpy).toHaveBeenCalledWith('http://localhost:8080/api/configuration');
        });

        it('should prevent duplicate initialization calls', async () => {
            const {waitForAppConfiguration} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            const promises = Promise.all([
                waitForAppConfiguration(),
                waitForAppConfiguration(),
                waitForAppConfiguration()
            ]);

            await expect(promises).resolves.toEqual([undefined, undefined, undefined]);

            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('ApiConfig object interface', () => {
        it('should export all required methods', async () => {
            const {ApiConfig} = await import('./ApiConfig');
            expect(typeof ApiConfig.baseApiUrl).toBe('function');
            expect(typeof ApiConfig.websocketUrl).toBe('function');
            expect(typeof ApiConfig.authConfig).toBe('function');
        });

        it('should provide consistent API through all methods', async () => {
            const {ApiConfig, initializeConfig} = await import('./ApiConfig');
            mockFetchConfig(defaultMockConfig);

            expect(ApiConfig.baseApiUrl()).toBe('http://localhost:8080');

            await initializeConfig();

            expect(ApiConfig.websocketUrl()).toBe('ws://test.com/api/websocket');
            expect(ApiConfig.authConfig()).toEqual({authority: 'auth.com', clientId: 'client1'});
        });
    });
});

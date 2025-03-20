import '@jest/globals';
import { Client } from '@stomp/stompjs';
import { WebsocketService } from './WebsocketService';
import { getConfig } from './WebsocketConfig';

// Mock the Client class from @stomp/stompjs
interface MockClient {
    connected: boolean;
    active: boolean;
    onConnect: ((frame: any) => void) | null;
    activate: jest.Mock;
    deactivate: jest.Mock;
    subscribe: jest.Mock;
}

const mockClient: MockClient = {
    connected: false,
    active: false,
    onConnect: null,
    activate: jest.fn().mockImplementation(function(this: MockClient) {
        // Simulate client connection
        this.connected = true;
        if (this.onConnect) {
            this.onConnect({});
        }
    }),
    deactivate: jest.fn().mockImplementation(() => Promise.resolve()),
    subscribe: jest.fn()
};

jest.mock('@stomp/stompjs', () => ({
    Client: jest.fn().mockImplementation(() => mockClient),
    IMessage: jest.fn()
}));

// Mock the WebsocketConfig
jest.mock('./WebsocketConfig', () => ({
    getConfig: jest.fn()
}));

describe('WebsocketService', () => {
    const mockConfig = {
        brokerURL: 'ws://localhost:8080/websocket/websocket',
        connectHeaders: {
            Authorization: 'Bearer test-token'
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Reset mock client state
        mockClient.connected = false;
        mockClient.active = false;
        mockClient.onConnect = null;
        
        // Setup mock config
        (getConfig as jest.Mock).mockResolvedValue(mockConfig);
    });

    describe('connect', () => {
        it('should create a new client and connect when not already connected', async () => {
            await WebsocketService.connect();

            expect(getConfig).toHaveBeenCalled();
            expect(Client).toHaveBeenCalledWith(mockConfig);
            expect(mockClient.activate).toHaveBeenCalled();
        });

        it('should not create a new client if already connected', async () => {
            mockClient.connected = true;
            
            await WebsocketService.connect();

            expect(Client).not.toHaveBeenCalled();
            expect(mockClient.activate).not.toHaveBeenCalled();
        });

        it('should set up onConnect handler', async () => {
            await WebsocketService.connect();

            expect(mockClient.onConnect).toBeDefined();
        });
    });

    describe('disconnect', () => {
        it('should deactivate client if active', async () => {
            mockClient.active = true;
            
            WebsocketService.disconnect();

            expect(mockClient.deactivate).toHaveBeenCalled();
        });

        it('should not deactivate client if not active', () => {
            mockClient.active = false;
            
            WebsocketService.disconnect();

            expect(mockClient.deactivate).not.toHaveBeenCalled();
        });
    });

    describe('subscribe', () => {
        const mockHandler = jest.fn();
        const destination = '/topic/test';
        const id = 'test-subscription';

        beforeEach(() => {
            // Reset subscriptions by disconnecting
            WebsocketService.disconnect();
        });

        it('should add subscription to list when client is not connected', () => {
            WebsocketService.subscribe(destination, id, mockHandler);

            // Verify subscription was added but not activated
            expect(mockClient.subscribe).not.toHaveBeenCalled();
        });

        it('should immediately subscribe when client is connected', async () => {
            // Connect first to ensure client is available
            await WebsocketService.connect();
            mockClient.connected = true;
            
            WebsocketService.subscribe(destination, id, mockHandler);

            expect(mockClient.subscribe).toHaveBeenCalledWith(
                destination,
                mockHandler,
                { id }
            );
        });

        it('should not add duplicate subscriptions with same id', async () => {
            // Connect first to ensure client is available
            await WebsocketService.connect();
            mockClient.connected = true;
            
            WebsocketService.subscribe(destination, id, mockHandler);
            WebsocketService.subscribe(destination, id, mockHandler);

            expect(mockClient.subscribe).toHaveBeenCalledTimes(1);
        });

        it('should handle subscription when client connects after subscribe is called', async () => {
            // Subscribe before connecting
            WebsocketService.subscribe(destination, id, mockHandler);
            
            // Connect the client
            await WebsocketService.connect();
            
            // Trigger the onConnect handler
            if (mockClient.onConnect) {
                mockClient.onConnect({} as any);
            }

            expect(mockClient.subscribe).toHaveBeenCalledWith(
                destination,
                mockHandler,
                { id }
            );
        });
    });
}); 
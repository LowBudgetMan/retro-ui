import { render } from '@testing-library/react';
import { RetroContextProvider } from './RetroContext';
import { WebsocketService } from '../../services/websocket/WebsocketService';
import { id } from '../../services/websocket/eventHandlers/ThoughtEventHandler';
import { useLoaderData } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useLoaderData: jest.fn()
}));

// Mock the WebSocket service
jest.mock('../../services/websocket/WebsocketService', () => ({
    WebsocketService: {
        subscribe: jest.fn(),
        unsubscribe: jest.fn()
    }
}));

// Mock the ThoughtEventHandler
jest.mock('../../services/websocket/eventHandlers/ThoughtEventHandler', () => ({
    id: 'test-thought-subscription-id',
    getDestination: jest.fn().mockReturnValue('/test/destination'),
    createThoughtEventHandler: jest.fn().mockReturnValue(jest.fn())
}));

describe('RetroContextProvider', () => {
    const mockRetro = {
        id: 'test-retro-id',
        teamId: 'test-team-id',
        finished: false,
        dateCreated: new Date(),
        thoughts: [],
        template: {
            id: 'test-template-id',
            name: 'Test Template',
            description: 'Test Description',
            categories: []
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useLoaderData as jest.Mock).mockReturnValue(mockRetro);
    });

    it('should subscribe to WebSocket events on mount', () => {
        render(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/test/destination',
            id,
            expect.any(Function)
        );
    });

    it('should unsubscribe from WebSocket events on unmount', () => {
        const { unmount } = render(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        unmount();

        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(id);
    });

    it('should resubscribe when retro ID changes', () => {
        const { rerender } = render(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        // Change the retro ID by rerendering with a different loader data
        const newRetro = { ...mockRetro, id: 'new-retro-id' };
        (useLoaderData as jest.Mock).mockReturnValue(newRetro);
        rerender(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        // Should have unsubscribed from old subscription and subscribed to new one
        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(id);
        expect(WebsocketService.subscribe).toHaveBeenCalledTimes(2);
    });
}); 
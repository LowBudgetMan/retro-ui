import {render, act} from '@testing-library/react';
import {RetroContextProvider, useRetro} from './RetroContext';
import { WebsocketService } from '../../services/websocket/WebsocketService';
import {Thought} from "../../services/RetroService.ts";
import {
    createThoughtSubscriptionId,
    deleteThoughtSubscriptionId,
    updateThoughtSubscriptionId
} from '../../services/websocket/eventHandlers/ThoughtEventHandler';
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
    createThoughtSubscriptionId: 'create-thought-subscription-id',
    updateThoughtSubscriptionId: 'update-thought-subscription-id',
    deleteThoughtSubscriptionId: 'delete-thought-subscription-id',
    getDestination: jest.fn().mockReturnValue('/test/destination'),
    createThoughtEventHandler: jest.fn().mockReturnValue(jest.fn()),
    updateThoughtEventHandler: jest.fn().mockReturnValue(jest.fn()),
    deleteThoughtEventHandler: jest.fn().mockReturnValue(jest.fn())
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
            createThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/test/destination',
            updateThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/test/destination',
            deleteThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledTimes(3);
    });

    it('should unsubscribe from WebSocket events on unmount', () => {
        const { unmount } = render(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        unmount();

        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(createThoughtSubscriptionId);
        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(updateThoughtSubscriptionId);
        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(deleteThoughtSubscriptionId);
        expect(WebsocketService.unsubscribe).toHaveBeenCalledTimes(3);
    });

    it('should resubscribe when retro ID changes', () => {
        const { rerender } = render(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        // Change the retro ID by rerendering with different loader data
        const newRetro = { ...mockRetro, id: 'new-retro-id' };
        (useLoaderData as jest.Mock).mockReturnValue(newRetro);
        rerender(
            <RetroContextProvider>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(createThoughtSubscriptionId);
        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(updateThoughtSubscriptionId);
        expect(WebsocketService.unsubscribe).toHaveBeenCalledWith(deleteThoughtSubscriptionId);
        expect(WebsocketService.subscribe).toHaveBeenCalledTimes(6);
    });
});

describe('useRetro state updates', () => {
    const mockRetro = {
        id: 'test-retro-id',
        teamId: 'test-team-id',
        finished: false,
        dateCreated: new Date(),
        thoughts: [{ id: '1', message: 'Existing thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: new Date() }],
        template: {
            id: 'test-template-id',
            name: 'Test Template',
            description: 'Test Description',
            categories: []
        }
    };

    beforeEach(() => {
        (useLoaderData as jest.Mock).mockReturnValue(mockRetro);
    });

    const TestComponent = ({ onUpdate }: { onUpdate: (value: ReturnType<typeof useRetro>) => void }) => {
        const retroContext = useRetro();
        onUpdate(retroContext);
        return null;
    };

    it('should create a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const newThought: Thought = { id: '2', message: 'New thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: new Date() };
        act(() => {
            contextValue.createThought(newThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(2);
        expect(contextValue.retro.thoughts[1]).toEqual(newThought);
    });

    it('should update a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const updatedThought: Thought = { id: '1', message: 'Updated thought', category: 'happy', votes: 1, completed: true, retroId: 'test-retro-id', createdAt: new Date() };
        act(() => {
            contextValue.updateThought(updatedThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(1);
        expect(contextValue.retro.thoughts[0]).toEqual(updatedThought);
    });

    it('should not update a thought if not found', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const updatedThought: Thought = { id: '2', message: 'Updated thought', category: 'happy', votes: 1, completed: true, retroId: 'test-retro-id', createdAt: new Date() };
        act(() => {
            contextValue.updateThought(updatedThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(1);
        expect(contextValue.retro.thoughts[0]).not.toEqual(updatedThought);
    });

    it('should delete a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const thoughtToDelete: Thought = { id: '1', message: 'Existing thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: new Date() };
        act(() => {
            contextValue.deleteThought(thoughtToDelete);
        });

        expect(contextValue.retro.thoughts).toHaveLength(0);
    });
});

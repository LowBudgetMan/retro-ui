import { vi } from 'vitest';
import {act, render} from '@testing-library/react';
import {RetroContextProvider} from './RetroContext.tsx';
import {useRetro} from "../hooks.tsx";
import {Thought} from "../../services/retro-service/RetroService.ts";
import {DateTime} from "luxon";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {
    createThoughtSubscriptionId,
    updateThoughtSubscriptionId,
    deleteThoughtSubscriptionId
} from "../../services/websocket/constants/thoughts.ts";

vi.mock('../../services/websocket/WebsocketService.ts', () => ({
    WebsocketService: {
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
    }
}));

describe('RetroContextProvider', () => {
    const mockRetro = {
        id: 'test-retro-id',
        teamId: 'test-team-id',
        finished: false,
        createdAt: DateTime.now(),
        thoughts: [],
        template: {
            id: 'test-template-id',
            name: 'Test Template',
            description: 'Test Description',
            categories: []
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should subscribe to WebSocket events on mount', () => {
        render(
            <RetroContextProvider retro={mockRetro}>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        // TODO: These should probably check to make sure that the callbacks are set up to track the right events
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/topic/test-retro-id.thoughts',
            createThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/topic/test-retro-id.thoughts',
            updateThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/topic/test-retro-id.thoughts',
            deleteThoughtSubscriptionId,
            expect.any(Function)
        );
        expect(WebsocketService.subscribe).toHaveBeenCalledTimes(3);
    });

    it('should unsubscribe from WebSocket events on unmount', () => {
        const { unmount } = render(
            <RetroContextProvider retro={mockRetro}>
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
            <RetroContextProvider retro={mockRetro}>
                <div>Test Child</div>
            </RetroContextProvider>
        );

        // Change the retro ID by rerendering with different loader data
        rerender(
            <RetroContextProvider retro={{...mockRetro, id: 'new-retro-id'}}>
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
        createdAt: DateTime.now(),
        thoughts: [{ id: '1', message: 'Existing thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: DateTime.now() }],
        template: {
            id: 'test-template-id',
            name: 'Test Template',
            description: 'Test Description',
            categories: []
        }
    };

    const TestComponent = ({ onUpdate }: { onUpdate: (value: ReturnType<typeof useRetro>) => void }) => {
        const retroContext = useRetro();
        onUpdate(retroContext);
        return null;
    };

    it('should create a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider retro={mockRetro}>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const newThought: Thought = { id: '2', message: 'New thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: DateTime.now() };
        act(() => {
            contextValue.createThought(newThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(2);
        expect(contextValue.retro.thoughts[1]).toEqual(newThought);
    });

    it('should update a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider retro={mockRetro}>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const updatedThought: Thought = { id: '1', message: 'Updated thought', category: 'happy', votes: 1, completed: true, retroId: 'test-retro-id', createdAt: DateTime.now() };
        act(() => {
            contextValue.updateThought(updatedThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(1);
        expect(contextValue.retro.thoughts[0]).toEqual(updatedThought);
    });

    it('should not update a thought if not found', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider retro={mockRetro}>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const updatedThought: Thought = { id: '2', message: 'Updated thought', category: 'happy', votes: 1, completed: true, retroId: 'test-retro-id', createdAt: DateTime.now() };
        act(() => {
            contextValue.updateThought(updatedThought);
        });

        expect(contextValue.retro.thoughts).toHaveLength(1);
        expect(contextValue.retro.thoughts[0]).not.toEqual(updatedThought);
    });

    it('should delete a thought', () => {
        let contextValue: ReturnType<typeof useRetro> = null!;
        render(
            <RetroContextProvider retro={mockRetro}>
                <TestComponent onUpdate={(value) => (contextValue = value)} />
            </RetroContextProvider>
        );

        const thoughtToDelete: Thought = { id: '1', message: 'Existing thought', category: 'happy', votes: 0, completed: false, retroId: 'test-retro-id', createdAt: DateTime.now() };
        act(() => {
            contextValue.deleteThought(thoughtToDelete);
        });

        expect(contextValue.retro.thoughts).toHaveLength(0);
    });
});

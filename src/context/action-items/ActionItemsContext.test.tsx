import { vi } from 'vitest';
import {act, render} from '@testing-library/react';
import { ActionItemsContextProvider } from './ActionItemsContext.tsx';
import { useActionItems } from '../hooks.tsx';
import { ActionItem } from '../../services/action-items-service/ActionItemsService.ts';
import { WebsocketService } from '../../services/websocket/WebsocketService.ts';
import { DateTime } from 'luxon';

vi.mock('../../services/websocket/WebsocketService.ts', () => ({
    WebsocketService: {
        subscribe: vi.fn().mockReturnValue(vi.fn()),
    }
}));

describe('ActionItemsContextProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const teamId = 'team-1'
    const mockActionItems: ActionItem[] = [
        { id: '1', action: 'Test Action Item 1', completed: false, teamId: teamId, assignee: 'user-1', createdAt: DateTime.now() },
        { id: '2', action: 'Test Action Item 2', completed: true, teamId: teamId, assignee: 'user-2', createdAt: DateTime.now() },
    ];

    const TestComponent = () => {
        const { actionItems } = useActionItems();
        return (
            <div>
                {actionItems.map(item => (
                    <div key={item.id}>{item.action}</div>
                ))}
            </div>
        );
    };

    it('should render initial action items passed from the properties', () => {
        const { getByText } = render(
            <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                <TestComponent />
            </ActionItemsContextProvider>
        );

        expect(getByText('Test Action Item 1')).toBeInTheDocument();
        expect(getByText('Test Action Item 2')).toBeInTheDocument();
    });

    it('should subscribe to WebSocket events on mount', () => {
        render(
            <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                <div>Test Child</div>
            </ActionItemsContextProvider>
        );

        expect(WebsocketService.subscribe).toHaveBeenCalledTimes(1);
        expect(WebsocketService.subscribe).toHaveBeenCalledWith(
            '/topic/teams.team-1.action-items',
            expect.objectContaining({
                transform: expect.any(Function),
                CREATE: expect.any(Function),
                UPDATE: expect.any(Function),
                DELETE: expect.any(Function),
            })
        );
    });

    it('should unsubscribe from websocket events on unmount', () => {
        const unsubscribe = vi.fn();
        vi.mocked(WebsocketService.subscribe).mockReturnValue(unsubscribe);

        const { unmount } = render(
            <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                <div>Test Child</div>
            </ActionItemsContextProvider>
        );

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });

    describe('useActionItems state updates', () => {
        const TestComponent = ({ onUpdate }: { onUpdate: (value: ReturnType<typeof useActionItems>) => void }) => {
            const actionItemContext = useActionItems();
            onUpdate(actionItemContext);
            return null;
        }

        it('should add an action item on CREATE event', () => {
            let contextValue: ReturnType<typeof useActionItems> = null!;
            render(
                <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                    <TestComponent onUpdate={(value) => (contextValue = value)} />
                </ActionItemsContextProvider>
            );

            const newActionItem: ActionItem = {
                id: "itemId",
                action: "Try new task",
                assignee: "me",
                completed: false,
                createdAt: DateTime.now(),
                teamId: "teamId"
            }
            act(() => {
                contextValue.createActionItem(newActionItem);
            });

            expect(contextValue.actionItems).toHaveLength(3);
            expect(contextValue.actionItems[2]).toEqual(newActionItem);
        });

        it('should update an action item', () => {
            let contextValue: ReturnType<typeof useActionItems> = null!;
            render(
                <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                    <TestComponent onUpdate={(value) => (contextValue = value)} />
                </ActionItemsContextProvider>
            );

            const updatedActionItem: ActionItem = {...mockActionItems[1], action: 'Updated action'};
            act(() => {
                contextValue.updateActionItem(updatedActionItem);
            });

            expect(contextValue.actionItems).toHaveLength(2);
            expect(contextValue.actionItems[1]).toEqual(updatedActionItem);
        });

        it('should delete an action item', () => {
            let contextValue: ReturnType<typeof useActionItems> = null!;
            render(
                <ActionItemsContextProvider teamId={teamId} actionItems={mockActionItems}>
                    <TestComponent onUpdate={(value) => (contextValue = value)} />
                </ActionItemsContextProvider>
            );

            act(() => {
                contextValue.deleteActionItem(mockActionItems[1]);
            });

            expect(contextValue.actionItems).toHaveLength(1);
            expect(contextValue.actionItems[0]).toEqual(mockActionItems[0]);
        });
    });
});

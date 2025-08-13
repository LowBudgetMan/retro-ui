import { render } from '@testing-library/react';
import { ActionItemsContextProvider } from './ActionItemsContext.tsx';
import { useActionItems } from '../hooks.tsx';
import { ActionItem } from '../../services/action-items-service/ActionItemsService.ts';

describe('ActionItemsContextProvider', () => {
    const mockActionItems: ActionItem[] = [
        { id: '1', action: 'Test Action Item 1', completed: false, teamId: 'team-1', assignee: 'user-1', createdAt: new Date() },
        { id: '2', action: 'Test Action Item 2', completed: true, teamId: 'team-1', assignee: 'user-2', createdAt: new Date() },
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
            <ActionItemsContextProvider actionItems={mockActionItems}>
                <TestComponent />
            </ActionItemsContextProvider>
        );

        expect(getByText('Test Action Item 1')).toBeInTheDocument();
        expect(getByText('Test Action Item 2')).toBeInTheDocument();
    });
});

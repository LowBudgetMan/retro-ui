import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ActionItemsTab } from './ActionItemsTab.tsx';
import { useActionItems } from '../../../../context/hooks.tsx';
import { ActionItemsService } from '../../../../services/action-items-service/ActionItemsService.ts';
import { DateTime } from 'luxon';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('../../../../context/hooks.tsx');
vi.mock('../../../../services/action-items-service/ActionItemsService.ts');

vi.mock('./ActionItemsTab.module.css', () => ({
    default: {
        container: 'container',
        containerOpen: 'containerOpen',
        containerClosed: 'containerClosed',
        tab: 'tab',
        content: 'content',
    }
}));

const useActionItemsMock = useActionItems as any;
const createActionItemMock = ActionItemsService.createActionItem as any;

describe('ActionItemsTab', () => {
    beforeEach(() => {
        useActionItemsMock.mockReturnValue({teamId: '123', actionItems: []});
        createActionItemMock.mockClear();
    });

    it('should render', () => {
        render(<ActionItemsTab />);

        expect(screen.getByRole('button', { name: `Action Items`})).toBeInTheDocument();
    });

    it('should open and close the tab', () => {
        const { container } = render(<ActionItemsTab />);

        const tab = screen.getByRole('button', { name: `Action Items`});
        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerOpen');

        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerClosed');
    });

    it('should display action items', () => {
        const actionItems = [
            {id: '1', action: 'Do a thing', createdAt: DateTime.now()},
            {id: '2', action: 'Do another thing', createdAt: DateTime.now()}
        ];
        useActionItemsMock.mockReturnValue({teamId: '123', actionItems});
        render(<ActionItemsTab />);

        const tab = screen.getByRole('button', { name: `Action Items`});
        fireEvent.click(tab);

        expect(screen.getByText('Do a thing')).toBeInTheDocument();
        expect(screen.getByText('Do another thing')).toBeInTheDocument();
    });

    it('should close the tab on escape key press', () => {
        const { container } = render(<ActionItemsTab />);

        const tab = screen.getByRole('button', { name: `Action Items`});
        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerOpen');

        fireEvent.keyDown(document, {key: 'Escape'});

        expect(container.firstChild).toHaveClass('containerClosed');
    });

    describe('Action Item Form', () => {
        it('should render the action item form', () => {
            render(<ActionItemsTab />);

            const tab = screen.getByRole('button', { name: `Action Items`});
            fireEvent.click(tab);

            expect(screen.getByPlaceholderText('Enter Action Item')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter Assignee')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
        });

        it('should submit the form and clear the inputs', async () => {
            createActionItemMock.mockResolvedValue({});
            render(<ActionItemsTab />);

            const tab = screen.getByRole('button', { name: `Action Items`});
            fireEvent.click(tab);

            const actionItemInput = screen.getByPlaceholderText('Enter Action Item');
            const assigneeInput = screen.getByPlaceholderText('Enter Assignee');
            const addButton = screen.getByRole('button', { name: 'Add' });

            fireEvent.change(actionItemInput, { target: { value: 'New Action Item' } });
            fireEvent.change(assigneeInput, { target: { value: 'Test User' } });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(createActionItemMock).toHaveBeenCalledWith('123', 'New Action Item', 'Test User');
            });

            expect(actionItemInput).toHaveValue('');
            expect(assigneeInput).toHaveValue('');
        });

        it('should not submit the form if the required fields are empty', () => {
            render(<ActionItemsTab />);

            const tab = screen.getByRole('button', { name: `Action Items`});
            fireEvent.click(tab);

            const addButton = screen.getByRole('button', { name: 'Add' });
            fireEvent.click(addButton);

            expect(createActionItemMock).not.toHaveBeenCalled();
        });

        it('should log an error and not clear the inputs when the form submission fails', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            createActionItemMock.mockRejectedValue({ status: 400 });
            render(<ActionItemsTab />);

            const tab = screen.getByRole('button', { name: `Action Items`});
            fireEvent.click(tab);

            const actionItemInput = screen.getByPlaceholderText('Enter Action Item');
            const assigneeInput = screen.getByPlaceholderText('Enter Assignee');
            const addButton = screen.getByRole('button', { name: 'Add' });

            fireEvent.change(actionItemInput, { target: { value: 'New Action Item' } });
            fireEvent.change(assigneeInput, { target: { value: 'Test User' } });
            fireEvent.click(addButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating team:', { status: 400 });
            });

            expect(actionItemInput).toHaveValue('New Action Item');
            expect(assigneeInput).toHaveValue('Test User');

            consoleErrorSpy.mockRestore();
        });
    });
})

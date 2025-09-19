import {act, fireEvent, render, screen} from "@testing-library/react";
import {ActionItemCard} from "./ActionItemCard.tsx";
import {ActionItem, ActionItemsService} from "../../../../../services/action-items-service/ActionItemsService.ts";
import { DateTime } from "luxon";

jest.mock("../../../../../services/action-items-service/ActionItemsService.ts");
const mockedActionItemsService = ActionItemsService as jest.Mocked<typeof ActionItemsService>;

const currentTime = DateTime.now();

describe('ActionItemCard', () => {
    const actionItem: ActionItem = {
        id: 'actionItemId',
        action: 'This is a test action item',
        assignee: 'Test User',
        completed: false,
        teamId: 'teamId',
        createdAt: currentTime
    }

    it('should display the action of the action item', () => {
        render(<ActionItemCard actionItem={actionItem}/>);
        expect(screen.getByText('This is a test action item')).toBeInTheDocument();
    });

    it('should display the assignee of the action item', () => {
        render(<ActionItemCard actionItem={actionItem}/>);
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('should display the creation date of the action item', () => {
        render(<ActionItemCard actionItem={actionItem}/>);
        expect(screen.getByText(currentTime.toLocaleString())).toBeInTheDocument();
    });

    it('should display "N" when action item is not completed', () => {
        const incompleteActionItem: ActionItem = {
            ...actionItem,
            completed: false,
        }
        render(<ActionItemCard actionItem={incompleteActionItem}/>);

        expect(screen.getByText('N')).toBeInTheDocument();
    });

    it('should display "C" when action item is completed', () => {
        const completeActionItem: ActionItem = {
            ...actionItem,
            completed: true,
        }
        render(<ActionItemCard actionItem={completeActionItem}/>);

        expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('should call ActionItemsService.setCompleted with inverse of completed when mark complete button is clicked', () => {
        mockedActionItemsService.setCompleted = jest.fn().mockResolvedValue(undefined);
        render(<ActionItemCard actionItem={actionItem}/>);

        fireEvent.click(screen.getByText('N'));

        expect(mockedActionItemsService.setCompleted).toHaveBeenCalledWith(
            actionItem.teamId,
            actionItem.id,
            !actionItem.completed
        );
    });

    describe('Edit functionality', () => {
        beforeEach(() => {
            mockedActionItemsService.setAction = jest.fn().mockResolvedValue(undefined);
        });

        it('should display paragraph element when not in edit mode', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            const messageElement = screen.getByText('This is a test action item');
            expect(messageElement.tagName).toBe('P');
            expect(screen.queryByRole('textbox', {name: ''})).not.toBeInTheDocument();
        });

        it('should switch from paragraph to textarea when edit button is clicked', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            const messageElement = screen.getByText('This is a test action item');
            expect(messageElement.tagName).toBe('TEXTAREA');
            expect(screen.queryByText('This is a test action item', { selector: 'p' })).not.toBeInTheDocument();
        });

        it('should update textarea value when user types', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            const textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated thought message' } });

            expect(textarea.value).toBe('Updated thought message');
        });

        it('should call ActionItemsService.setAction and exit edit mode when Enter is pressed without Shift', async () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            const textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message' } });

            await act(async () => {
                fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
                await Promise.resolve();
            });

            expect(mockedActionItemsService.setAction).toHaveBeenCalledWith(
                actionItem.teamId,
                actionItem.id,
                'Updated message'
            );
        });

        it('should NOT call ActionItemsService.setAction when Enter is pressed WITH Shift', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            const textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message' } });
            fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

            expect(mockedActionItemsService.setAction).not.toHaveBeenCalled();
            expect(screen.getByRole('textbox', {name: ''})).toBeInTheDocument();
        });

        it('should exit edit mode and revert to original message when edit button is clicked again without submitting', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            const textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Changed but not submitted' } });
            fireEvent.click(screen.getByText('E'));

            expect(screen.queryByRole('textbox', {name: ''})).not.toBeInTheDocument();
            expect(screen.getByText('This is a test action item')).toBeInTheDocument();
            expect(screen.getByText('This is a test action item').tagName).toBe('P');
            expect(mockedActionItemsService.setAction).not.toHaveBeenCalled();
        });

        it('should reset textarea value to original message when re-entering edit mode after canceling', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));

            let textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Changed but not submitted' } });
            fireEvent.click(screen.getByText('E')); // Exit edit mode without submitting
            fireEvent.click(screen.getByText('E')); // Re-enter edit mode

            textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            expect(textarea.value).toBe('This is a test action item');
        });

        it('should update the displayed message after successful submission', async () => {
            const updatedActionItem: ActionItem = {
                ...actionItem,
                action: 'Updated message from server'
            };

            const { rerender } = render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('E'));
            const textarea = screen.getByRole('textbox', {name: ''}) as HTMLTextAreaElement;
            fireEvent.change(textarea, { target: { value: 'Updated message from server' } });

            await act(async () => {
                fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
                await Promise.resolve();
            });

            // Simulate the component receiving updated thought from parent
            rerender(<ActionItemCard actionItem={updatedActionItem}/>);

            expect(screen.getByText('Updated message from server')).toBeInTheDocument();
        });
    });

    describe('delete button', () => {
        it('should show confirmation dialog when delete button is clicked', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('D'));

            expect(screen.getByText('Are you sure you want to delete this action item?')).toBeInTheDocument();
        });

        it('should call ActionItemsService.deleteActionItem when confirm button is clicked', async () => {
            mockedActionItemsService.deleteActionItem = jest.fn().mockResolvedValue(undefined);
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('D'));
            await act(async () => {
                fireEvent.click(screen.getByText('Confirm'));
            });

            expect(mockedActionItemsService.deleteActionItem).toHaveBeenCalledWith(
                actionItem.teamId,
                actionItem.id
            );
        });

        it('should hide confirmation dialog when cancel button is clicked', () => {
            render(<ActionItemCard actionItem={actionItem}/>);

            fireEvent.click(screen.getByText('D'));
            fireEvent.click(screen.getByText('Cancel'));

            expect(screen.queryByText('Are you sure you want to delete this action item?')).not.toBeInTheDocument();
        });
    });
});

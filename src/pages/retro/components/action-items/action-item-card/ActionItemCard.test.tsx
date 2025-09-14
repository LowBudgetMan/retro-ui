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
        expect(screen.getByText('Test User')).toBeInTheDocument();
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

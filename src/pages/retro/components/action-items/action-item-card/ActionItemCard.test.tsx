import {render, screen} from "@testing-library/react";
import {ActionItemCard} from "./ActionItemCard.tsx";
import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";

const currentTime = new Date();

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
});

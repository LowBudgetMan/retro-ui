import {expect, it} from "vitest";
import {DateTime} from "luxon";
import {render, screen, within} from "@testing-library/react";
import {ActionItemsList} from "./ActionItemsList.tsx";
import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";

describe('ActionItemsList', () => {
    it('should display action items', () => {
        const actionItems: ActionItem[] = [
            {id: '1', action: 'Do a thing', createdAt: DateTime.now(), teamId: 'bestteam', assignee: 'you', completed: true},
            {id: '2', action: 'Do another thing', createdAt: DateTime.now(), teamId: 'bestteam', assignee: 'me', completed: false}
        ];

        render(<ActionItemsList actionItems={actionItems} />);

        expect(screen.getByText('Do a thing')).toBeInTheDocument();
        expect(screen.getByText('Do another thing')).toBeInTheDocument();
    });

    it('should order action items by completed status', () => {
        const actionItems: ActionItem[] = [
            {id: '3', action: 'Do a third thing', createdAt: DateTime.now(), teamId: 'bestteam', assignee: 'me', completed: false},
            {id: '1', action: 'Do a thing', createdAt: DateTime.now(), teamId: 'bestteam', assignee: 'you', completed: true},
            {id: '2', action: 'Do another thing', createdAt: DateTime.now(), teamId: 'bestteam', assignee: 'me', completed: false}
        ];

        render(<ActionItemsList actionItems={actionItems} />);

        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).queryByText('Do a third thing')).not.toBeNull();
        expect(within(listItems[1]).queryByText('Do another thing')).not.toBeNull();
        expect(within(listItems[2]).queryByText('Do a thing')).not.toBeNull();
    });

    it('should order the incomplete and complete by oldest to newest', () => {
        const actionItems: ActionItem[] = [
            {id: '1', action: 'Do a thing', createdAt: DateTime.fromMillis(1004), teamId: 'bestteam', assignee: 'you', completed: true},
            {id: '4', action: 'Do a fourth thing', createdAt: DateTime.fromMillis(1001), teamId: 'bestteam', assignee: 'you', completed: true},
            {id: '2', action: 'Do another thing', createdAt: DateTime.fromMillis(1003), teamId: 'bestteam', assignee: 'me', completed: false},
            {id: '3', action: 'Do a third thing', createdAt: DateTime.fromMillis(1002), teamId: 'bestteam', assignee: 'me', completed: false},

        ];

        render(<ActionItemsList actionItems={actionItems} />);

        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).queryByText('Do a third thing')).not.toBeNull();
        expect(within(listItems[1]).queryByText('Do another thing')).not.toBeNull();
        expect(within(listItems[2]).queryByText('Do a fourth thing')).not.toBeNull();
        expect(within(listItems[3]).queryByText('Do a thing')).not.toBeNull();
    });
});
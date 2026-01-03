import {expect, it} from "vitest";
import {DateTime} from "luxon";
import {render, screen} from "@testing-library/react";
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
});
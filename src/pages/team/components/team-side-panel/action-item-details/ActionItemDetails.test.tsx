import {ActionItemDetails} from "./ActionItemDetails";
import {render, screen} from "@testing-library/react";
import {beforeEach, Mock} from "vitest";
import {useActionItems} from "../../../../../context/hooks.tsx";
import {ActionItem} from "../../../../../services/action-items-service/ActionItemsService.ts";
import {DateTime} from "luxon";

vi.mock('../../../../../context/hooks', () => ({
    useActionItems: vi.fn()
}));

describe('ActionItemDetails', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        (useActionItems as Mock).mockReturnValue({actionItems: []});
    })

    it('should display the detail header', () => {
        render(<ActionItemDetails/>)
        expect(screen.queryByText('Action Items')).not.toBeNull();
    });

    it('should default details tag to open', () => {
        render(<ActionItemDetails/>)
        expect(screen.getByRole('group')).toHaveAttribute('open', '');
    });

    it('should display action items passed from the hook', () => {
        (useActionItems as Mock).mockReturnValue({
            actionItems: [
                {id: '1', action: 'Do a thing', createdAt: DateTime.now()} as ActionItem,
                {id: '2', action: 'Do another thing', createdAt: DateTime.now()} as ActionItem,
            ]
        });
        render(<ActionItemDetails/>)
        expect(screen.getByText('Do a thing')).toBeInTheDocument();
        expect(screen.getByText('Do another thing')).toBeInTheDocument();
    });
});
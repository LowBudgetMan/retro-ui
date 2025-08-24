import {fireEvent, render, screen} from "@testing-library/react";
import {ActionItemsTab} from "./ActionItemsTab.tsx";
import {useActionItems} from "../../../../context/hooks.tsx";

jest.mock('../../../../context/hooks.tsx');

jest.mock('./ActionItemsTab.module.css', () => ({
    container: 'container',
    containerOpen: 'containerOpen',
    containerClosed: 'containerClosed',
    tab: 'tab',
    content: 'content',
}));

const useActionItemsMock = useActionItems as jest.Mock;

describe('ActionItemsTab', () => {
    it('should render', () => {
        useActionItemsMock.mockReturnValue({actionItems: []});
        render(<ActionItemsTab />);

        expect(screen.getByText('Action Items')).toBeInTheDocument();
    });

    it('should open and close the tab', () => {
        useActionItemsMock.mockReturnValue({actionItems: []});
        const { container } = render(<ActionItemsTab />);

        const tab = screen.getByText('Action Items');
        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerOpen');

        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerClosed');
    });

    it('should display action items', () => {
        const actionItems = [
            {id: '1', action: 'Do a thing', createdAt: new Date()},
            {id: '2', action: 'Do another thing', createdAt: new Date()}
        ];
        useActionItemsMock.mockReturnValue({actionItems});
        render(<ActionItemsTab />);

        const tab = screen.getByText('Action Items');
        fireEvent.click(tab);

        expect(screen.getByText('Do a thing')).toBeInTheDocument();
        expect(screen.getByText('Do another thing')).toBeInTheDocument();
    });

    it('should close the tab on escape key press', () => {
        useActionItemsMock.mockReturnValue({actionItems: []});
        const { container } = render(<ActionItemsTab />);

        const tab = screen.getByText('Action Items');
        fireEvent.click(tab);

        expect(container.firstChild).toHaveClass('containerOpen');

        fireEvent.keyDown(document, {key: 'Escape'});

        expect(container.firstChild).toHaveClass('containerClosed');
    });
})

import {CountSeparator} from "./CountSeparator.tsx";
import {render, screen} from "@testing-library/react";

describe('Count Separator', () => {
    it('should display the count passed', () => {
        render(<CountSeparator count={10}/>);
        expect(screen.getByText('10')).toBeInTheDocument();
    })
})
import {render, screen} from "@testing-library/react";
import {CategoryList} from "./CategoryList.tsx";
import {Category} from "../../services/retro-service/RetroService.ts";

vi.mock('../category-pill/CategoryPill.tsx', () => ({
    CategoryPill: ({category}: {category: Category}) => (
        <p>{category.name}</p>
    )
}));

describe('CategoryList', () => {
    describe('Rendering', () => {
        const categories: Category[] = [
            {
                name: "column2",
                position: 2,
                lightBackgroundColor: "#ff00ff",
                lightTextColor: "#00ff00",
                darkBackgroundColor: "#00ff00",
                darkTextColor: "#ff00ff",
            },
            {
                name: "column1",
                position: 1,
                lightBackgroundColor: "#ffffff",
                lightTextColor: "#000000",
                darkBackgroundColor: "#000000",
                darkTextColor: "#ffffff",
            }
        ]
        it('should show category names', () => {
            render(<CategoryList categories={categories} />);

            expect(screen.getByText('column1')).toBeInTheDocument();
            expect(screen.getByText('column2')).toBeInTheDocument();
        });

        it('should show categories in order', () => {
            render(<CategoryList categories={categories} />);

            const category1 = screen.getByText('column1');
            const category2 = screen.getByText('column2');

            expect(category1.compareDocumentPosition(category2)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        })
    });
});

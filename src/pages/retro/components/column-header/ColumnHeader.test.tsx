import {act, fireEvent, render, screen} from "@testing-library/react";
import {ColumnHeader} from "./ColumnHeader.tsx";
import {Category} from "../../../../services/retro-service/RetroService.ts";
import {afterEach, beforeEach, expect, vi} from "vitest";

describe('ColumnHeader', () => {
    const category = {name: 'Something'} as unknown as Category;
    const styling = {backgroundColor: '#00FFFF', textColor: '#00FFFF'};

    it('should display the column name', () => {
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);

        expect(screen.queryByText('Something')).not.toBeNull();
    });

    it('should display a sort button', () => {
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);
        expect(screen.queryByRole('button', { name: `Sort ${category.name} by votes`})).not.toBeNull();
    });

    it('should toggle sorting when sorting icon clicked', () => {
        const mockToggleSort = vi.fn();
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={mockToggleSort} />);
        fireEvent.click(screen.getByRole('button', { name: `Sort ${category.name} by votes`}));
        expect(mockToggleSort).toHaveBeenCalled();
    });

    describe('sort button tooltip', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should not show sort tooltip before hovering', () => {
            render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);

            expect(screen.queryByRole('tooltip')).toHaveClass('tooltipHidden');
        });

        it('should not show tooltip before 1 second of hover', () => {
            render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);
            fireEvent.mouseEnter(screen.getByRole('button', { name: `Sort ${category.name} by votes` }));
            act(() => { vi.advanceTimersByTime(999); });

            expect(screen.queryByRole('tooltip')).toHaveClass('tooltipHidden');
        });

        it('should show tooltip after hovering for 1 second', () => {
            render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);
            fireEvent.mouseEnter(screen.getByRole('button', { name: `Sort ${category.name} by votes` }));
            act(() => { vi.advanceTimersByTime(1000); });

            expect(screen.getByRole('tooltip')).toHaveTextContent('Sort by number of votes');
        });

        it('should hide tooltip when the mouse leaves the sort button', () => {
            render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);
            fireEvent.mouseEnter(screen.getByRole('button', { name: `Sort ${category.name} by votes` }));
            act(() => { vi.advanceTimersByTime(1000); });
            fireEvent.mouseLeave(screen.getByRole('button', { name: `Sort ${category.name} by votes` }));

            expect(screen.queryByRole('tooltip')).toHaveClass('tooltipHidden');
        });

        it('should show "Sort by time added" tooltip when already sorting by votes', () => {
            render(<ColumnHeader category={category} styling={styling} isSorting={true} toggleSort={vi.fn()} />);
            fireEvent.mouseEnter(screen.getByRole('button', { name: `Sort ${category.name} by time` }));
            act(() => { vi.advanceTimersByTime(1000); });

            expect(screen.getByRole('tooltip')).toHaveTextContent('Sort by time added');
        });
    })
});
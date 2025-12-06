import {fireEvent, render, screen} from "@testing-library/react";
import {ColumnHeader} from "./ColumnHeader.tsx";
import {Category} from "../../../../services/retro-service/RetroService.ts";
import {expect, vi} from "vitest";

describe('ColumnHeader', () => {
    it('should display the column name', () => {
        const category = {name: 'Something'} as unknown as Category;
        const styling = {backgroundColor: '#00FFFF', textColor: '#00FFFF'};
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={vi.fn()} />);

        expect(screen.queryByText('Something')).not.toBeNull();
    });

    it('should display button to sort column by vote when sorting is false', () => {
        const category = {name: 'Something'} as unknown as Category;
        const styling = {backgroundColor: '#00FFFF', textColor: '#00FFFF'};
        const mockToggleSort = vi.fn();
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={mockToggleSort} />);
        expect(screen.queryByRole('button', { name: `Sort ${category.name} by votes`})).not.toBeNull();
    });

    it('should display button to sort column by time when sorting is true', () => {
        const category = {name: 'Something'} as unknown as Category;
        const styling = {backgroundColor: '#00FFFF', textColor: '#00FFFF'};
        const mockToggleSort = vi.fn();
        render(<ColumnHeader category={category} styling={styling} isSorting={true} toggleSort={mockToggleSort} />);
        expect(screen.queryByRole('button', { name: `Sort ${category.name} by time`})).not.toBeNull();
    });

    it('should toggle sorting when sorting icon clicked', () => {
        const category = {name: 'Something'} as unknown as Category;
        const styling = {backgroundColor: '#00FFFF', textColor: '#00FFFF'};
        const mockToggleSort = vi.fn();
        render(<ColumnHeader category={category} styling={styling} isSorting={false} toggleSort={mockToggleSort} />);
        fireEvent.click(screen.getByRole('button', { name: `Sort ${category.name} by votes`}));
        expect(mockToggleSort).toHaveBeenCalled();
    });
});
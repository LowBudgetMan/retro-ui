import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MobileTabBar, ACTION_ITEMS_TAB } from './MobileTabBar';
import { Category } from '../../../../services/retro-service/RetroService';
import { useTheme } from '../../../../context/hooks';
import { Mock } from 'vitest';
import { Theme } from '../../../../context/theme/ThemeContextTypes';

vi.mock('../../../../context/hooks', () => ({
    useTheme: vi.fn(),
}));

const categories: Category[] = [
    {
        name: 'Went Well',
        position: 0,
        lightBackgroundColor: '#e6ffed',
        lightTextColor: '#000',
        darkBackgroundColor: '#0e4429',
        darkTextColor: '#fff',
    },
    {
        name: 'Needs Improvement',
        position: 1,
        lightBackgroundColor: '#ffeef0',
        lightTextColor: '#000',
        darkBackgroundColor: '#86181d',
        darkTextColor: '#fff',
    },
];

describe('MobileTabBar', () => {
    beforeEach(() => {
        (useTheme as Mock).mockReturnValue({
            getEffectiveTheme: () => Theme.LIGHT,
        });
    });

    it('renders a button for each category', () => {
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={vi.fn()}
                showActionItems={true}
            />
        );

        expect(screen.getByRole('button', { name: 'Went Well' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Needs Improvement' })).toBeInTheDocument();
    });

    it('renders the Action Items tab when showActionItems is true', () => {
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={vi.fn()}
                showActionItems={true}
            />
        );

        expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
    });

    it('hides the Action Items tab when showActionItems is false', () => {
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={vi.fn()}
                showActionItems={false}
            />
        );

        expect(screen.queryByRole('button', { name: 'Actions' })).not.toBeInTheDocument();
    });

    it('calls onTabChange with category name when a category tab is clicked', async () => {
        const onTabChange = vi.fn();
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={onTabChange}
                showActionItems={true}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: 'Needs Improvement' }));
        expect(onTabChange).toHaveBeenCalledWith('Needs Improvement');
    });

    it('calls onTabChange with ACTION_ITEMS_TAB when Actions tab is clicked', async () => {
        const onTabChange = vi.fn();
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={onTabChange}
                showActionItems={true}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
        expect(onTabChange).toHaveBeenCalledWith(ACTION_ITEMS_TAB);
    });

    it('highlights the active tab with aria-current', () => {
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Needs Improvement"
                onTabChange={vi.fn()}
                showActionItems={true}
            />
        );

        expect(screen.getByRole('button', { name: 'Needs Improvement' })).toHaveAttribute('aria-current', 'true');
        expect(screen.getByRole('button', { name: 'Went Well' })).not.toHaveAttribute('aria-current');
    });

    it('applies the category background color as border-bottom on the active tab', () => {
        render(
            <MobileTabBar
                categories={categories}
                activeTab="Went Well"
                onTabChange={vi.fn()}
                showActionItems={true}
            />
        );

        const activeTab = screen.getByRole('button', { name: 'Went Well' });
        expect(activeTab.style.borderBottomColor).toBe('#e6ffed');
    });
});

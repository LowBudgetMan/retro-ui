import {Theme} from "../../context/theme/ThemeContextTypes.ts";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {useTheme} from "../../context/hooks.tsx";
import {ThemeToggle} from "./ThemeToggle.tsx";

const mockedUseTheme = vi.mocked(useTheme);

vi.mock('../../context/hooks.tsx', () => ({
    Theme: {DARK: 'dark', LIGHT: 'light', SYSTEM: 'system'},
    useTheme: vi.fn()
}));

describe("ThemeToggle component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedUseTheme.mockReturnValue({
            theme: Theme.DARK,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.DARK),
        });
    });

    it('should display correct icon for dark and light themes', async () => {
        mockedUseTheme.mockReturnValue({
            theme: Theme.LIGHT,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.LIGHT),
        });

        let rerender: (component: React.ReactElement) => void;
        await act(async () => {
            const result = render(<ThemeToggle/>);
            rerender = result.rerender;
        });

        expect(screen.getByText('☀️')).toBeInTheDocument();

        mockedUseTheme.mockReturnValue({
            theme: Theme.DARK,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.DARK),
        });

        await act(async () => {
            rerender(<ThemeToggle/>);
        });

        expect(screen.getByText('🌙')).toBeInTheDocument();
    });


    it('should display dark icon when in system mode and effective theme is dark', async () => {
        mockedUseTheme.mockReturnValue({
            theme: Theme.SYSTEM,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.DARK),
        });

        await act(async () => {
            render(<ThemeToggle/>);
        });

        expect(screen.getByText('🌙')).toBeInTheDocument();
        expect(screen.queryByText('☀️️')).not.toBeInTheDocument();
    });

    it('should display light icon when in system mode and effective theme is light', async () => {
        mockedUseTheme.mockReturnValue({
            theme: Theme.SYSTEM,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.LIGHT),
        });

        await act(async () => {
            render(<ThemeToggle/>);
        });

        expect(screen.getByText('☀️')).toBeInTheDocument();
        expect(screen.queryByText('🌙')).not.toBeInTheDocument();
    });

    it('should show all options when the dropdown is opened', async () => {
        await act(async () => {
            render(<ThemeToggle/>);
        });

        fireEvent.click(screen.getByRole('button', { name: '🌙' }));

        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should only show the current theme as active when the dropdown is opened', async () => {
        await act(async () => {
            render(<ThemeToggle/>);
        });

        fireEvent.click(screen.getByRole('button', { name: '🌙' }));

        const darkOption = screen.getByText('Dark').closest('button');
        const lightOption = screen.getByText('Light').closest('button');
        const systemOption = screen.getByText('System').closest('button');

        expect(darkOption).toHaveClass('themeOption--active');
        expect(lightOption).not.toHaveClass('themeOption--active');
        expect(systemOption).not.toHaveClass('themeOption--active');
    });
});

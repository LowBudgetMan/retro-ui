import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {Header} from './Header.tsx';
import {getUserManager} from '../../pages/user/UserContext.ts';
import {Theme} from '../../context/theme/ThemeContextTypes.ts';
import '@testing-library/jest-dom';
import {useTheme} from "../../context/hooks.tsx";
import type {User, UserManager} from 'oidc-client-ts';
import {Mock} from "vitest";

const mockedUseTheme = vi.mocked(useTheme);

const mockedUserManager = {
    events: {
        addUserLoaded: vi.fn(),
        removeUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
    },
    getUser: vi.fn(),
    signinRedirect: vi.fn(),
    signoutRedirect: vi.fn(),
} as unknown as UserManager;

vi.mock('../../pages/user/UserContext.ts', () => ({
    getUserManager: vi.fn(),
}));

vi.mocked(getUserManager).mockReturnValue(mockedUserManager);

const mockedAddUserLoaded = vi.mocked(mockedUserManager.events.addUserLoaded);
const mockedAddUserUnloaded = vi.mocked(mockedUserManager.events.addUserUnloaded);

vi.mock('../../context/hooks.tsx', () => ({
    Theme: {DARK: 'dark', LIGHT: 'light', SYSTEM: 'system'},
    useTheme: vi.fn()
}));

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (mockedUserManager.getUser as Mock).mockResolvedValue(null); // Default to no user
        mockedUseTheme.mockReturnValue({
            theme: Theme.DARK,
            setTheme: vi.fn(),
            getEffectiveTheme: vi.fn(() => Theme.DARK),
        });
    });

    describe('Rendering', () => {
        it('should render the header with title and theme toggle button', async () => {
            await act(async () => {
                render(<Header/>);
            });
            expect(screen.getByText('Retro UI')).toBeInTheDocument();
            expect(screen.getByTitle('Current theme: dark')).toBeInTheDocument();
        });

        it('should render login button by default', async () => {
            (mockedUserManager.getUser as Mock).mockResolvedValue(null);

            await act(async () => {
                render(<Header/>);
            });

            await waitFor(() => {
                expect(screen.getByText('Login')).toBeInTheDocument();
            });
            expect(mockedUserManager.getUser).toHaveBeenCalled();
        });

        it('should render logout button when user is loaded', async () => {
            (mockedUserManager.getUser as Mock).mockResolvedValue({profile: {name: 'Test User'}} as User);

            await act(async () => {
                render(<Header/>);
            });

            await waitFor(() => {
                expect(screen.getByText('Logout')).toBeInTheDocument();
            });
            expect(mockedUserManager.getUser).toHaveBeenCalled();
        });

        it('should display different theme icons based on current theme', async () => {
            mockedUseTheme.mockReturnValue({
                theme: Theme.LIGHT,
                setTheme: vi.fn(),
                getEffectiveTheme: vi.fn(() => Theme.LIGHT),
            });

            let rerender: (component: React.ReactElement) => void;
            await act(async () => {
                const result = render(<Header/>);
                rerender = result.rerender;
            });

            expect(screen.getByText('☀️')).toBeInTheDocument(); // Light theme icon

            mockedUseTheme.mockReturnValue({
                theme: Theme.SYSTEM,
                setTheme: vi.fn(),
                getEffectiveTheme: vi.fn(() => Theme.SYSTEM),
            });

            await act(async () => {
                rerender(<Header/>);
            });

            expect(screen.getByText('⚙️')).toBeInTheDocument(); // System theme icon
        });
    });

    describe('User Authentication Events', () => {
        it('should add userLoaded event listener on mount', async () => {
            await act(async () => {
                render(<Header/>);
            });
            expect(mockedAddUserLoaded).toHaveBeenCalled();
        });

        it('should add userUnloaded event listener on mount', async () => {
            await act(async () => {
                render(<Header/>);
            });
            expect(mockedAddUserUnloaded).toHaveBeenCalled();
        });

        it('should remove event listeners on unmount', async () => {
            let unmount: () => void;
            await act(async () => {
                const result = render(<Header/>);
                unmount = result.unmount;
            });

            act(() => {
                unmount();
            });

            expect(mockedUserManager.events.removeUserLoaded).toHaveBeenCalled();
            expect(mockedUserManager.events.removeUserUnloaded).toHaveBeenCalled();
        });

        it('should set logout button when user is loaded', async () => {
            await act(async () => {
                render(<Header/>);
            });

            const userLoadedCallback = mockedAddUserLoaded.mock.calls[0][0] as () => void;

            act(() => {
                userLoadedCallback();
            });

            await waitFor(() => {
                expect(screen.getByText('Logout')).toBeInTheDocument();
            });
        });

        it('should set login button when user is unloaded', async () => {
            await act(async () => {
                render(<Header/>);
            });

            const userUnloadedCallback = mockedAddUserUnloaded.mock.calls[0][0] as () => void;

            act(() => {
                userUnloadedCallback();
            });

            await waitFor(() => {
                expect(screen.getByText('Login')).toBeInTheDocument();
            });
        });
    });

    describe('Interactions', () => {
        it('should toggle theme when theme button is clicked', async () => {
            const setTheme = vi.fn();

            mockedUseTheme.mockReturnValue({
                theme: Theme.DARK,
                setTheme,
                getEffectiveTheme: vi.fn(() => Theme.DARK),
            });

            await act(async () => {
                render(<Header/>);
            });

            fireEvent.click(screen.getByTitle('Current theme: dark'));

            expect(setTheme).toHaveBeenCalledWith(Theme.LIGHT);

            mockedUseTheme.mockReturnValue({
                theme: Theme.LIGHT,
                setTheme,
                getEffectiveTheme: vi.fn(() => Theme.LIGHT),
            });

            await act(async () => {
                render(<Header/>);
            });

            fireEvent.click(screen.getByTitle('Current theme: light'));

            expect(setTheme).toHaveBeenCalledWith(Theme.SYSTEM);

            mockedUseTheme.mockReturnValue({
                theme: Theme.SYSTEM,
                setTheme,
                getEffectiveTheme: vi.fn(() => Theme.DARK),
            });

            await act(async () => {
                render(<Header/>);
            });

            fireEvent.click(screen.getByTitle('Current theme: system'));

            expect(setTheme).toHaveBeenCalledWith(Theme.DARK);
        });

        it('should call signinRedirect when login button is clicked', async () => {
            (mockedUserManager.getUser as Mock).mockResolvedValue(null);

            await act(async () => {
                render(<Header/>);
            });

            await waitFor(() => {
                expect(screen.getByText('Login')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Login'));

            expect(mockedUserManager.signinRedirect).toHaveBeenCalled();
        });

        it('should call signoutRedirect when logout button is clicked', async () => {
            (mockedUserManager.getUser as Mock).mockResolvedValue({profile: {name: 'Test User'}} as User);

            await act(async () => {
                render(<Header/>);
            });

            await waitFor(() => {
                expect(screen.getByText('Logout')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Logout'));

            expect(mockedUserManager.signoutRedirect).toHaveBeenCalled();
        });
    });
});

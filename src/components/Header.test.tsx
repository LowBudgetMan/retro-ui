import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Header } from './Header';
import { userManager } from '../pages/user/UserContext';
import { Theme, useTheme } from '../styles/ThemeContext';
import '@testing-library/jest-dom';

jest.mock('../pages/user/UserContext', () => ({
  userManager: {
    events: {
      addUserLoaded: jest.fn(),
      removeUserLoaded: jest.fn(),
      addUserUnloaded: jest.fn(),
      removeUserUnloaded: jest.fn(),
    },
    getUser: jest.fn().mockResolvedValue(null),
    signinRedirect: jest.fn(),
    signoutRedirect: jest.fn(),
  }
}));

jest.mock('../styles/ThemeContext', () => {
  const mockUseTheme = jest.fn().mockReturnValue({
    theme: 'dark',
    setTheme: jest.fn(),
  });
  
  return {
    Theme: { DARK: 'dark', LIGHT: 'light', SYSTEM: 'system' },
    useTheme: mockUseTheme
  };
});

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: Theme.DARK,
      setTheme: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the header with title and theme toggle button', async () => {
      await act(async () => {
        render(<Header />);
      });
      expect(screen.getByText('Retro UI')).toBeInTheDocument();
      expect(screen.getByTitle('Current theme: dark')).toBeInTheDocument();
    });

    it('should render login button by default', async () => {
      (userManager.getUser as jest.Mock).mockResolvedValue(null);

      await act(async () => {
        render(<Header />);
      });

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
      expect(userManager.getUser).toHaveBeenCalled();
    });

    it('should render logout button when user is loaded', async () => {
      (userManager.getUser as jest.Mock).mockResolvedValue({ profile: { name: 'Test User' } });
      
      await act(async () => {
        render(<Header />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      expect(userManager.getUser).toHaveBeenCalled();
    });

    it('should display different theme icons based on current theme', async () => {
      (useTheme as jest.Mock).mockReturnValue({
        theme: Theme.LIGHT,
        setTheme: jest.fn(),
      });
      
      let rerender: any;
      await act(async () => {
        const result = render(<Header />);
        rerender = result.rerender;
      });

      expect(screen.getByText('☀️')).toBeInTheDocument(); // Light theme icon

      (useTheme as jest.Mock).mockReturnValue({
        theme: Theme.SYSTEM,
        setTheme: jest.fn(),
      });
      
      await act(async () => {
        rerender(<Header />);
      });
      
      expect(screen.getByText('⚙️')).toBeInTheDocument(); // System theme icon
    });
  });

  describe('User Authentication Events', () => {
    it('should add userLoaded event listener on mount', async () => {
      await act(async () => {
        render(<Header />);
      });
      expect(userManager.events.addUserLoaded).toHaveBeenCalled();
    });

    it('should add userUnloaded event listener on mount', async () => {
      await act(async () => {
        render(<Header />);
      });
      expect(userManager.events.addUserUnloaded).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', async () => {
      let unmount: any;
      await act(async () => {
        const result = render(<Header />);
        unmount = result.unmount;
      });
      
      unmount();
      
      expect(userManager.events.removeUserLoaded).toHaveBeenCalled();
      expect(userManager.events.removeUserUnloaded).toHaveBeenCalled();
    });

    it('should set logout button when user is loaded', async () => {
      await act(async () => {
        render(<Header />);
      });
      
      const userLoadedCallback = (userManager.events.addUserLoaded as jest.Mock).mock.calls[0][0];
      
      act(() => {
        userLoadedCallback();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should set login button when user is unloaded', async () => {
      await act(async () => {
        render(<Header />);
      });
      
      const userUnloadedCallback = (userManager.events.addUserUnloaded as jest.Mock).mock.calls[0][0];
      
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
      const setTheme = jest.fn();
      
      (useTheme as jest.Mock).mockReturnValue({
        theme: Theme.DARK,
        setTheme,
      });
      
      await act(async () => {
        render(<Header />);
      });
      
      fireEvent.click(screen.getByTitle('Current theme: dark'));
      
      expect(setTheme).toHaveBeenCalledWith(Theme.LIGHT);
      
      (useTheme as jest.Mock).mockReturnValue({
        theme: Theme.LIGHT,
        setTheme,
      });
      
      await act(async () => {
        render(<Header />);
      });
      
      fireEvent.click(screen.getByTitle('Current theme: light'));
      
      expect(setTheme).toHaveBeenCalledWith(Theme.SYSTEM);
      
      (useTheme as jest.Mock).mockReturnValue({
        theme: Theme.SYSTEM,
        setTheme,
      });
      
      await act(async () => {
        render(<Header />);
      });
      
      fireEvent.click(screen.getByTitle('Current theme: system'));
      
      expect(setTheme).toHaveBeenCalledWith(Theme.DARK);
    });

    it('should call signinRedirect when login button is clicked', async () => {
      (userManager.getUser as jest.Mock).mockResolvedValue(null);
      
      await act(async () => {
        render(<Header />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Login'));
      
      expect(userManager.signinRedirect).toHaveBeenCalled();
    });

    it('should call signoutRedirect when logout button is clicked', async () => {
      (userManager.getUser as jest.Mock).mockResolvedValue({ profile: { name: 'Test User' } });
      
      await act(async () => {
        render(<Header />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Logout'));
      
      expect(userManager.signoutRedirect).toHaveBeenCalled();
    });
  });
});

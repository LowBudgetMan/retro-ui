import { render, screen } from '@testing-library/react';
import { CategoryPill } from './CategoryPill';
import { Category } from '../../services/retro-service/RetroService.ts';
import { ThemeProvider } from '../../context/theme/ThemeContext.tsx';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';

vi.mock('./CategoryPill.module.css', () => ({
    default: {
        pill: 'mock-pill-class',
    },
    pill: 'mock-pill-class',
}));

const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('CategoryPill', () => {
  const mockCategory: Category = {
    name: 'Start',
    position: 0,
    lightBackgroundColor: '#e8f5e8',
    lightTextColor: '#2d5a2d',
    darkBackgroundColor: '#1a3d1a',
    darkTextColor: '#90ee90'
  };

  const mockMatchMediaImplementation = (matches: boolean) => {
    const mockMediaQuery = {
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    return mockMediaQuery;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the category pill with correct CSS class', () => {
      mockMatchMediaImplementation(false);
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      const pill = screen.getByText('Start');
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveClass('mock-pill-class');
      expect(pill.tagName).toBe('SPAN');
    });

    it('should display the category name', () => {
      mockMatchMediaImplementation(false);
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      expect(screen.getByText('Start')).toBeInTheDocument();
    });
  });

  describe('Light Theme Styling', () => {
    it('should apply light theme colors when theme is LIGHT', () => {
      mockMatchMediaImplementation(false);
      
      const ThemeWrapper = ({ children }: { children: ReactNode }) => (
        <div data-theme="light">{children}</div>
      );
      
      render(
        <ThemeWrapper>
          <CategoryPill category={mockCategory} />
        </ThemeWrapper>
      );
      
      const pill = screen.getByText('Start');
      expect(pill).toHaveStyle({
        backgroundColor: '#e8f5e8',
        color: '#2d5a2d'
      });
    });

    it('should apply light theme colors when system theme is light', () => {
      mockMatchMediaImplementation(false); // System prefers light
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      const pill = screen.getByText('Start');
      expect(pill).toHaveStyle({
        backgroundColor: '#e8f5e8',
        color: '#2d5a2d'
      });
    });
  });

  describe('Dark Theme Styling', () => {
    it('should apply dark theme colors when system theme is dark', () => {
      mockMatchMediaImplementation(true); // System prefers dark
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      const pill = screen.getByText('Start');
      expect(pill).toHaveStyle({
        backgroundColor: '#1a3d1a',
        color: '#90ee90'
      });
    });
  });

  describe('System Theme Detection', () => {
    it('should register media query listener for system theme', () => {
      const mockMediaQuery = mockMatchMediaImplementation(false);
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle system theme detection correctly', () => {
      const mockMediaQuery = mockMatchMediaImplementation(false);
      
      render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      // Verify that the component sets up media query listener
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      // Verify initial light theme colors are applied
      const pill = screen.getByText('Start');
      expect(pill).toHaveStyle({
        backgroundColor: '#e8f5e8',
        color: '#2d5a2d'
      });
    });

    it('should clean up media query listener on unmount', () => {
      const mockMediaQuery = mockMatchMediaImplementation(false);
      
      const { unmount } = render(
        <ThemeProvider>
          <CategoryPill category={mockCategory} />
        </ThemeProvider>
      );
      
      unmount();
      
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Different Categories', () => {
    it('should render different category with correct colors', () => {
      const stopCategory: Category = {
        name: 'Stop',
        position: 1,
        lightBackgroundColor: '#ffe8e8',
        lightTextColor: '#5a2d2d',
        darkBackgroundColor: '#3d1a1a',
        darkTextColor: '#ff9090'
      };
      
      mockMatchMediaImplementation(false);
      
      render(
        <ThemeProvider>
          <CategoryPill category={stopCategory} />
        </ThemeProvider>
      );
      
      const pill = screen.getByText('Stop');
      expect(pill).toHaveClass('mock-pill-class');
      expect(pill).toHaveStyle({
        backgroundColor: '#ffe8e8',
        color: '#5a2d2d'
      });
    });

    it('should render category with dark theme colors', () => {
      const continueCategory: Category = {
        name: 'Continue',
        position: 2,
        lightBackgroundColor: '#e8e8ff',
        lightTextColor: '#2d2d5a',
        darkBackgroundColor: '#1a1a3d',
        darkTextColor: '#9090ff'
      };
      
      mockMatchMediaImplementation(true); // Dark theme
      
      render(
        <ThemeProvider>
          <CategoryPill category={continueCategory} />
        </ThemeProvider>
      );
      
      const pill = screen.getByText('Continue');
      expect(pill).toHaveStyle({
        backgroundColor: '#1a1a3d',
        color: '#9090ff'
      });
    });
  });
});

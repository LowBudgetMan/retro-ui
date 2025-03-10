import '@jest/globals';
import { render, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Theme } from './ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key],
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('ThemeContext', () => {
    let mediaQueryListeners: ((e: { matches: boolean }) => void)[] = [];
    
    beforeEach(() => {
        localStorageMock.clear();
        mediaQueryListeners = [];
        
        // Setup matchMedia mock
        window.matchMedia = jest.fn().mockImplementation(() => ({
            matches: false,
            media: 'query',
            addEventListener: (_: string, listener: any) => {
                mediaQueryListeners.push(listener);
            },
            removeEventListener: (_: string, listener: any) => {
                mediaQueryListeners = mediaQueryListeners.filter(l => l !== listener);
            }
        }));
        
        // Reset document attributes
        document.documentElement.removeAttribute('data-theme');
    });

    // Helper component to test the useTheme hook
    function TestComponent({ onThemeChange }: { onThemeChange?: (theme: Theme) => void }) {
        const { theme, setTheme } = useTheme();
        
        if (onThemeChange) {
            onThemeChange(theme);
        }
        
        return (
            <div data-testid="theme-value">
                {theme}
                <button onClick={() => setTheme(Theme.DARK)}>Set Dark</button>
                <button onClick={() => setTheme(Theme.LIGHT)}>Set Light</button>
                <button onClick={() => setTheme(Theme.SYSTEM)}>Set System</button>
            </div>
        );
    }

    it('should use system theme by default', () => {
        const onThemeChange = jest.fn();
        
        render(
            <ThemeProvider>
                <TestComponent onThemeChange={onThemeChange} />
            </ThemeProvider>
        );

        expect(onThemeChange).toHaveBeenCalledWith(Theme.SYSTEM);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should load theme from localStorage if available', () => {
        localStorageMock.setItem('theme', Theme.DARK);
        const onThemeChange = jest.fn();
        
        render(
            <ThemeProvider>
                <TestComponent onThemeChange={onThemeChange} />
            </ThemeProvider>
        );

        expect(onThemeChange).toHaveBeenCalledWith(Theme.DARK);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update theme when setTheme is called', () => {
        const onThemeChange = jest.fn();
        
        const { getByText } = render(
            <ThemeProvider>
                <TestComponent onThemeChange={onThemeChange} />
            </ThemeProvider>
        );

        act(() => {
            getByText('Set Dark').click();
        });

        expect(onThemeChange).toHaveBeenCalledWith(Theme.DARK);
        expect(localStorageMock.getItem('theme')).toBe(Theme.DARK);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should respond to system theme changes when in system mode', () => {
        const onThemeChange = jest.fn();
        
        render(
            <ThemeProvider>
                <TestComponent onThemeChange={onThemeChange} />
            </ThemeProvider>
        );

        // Simulate system theme change to dark
        act(() => {
            mediaQueryListeners.forEach(listener => 
                listener({ matches: true })
            );
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        // Simulate system theme change to light
        act(() => {
            mediaQueryListeners.forEach(listener => 
                listener({ matches: false })
            );
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should not respond to system theme changes when in manual mode', () => {
        const onThemeChange = jest.fn();
        
        const { getByText } = render(
            <ThemeProvider>
                <TestComponent onThemeChange={onThemeChange} />
            </ThemeProvider>
        );

        // Set to manual dark mode
        act(() => {
            getByText('Set Dark').click();
        });

        // Simulate system theme change
        act(() => {
            mediaQueryListeners.forEach(listener => 
                listener({ matches: false })
            );
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should cleanup event listeners on unmount', () => {
        const removeEventListener = jest.fn();
        window.matchMedia = jest.fn().mockImplementation(() => ({
            matches: false,
            addEventListener: jest.fn(),
            removeEventListener
        }));

        const { unmount } = render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );

        unmount();
        expect(removeEventListener).toHaveBeenCalled();
    });
}); 
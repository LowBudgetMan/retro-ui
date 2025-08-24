import '@jest/globals';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext.tsx';
import { Theme } from './ThemeContext.tsx';
import {useTheme} from "../hooks.tsx";

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
        
        document.documentElement.removeAttribute('data-theme');
    });

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

    function EffectiveThemeTestComponent({ onEffectiveTheme }: { onEffectiveTheme: (effectiveTheme: Theme) => void }) {
        const { getEffectiveTheme } = useTheme();
        
        const effectiveTheme = getEffectiveTheme();
        onEffectiveTheme(effectiveTheme);
        
        return <div data-testid="effective-theme">{effectiveTheme}</div>;
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

        act(() => {
            mediaQueryListeners.forEach(listener => 
                listener({ matches: true })
            );
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

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

        act(() => {
            getByText('Set Dark').click();
        });

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

    describe('getEffectiveTheme', () => {
        it('should return DARK when theme is SYSTEM and system prefers dark mode', () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({
                matches: true,
                media: 'query',
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            }));

            const onEffectiveTheme = jest.fn();
            
            render(
                <ThemeProvider>
                    <EffectiveThemeTestComponent onEffectiveTheme={onEffectiveTheme} />
                </ThemeProvider>
            );

            expect(onEffectiveTheme).toHaveBeenCalledWith(Theme.DARK);
        });

        it('should return LIGHT when theme is SYSTEM and system prefers light mode', () => {
            window.matchMedia = jest.fn().mockImplementation(() => ({
                matches: false,
                media: 'query',
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            }));

            const onEffectiveTheme = jest.fn();
            
            render(
                <ThemeProvider>
                    <EffectiveThemeTestComponent onEffectiveTheme={onEffectiveTheme} />
                </ThemeProvider>
            );

            expect(onEffectiveTheme).toHaveBeenCalledWith(Theme.LIGHT);
        });

        it('should return the actual theme when theme is not SYSTEM', () => {
            localStorageMock.setItem('theme', Theme.DARK);
            
            window.matchMedia = jest.fn().mockImplementation(() => ({
                matches: false,
                media: 'query',
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            }));

            const onEffectiveTheme = jest.fn();
            
            render(
                <ThemeProvider>
                    <EffectiveThemeTestComponent onEffectiveTheme={onEffectiveTheme} />
                </ThemeProvider>
            );

            expect(onEffectiveTheme).toHaveBeenCalledWith(Theme.DARK);
        });
    });
});

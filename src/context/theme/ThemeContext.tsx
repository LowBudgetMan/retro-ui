import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {Theme} from "./ThemeContextTypes.ts";

const THEME_KEY = "theme";

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    getEffectiveTheme: () => Theme;
}

export const ThemeContext = createContext<ThemeContextValue>({
    theme: Theme.SYSTEM,
    setTheme: () => {},
    getEffectiveTheme: () => Theme.SYSTEM
});

export function ThemeProvider(props: PropsWithChildren) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
        return savedTheme || Theme.SYSTEM;
    });

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    };

    const getEffectiveTheme = useCallback((): Theme => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return theme === Theme.SYSTEM
            ? (mediaQuery.matches ? Theme.DARK : Theme.LIGHT)
            : theme
    }, [theme])

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            if (theme === Theme.SYSTEM) {
                document.documentElement.setAttribute('data-theme', e.matches ? Theme.DARK : Theme.LIGHT);
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);

        // Set initial theme
        document.documentElement.setAttribute('data-theme', getEffectiveTheme());

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [theme, getEffectiveTheme]);

    return (
        <ThemeContext.Provider value={{theme, setTheme: handleThemeChange, getEffectiveTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}
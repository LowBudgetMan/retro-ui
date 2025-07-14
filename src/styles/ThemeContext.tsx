import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";

const THEME_KEY = "theme";

export enum Theme {
    LIGHT = "light",
    DARK = "dark",
    SYSTEM = "system"
}

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    getEffectiveTheme: () => Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
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

    const getEffectiveTheme = (): Theme => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return theme === Theme.SYSTEM
            ? (mediaQuery.matches ? Theme.DARK : Theme.LIGHT)
            : theme
    }

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
    }, [theme]);

    return (
        <ThemeContext.Provider value={{theme, setTheme: handleThemeChange, getEffectiveTheme}}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
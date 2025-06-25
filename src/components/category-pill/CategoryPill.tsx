import {Category} from "../../services/RetroService.ts";
import {Theme, useTheme} from "../../styles/ThemeContext.tsx";
import {useEffect, useState} from "react";
import styles from "./CategoryPill.module.css";

interface Props {
    category: Category
}

export function CategoryPill({category}: Props) {
    const { theme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateTheme = () => {
            const effectiveTheme = theme === Theme.SYSTEM
                ? (mediaQuery.matches ? Theme.DARK : Theme.LIGHT)
                : theme;
            setIsDarkMode(effectiveTheme === Theme.DARK);
        };

        updateTheme();

        if (theme === Theme.SYSTEM) {
            mediaQuery.addEventListener('change', updateTheme);
            return () => mediaQuery.removeEventListener('change', updateTheme);
        }
    }, [theme]);

    return (
        <span className={styles.pill} style={{
            backgroundColor: isDarkMode ? category.darkBackgroundColor : category.lightBackgroundColor,
            color: isDarkMode ? category.darkTextColor : category.lightTextColor
        }}>{category.name}</span>
    )
}
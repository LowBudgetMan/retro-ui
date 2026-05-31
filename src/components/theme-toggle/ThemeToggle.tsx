import {useEffect, useRef, useState} from "react";
import {useTheme} from "../../context/hooks.tsx";
import {Theme} from "../../context/theme/ThemeContextTypes.ts";
import {THEME_OPTIONS} from "../../contants/Theme.ts";
import styles from "./ThemeToggle.module.css"

export function ThemeToggle() {
    const { theme, setTheme, getEffectiveTheme } = useTheme();
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const themeMenuRef = useRef<HTMLDivElement>(null);
    const themeIcon = getEffectiveTheme() === Theme.DARK ? '🌙' : '☀️';

    useEffect(() => {
        if (!themeMenuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
                setThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [themeMenuOpen]);

    return (
        <div className={styles.themeMenu} ref={themeMenuRef}>
            <button
                onClick={() => setThemeMenuOpen(o => !o)}
                className={styles.themeToggle}
                title={`Theme: ${theme}`}
            >
                {themeIcon}
            </button>
            {themeMenuOpen && (
                <div className={styles.themeDropdown}>
                    {THEME_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            className={`${styles.themeOption}${theme === option.value ? ` ${styles['themeOption--active']}` : ''}`}
                            onClick={() => {
                                setTheme(option.value);
                                setThemeMenuOpen(false);
                            }}
                        >
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                            {theme === option.value && <span className={styles['themeOption-check']}>✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
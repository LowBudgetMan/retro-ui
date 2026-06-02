import {Theme} from "../context/theme/ThemeContextTypes.ts";

export const THEME_OPTIONS: { label: string; icon: string; value: Theme }[] = [
    { label: 'Light', icon: '☀️', value: Theme.LIGHT },
    { label: 'Dark', icon: '🌙', value: Theme.DARK },
    { label: 'System', icon: '💻', value: Theme.SYSTEM },
];

import { Category } from '../../../../services/retro-service/RetroService';
import { useTheme } from '../../../../context/hooks';
import { Theme } from '../../../../context/theme/ThemeContextTypes';
import styles from './MobileTabBar.module.css';

export const ACTION_ITEMS_TAB = 'ACTION_ITEMS';

interface MobileTabBarProps {
    categories: Category[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    showActionItems: boolean;
}

export function MobileTabBar({ categories, activeTab, onTabChange, showActionItems }: MobileTabBarProps) {
    const { getEffectiveTheme } = useTheme();
    const isDark = getEffectiveTheme() === Theme.DARK;

    const getActiveStyle = (category: Category): React.CSSProperties => {
        if (activeTab !== category.name) return {};
        const color = isDark ? category.darkBackgroundColor : category.lightBackgroundColor;
        return { borderBottomColor: color };
    };

    return (
        <>
            <nav className={styles.tabBar} aria-label="Retro columns">
                {categories.map(category => (
                    <button
                        key={category.name}
                        className={`${styles.tab} ${activeTab === category.name ? styles.activeTab : ''}`}
                        style={getActiveStyle(category)}
                        onClick={() => onTabChange(category.name)}
                        aria-current={activeTab === category.name || undefined}
                    >
                        {category.name}
                    </button>
                ))}
                {showActionItems && (
                    <button
                        className={`${styles.tab} ${styles.actionsTab} ${activeTab === ACTION_ITEMS_TAB ? styles.activeTab : ''}`}
                        style={activeTab === ACTION_ITEMS_TAB ? { borderBottomColor: 'var(--bonfire-orange)' } : {}}
                        onClick={() => onTabChange(ACTION_ITEMS_TAB)}
                        aria-current={activeTab === ACTION_ITEMS_TAB || undefined}
                    >
                        Actions
                    </button>
                )}
            </nav>
            <div className={styles.fadeEdge} />
        </>
    );
}

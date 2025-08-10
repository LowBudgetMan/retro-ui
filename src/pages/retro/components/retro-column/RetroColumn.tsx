import {Category, Thought} from "../../../../services/RetroService.ts";
import {CreateThought} from "../create-thought/CreateThought.tsx";
import {ThoughtCard} from "../thought-card/ThoughtCard.tsx";
import styles from "./RetroColumn.module.css";
import {CountSeparator} from "../count-separator/CountSeparator.tsx";
import {Theme, useTheme} from "../../../../styles/ThemeContext.tsx";
import {useMemo} from "react";

interface RetroColumnProps {
    teamId: string;
    retroId: string;
    category: Category;
    thoughts: Thought[];
}

interface CategoryStyling {
    backgroundColor: string;
    textColor: string
}

export function RetroColumn({teamId, retroId, category, thoughts}: RetroColumnProps) {
    const {getEffectiveTheme} = useTheme();
    const categoryStyling: CategoryStyling = useMemo(() => {
        const theme = getEffectiveTheme();
        const backgroundColor = theme === Theme.DARK ? category.darkBackgroundColor : category.lightBackgroundColor;
        const textColor = theme === Theme.DARK ? category.darkTextColor : category.lightTextColor;
        return {
            backgroundColor,
            textColor
        }
    }, [getEffectiveTheme, category])

    const sortedThoughts = useMemo(() => {
        return [...thoughts].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
    }, [thoughts]);

    return (
        <div key={`column${category.name}`} className={styles.retroCategory}>
            <h2 className={styles.categoryName} style={{
                'backgroundColor': categoryStyling.backgroundColor,
                'color': categoryStyling.textColor
            }}>{category.name}</h2>
            <CreateThought
                teamId={teamId}
                retroId={retroId}
                category={category.name}
                borderColor={categoryStyling.backgroundColor}
            />
            <span style={{marginBottom: '0.5rem'}}/>
            <CountSeparator count={thoughts.length} />
            <ul className={styles.thoughtsList}>
                {sortedThoughts
                    .map(thought => (
                    <li key={`thought${thought.id}`}><ThoughtCard teamId={teamId} thought={thought} /></li>
                ))}
            </ul>
        </div>
    );
}

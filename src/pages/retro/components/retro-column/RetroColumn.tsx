import {Category, Thought} from "../../../../services/retro-service/RetroService.ts";
import {CreateThought} from "../create-thought/CreateThought.tsx";
import {ThoughtCard} from "../thought-card/ThoughtCard.tsx";
import styles from "./RetroColumn.module.css";
import {CountSeparator} from "../count-separator/CountSeparator.tsx";
import {Theme} from "../../../../context/theme/ThemeContextTypes.ts";
import {useMemo, useState} from "react";
import {useTheme} from "../../../../context/hooks.tsx";
import {ColumnHeader} from "../column-header/ColumnHeader.tsx";

interface RetroColumnProps {
    teamId: string;
    retroId: string;
    category: Category;
    thoughts: Thought[];
}

export interface CategoryStyling {
    backgroundColor: string;
    textColor: string
}

export function RetroColumn({teamId, retroId, category, thoughts}: RetroColumnProps) {
    const {getEffectiveTheme} = useTheme();
    const [isSorting, setSorting] = useState(false);
    const categoryStyling: CategoryStyling = useMemo(() => {
        const theme = getEffectiveTheme();
        const backgroundColor = theme === Theme.DARK ? category.darkBackgroundColor : category.lightBackgroundColor;
        const textColor = theme === Theme.DARK ? category.darkTextColor : category.lightTextColor;
        return {
            backgroundColor,
            textColor
        }
    }, [getEffectiveTheme, category])

    const handleSortToggle = () => {
        setSorting((isSorting) => !isSorting);
    }

    const sortedThoughts = useMemo(() => {
        let completedThoughts = [...thoughts.filter((thought) => thought.completed)];
        let incompleteThoughts = [...thoughts.filter((thought) => !thought.completed)];
        if(isSorting) completedThoughts = completedThoughts.sort((a, b) => b.votes - a.votes)
        if(isSorting) incompleteThoughts = incompleteThoughts.sort((a, b) => b.votes - a.votes)
        return [...incompleteThoughts, ...completedThoughts];
    }, [thoughts, isSorting]);

    return (
        <div key={`column${category.name}`} className={styles.retroCategory}>
            <ColumnHeader
                category={category}
                styling={categoryStyling}
                isSorting={isSorting}
                toggleSort={handleSortToggle}
            />
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

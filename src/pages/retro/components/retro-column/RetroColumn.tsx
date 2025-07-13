import {Category, Thought} from "../../../../services/RetroService.ts";
import {CreateThought} from "../create-thought/CreateThought.tsx";
import {ThoughtCard} from "../thought-card/ThoughtCard.tsx";
import styles from "./RetroColumn.module.css";
import {CountSeparator} from "../count-separator/CountSeparator.tsx";

interface RetroColumnProps {
    teamId: string;
    retroId: string;
    category: Category;
    thoughts: Thought[];
}

export function RetroColumn({teamId, retroId, category, thoughts}: RetroColumnProps) {
    return (
        <div key={`column${category.name}`} className={styles.retroCategory}>
            {/* TODO: Update color based on light / dark mode (preferably use a hook) */}
            <h2 className={styles.categoryName} style={{'backgroundColor': category.darkBackgroundColor}}>{category.name}</h2>
            <CreateThought 
                teamId={teamId} 
                retroId={retroId} 
                category={category.name}
            />
            <span style={{marginBottom: '0.5rem'}}/>
            <CountSeparator count={thoughts.length} />
            <ul className={styles.thoughtsList}>
                {thoughts.map(thought => (
                    <li key={`thought${thought.id}`}><ThoughtCard thought={thought} /></li>
                ))}
            </ul>
        </div>
    );
}

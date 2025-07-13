import {Category, Thought} from "../../../../services/RetroService.ts";
import {CreateThought} from "../create-thought/CreateThought.tsx";
import {ThoughtCard} from "../thought-card/ThoughtCard.tsx";

interface RetroColumnProps {
    teamId: string;
    retroId: string;
    category: Category;
    thoughts: Thought[];
}

export function RetroColumn({teamId, retroId, category, thoughts}: RetroColumnProps) {
    return (
        <div key={`column${category.name}`}>
            <h2>{category.name}</h2>
            <CreateThought 
                teamId={teamId} 
                retroId={retroId} 
                category={category.name}
            />
            <ul>
                {thoughts.map(thought => (
                    <li key={`thought${thought.id}`}><ThoughtCard thought={thought} /></li>
                ))}
            </ul>
        </div>
    );
}

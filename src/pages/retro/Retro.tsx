import {useRetro} from "./RetroContext.tsx";
import {Category, RetroService, Thought} from "../../services/RetroService.ts";
import {useState} from "react";
import style from "./RetroPage.module.css"
import {Link} from "react-router-dom";

export function RetroComponent() {
    const {retro} = useRetro();
    return (
        <div>
            <h1><Link to={`/teams/${retro.teamId}`} className={'breadcrumb'}>&lt;</Link>{retro.template.name}</h1>
            <div className={style.retroColumns}>
            {retro.template.categories.map(category => (
                <RetroColumn
                    key={category.name}
                    teamId={retro.teamId}
                    retroId={retro.id}
                    category={category}
                    thoughts={retro.thoughts.filter(thought => thought.category === category.name)}
                />
            ))}
            </div>
        </div>
    );
}

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
                    <li key={`thought${thought.id}`}>{thought.message}</li>
                ))}
            </ul>
        </div>
    );
}

interface CreateThoughtProps {
    teamId: string;
    retroId: string;
    category: string;
}

export function CreateThought({teamId, retroId, category}: CreateThoughtProps) {
    const [thought, setThought] = useState('');

    const handleBlur = async () => {
        if (thought.trim()) {
            try {
                await RetroService.createThought(teamId, retroId, thought, category);
                setThought('');
            } catch (error) {
                console.error('Error creating thought:', error);
            }
        }
    };

    return (
        <input
            value={thought}
            onChange={e => setThought(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => {if (e.key === 'Enter') handleBlur().then(() => {})}}
            placeholder="Add a thought..."
        />
    );
}
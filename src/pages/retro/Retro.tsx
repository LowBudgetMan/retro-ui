import {useRetro} from "./RetroContext.tsx";
import {Category, RetroService, Thought} from "../../services/RetroService.ts";
import {useState} from "react";

export function RetroComponent() {
    const {retro} = useRetro();
    console.log('RetroComponent rendering with retro:', retro);
    
    return (
        <main>
            <h1>Retro</h1>
            {retro.template.categories.map(category => (
                <RetroColumn 
                    key={category.name}
                    teamId={retro.teamId}
                    retroId={retro.id}
                    category={category}
                    thoughts={retro.thoughts.filter(thought => thought.category === category.name)}
                />
            ))}
        </main>
    );
}

interface RetroColumnProps {
    teamId: string;
    retroId: string;
    category: Category;
    thoughts: Thought[];
}

function RetroColumn({teamId, retroId, category, thoughts}: RetroColumnProps) {
    console.log(`Column ${category.name} rendering with thoughts:`, thoughts);
    
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

function CreateThought({teamId, retroId, category}: CreateThoughtProps) {
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
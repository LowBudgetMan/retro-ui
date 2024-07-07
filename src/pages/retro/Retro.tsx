import {useRetro} from "./RetroContext.tsx";
import {Category, RetroService, Thought} from "../../services/RetroService.ts";
import {useState} from "react";

export function RetroComponent() {
    const {retro} = useRetro();
    return (
        <main>
            <h1>Retro</h1>
            {retro.template.categories.map(category => createColumn(retro.teamId, category, retro.thoughts.filter(thought => thought.category === category.name)))}
        </main>
    )
}

function createColumn(teamId: string, category: Category, thoughts: Thought[]) {
    return (
        <div key={`column${category.name}`}>
            <h2>{category.name}</h2>
            <CreateThought teamId={teamId} columnId={0}/>
            <ul>
                {thoughts.map(thought => <li key={`thought${thought.id}`}>{thought.message}</li>)}
            </ul>
        </div>
    )
}

interface CreateThoughtProps {
    teamId: string,
    columnId: number
}

function CreateThought(props: CreateThoughtProps) {
    const {teamId, columnId} = props;
    const [thought, setThought] = useState('');
    return <input
        value={thought}
        onChange={e => setThought(e.target.value)}
        onBlur={() => RetroService.createThought(teamId, thought, columnId)}
    />
}
import {useRetro} from "./RetroContext.tsx";
import {Column, RetroService, Thought} from "../../services/RetroService.ts";
import {useState} from "react";

export function RetroComponent() {
    const {retro} = useRetro();
    return (
        <main>
            <h1>Retro</h1>
            {retro.columns.map(column => createColumn(retro.teamId, column, retro.thoughts.filter(thought => thought.columnId === column.id)))}
        </main>
    )
}

function createColumn(teamId: string, column: Column, thoughts: Thought[]) {
    return (
        <div key={`column${column.id}`}>
            <h2>{column.title}</h2>
            <CreateThought teamId={teamId} columnId={column.id}/>
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
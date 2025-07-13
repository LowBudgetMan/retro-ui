import {Thought} from "../../../../services/RetroService.ts";

interface Props {
    thought: Thought;
}

export function ThoughtCard({thought}: Props) {
    return (
        <div>
            <p>{thought.message}</p>
            <div>
                <button name='vote' aria-label={'vote'}>{thought.votes}</button>
                <button name='edit' aria-label={'edit'}>E</button>
                <button name='delete' aria-label={'delete'}>D</button>
                <button name='mark complete' aria-label={'mark complete'}>C</button>
            </div>
        </div>
    )
}
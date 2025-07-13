import { useState } from "react";
import { RetroService } from "../../../../services/RetroService.ts";

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

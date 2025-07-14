import { useState } from "react";
import {RetroService} from "../../../../services/RetroService.ts";
import styles from "./CreateThought.module.css";

interface CreateThoughtProps {
    teamId: string;
    retroId: string;
    category: string;
    borderColor: string;
}

export function CreateThought({teamId, retroId, category, borderColor}: CreateThoughtProps) {
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
            className={styles.createThoughtTextbox}
            style={{borderColor}}
        />
    );
}

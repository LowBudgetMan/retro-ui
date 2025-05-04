import { FormEvent } from "react";
import formStyle from './CreateTeamForm.module.css';
import { TeamService } from "../../../services/TeamService.ts";

interface CreateTeamFormProps {
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

export function CreateTeamForm({ onSubmitSuccess, onCancel }: CreateTeamFormProps) {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        TeamService.createTeam(nameInput.value)
            .then(() => {
                nameInput.value = '';
                onSubmitSuccess();
            })
            .catch((error) => console.error('Error creating team:', error));
    };

    const handleReset = () => {
        onCancel();
    }

    return (
        <form className={formStyle.form} onSubmit={handleSubmit} onReset={handleReset} role="form">
            <p className={formStyle.explanationText}>What should we call your new team?</p>
            <input id={'name'} name={'name'} type={'text'} placeholder={'Team name'}/>
            <div className={formStyle.modalButtonsContainer}>
                <button type={'reset'}>Close</button>
                <button type={'submit'}>Confirm</button>
            </div>
        </form>
    );
}

import {FormEvent} from "react";
import modalStyle from './CreateTeamModal.module.css';
import {TeamService} from "../../../services/TeamService.ts";

interface CreateTeamModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateTeamModal({isOpen, setIsOpen}: CreateTeamModalProps) {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        const target = e.target as typeof e.target & {
            name: { value: string };
        };
        e.preventDefault();
        TeamService.createTeam(target.name.value).then(() => setIsOpen(false));
    };

    return (
        <>
            {isOpen && <div><button className={modalStyle.backgroundButton} onClick={() => setIsOpen(false)} aria-label={'Close create team form'}></button></div>}
            <dialog open={isOpen} className={modalStyle.modalContainer}>
                <form className={modalStyle.form} onSubmit={(e) => handleSubmit(e)}>
                    <p className={modalStyle.explanationText}>What should we call your new team?</p>
                    <input id={'name'} type={'text'} placeholder={'Team Name'}/>
                    <div className={modalStyle.modalButtonsContainer}>
                        <button type={'reset'} onClick={() => setIsOpen(false)}>Close</button>
                        <button type={'submit'}>Confirm</button>
                    </div>
                </form>
            </dialog>
        </>
    )
}
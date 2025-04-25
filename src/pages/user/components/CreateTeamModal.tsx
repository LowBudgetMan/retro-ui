import {FormEvent, useEffect} from "react";
import modalStyle from './CreateTeamModal.module.css';
import {TeamService} from "../../../services/TeamService.ts";

interface CreateTeamModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateTeamModal({isOpen, setIsOpen}: CreateTeamModalProps) {
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
        }
        
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isOpen, setIsOpen]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        TeamService.createTeam(nameInput.value)
            .then(() => setIsOpen(false))
            .catch((error) => console.error('Error creating team:', error));
    };

    return (
        <>
            {isOpen && <div><button className={modalStyle.backgroundButton} onClick={() => setIsOpen(false)} aria-label={'Close create team form'}></button></div>}
            <dialog open={isOpen} className={modalStyle.modalContainer}>
                <form className={modalStyle.form} onSubmit={(e) => handleSubmit(e)} role="form">
                    <p className={modalStyle.explanationText}>What should we call your new team?</p>
                    <input id={'name'} name={'name'} type={'text'} placeholder={'Team name'}/>
                    <div className={modalStyle.modalButtonsContainer}>
                        <button type={'reset'} onClick={() => setIsOpen(false)}>Close</button>
                        <button type={'submit'}>Confirm</button>
                    </div>
                </form>
            </dialog>
        </>
    )
}

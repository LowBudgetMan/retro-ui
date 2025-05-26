import { Modal } from "../../../components/Modal/Modal";
import { CreateTeamForm } from "./CreateTeamForm";
import {useRevalidator} from "react-router-dom";

interface CreateTeamModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateTeamModal({ isOpen, setIsOpen }: CreateTeamModalProps) {
    const revalidator = useRevalidator();

    const onSubmitSuccess = () => {
        revalidator.revalidate()
            .then(() => setIsOpen(false))
            .catch((error) => console.error('Error refreshing user page content:', error));
    };

    const onCancel = () => {
        setIsOpen(false);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            setIsOpen={setIsOpen}
            backgroundButtonAriaLabel="Close create team form"
        >
            <CreateTeamForm
                onSubmitSuccess={onSubmitSuccess}
                onCancel={onCancel}
            />
        </Modal>
    );
}

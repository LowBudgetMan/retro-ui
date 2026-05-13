import {useRevalidator} from "react-router-dom";
import {Modal} from "../../../../../components/modal/Modal.tsx";
import {CreateWebhookForm} from "./CreateWebhookForm.tsx";

interface Props {
    teamId: string;
    isOpen?: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function CreateWebhookModal({teamId, isOpen, setIsOpen}: Props) {
    const revalidator = useRevalidator();

    const onCreated = () => {
        revalidator.revalidate()
            .catch((error) => console.error('Error refreshing team page content:', error));
    };

    const onClose = () => {
        setIsOpen(false);
    };

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen} backgroundButtonAriaLabel="Close create webhook form">
            <CreateWebhookForm teamId={teamId} onCreated={onCreated} onClose={onClose} />
        </Modal>
    );
}

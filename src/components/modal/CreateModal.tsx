import { ReactNode, useState } from "react";
import { Modal } from "./Modal";

interface ModalContentFunctionProps {
    isOpen?: boolean,
    setIsOpen: (isOpen: boolean) => void
}

interface CreateModalProps {
    buttonContent: ReactNode;
    buttonClassName?: string;
    modalContent: ReactNode | ((params: ModalContentFunctionProps) => ReactNode);
    backgroundButtonAriaLabel?: string;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

export function CreateModal({ 
    buttonContent, 
    buttonClassName, 
    modalContent, 
    backgroundButtonAriaLabel,
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen
}: CreateModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
    
    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;
    
    return (
        <>
            <Modal isOpen={isOpen} setIsOpen={setIsOpen} backgroundButtonAriaLabel={backgroundButtonAriaLabel}>
                {typeof modalContent === 'function' ? modalContent({isOpen, setIsOpen}) : modalContent}
            </Modal>
            <button className={buttonClassName} onClick={() => setIsOpen(true)}>
                {buttonContent}
            </button>
        </>
    );
}

import { ReactNode, useEffect } from "react";
import modalStyle from './Modal.module.css';

interface ModalProps {
    isOpen?: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children: ReactNode;
    backgroundButtonAriaLabel?: string;
}

export function Modal({ isOpen, setIsOpen, children, backgroundButtonAriaLabel = 'Close modal' }: ModalProps) {
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

    return (
        <>
            {isOpen && <div>
                <button 
                    className={modalStyle.backgroundButton} 
                    onClick={() => setIsOpen(false)}
                    aria-label={backgroundButtonAriaLabel}
                ></button>
            </div>}
            <dialog open={isOpen} className={modalStyle.modalContainer}>
                {children}
            </dialog>
        </>
    );
}

import { CreateModal } from "../../../components/Modal/CreateModal";
import pageStyles from "../UserPage.module.css";
import {CreateTeamModal} from "./CreateTeamModal.tsx";

export function CreateTeamButton() {

    return (
        <CreateModal 
            buttonContent={<p>+</p>}
            buttonClassName={pageStyles.createNewTeamButton}
            modalContent={(isOpen, setIsOpen) => (
                <CreateTeamModal isOpen={isOpen} setIsOpen={setIsOpen}/>
            )}
            backgroundButtonAriaLabel="Close create team form"
        />
    );
}

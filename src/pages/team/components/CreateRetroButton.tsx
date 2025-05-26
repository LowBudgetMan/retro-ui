import {useLoaderData} from "react-router-dom";
import {CreateModal} from "../../../components/Modal/CreateModal.tsx";
import pageStyles from "./CreateRetroButton.module.css";
import {CreateRetroForm} from "./CreateRetroForm.tsx";
import {TeamPageData} from "../teamLoader.ts";

export function CreateRetroButton() {
    const {templates} = useLoaderData() as TeamPageData;
    return (
        <CreateModal
            buttonContent={<p>+</p>}
            buttonClassName={pageStyles.createNewRetroButton}
            modalContent={(isOpen, setIsOpen) => (
                <CreateRetroForm isOpen={isOpen} setIsOpen={setIsOpen} templates={templates}/>
            )}
            backgroundButtonAriaLabel="Close create retro form"
        />
    )
}
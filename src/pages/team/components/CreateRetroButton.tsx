import {useLoaderData} from "react-router-dom";
import {CreateModal} from "../../../components/modal/CreateModal.tsx";
import pageStyles from "./CreateRetroButton.module.css";
import {CreateRetroForm} from "./CreateRetroForm.tsx";
import {TeamPageData} from "../teamLoader.ts";

export function CreateRetroButton() {
    const {templates} = useLoaderData() as TeamPageData;
    return (
        <CreateModal
            buttonContent={<p>+</p>}
            buttonClassName={pageStyles.createNewRetroButton}
            modalContent={({setIsOpen}) => (
                <CreateRetroForm 
                    onSubmitSuccess={() => setIsOpen(false)} 
                    onCancel={() => setIsOpen(false)} 
                    templates={templates}
                />
            )}
            backgroundButtonAriaLabel="Close create retro form"
        />
    )
}

import {useLoaderData, useRevalidator} from "react-router-dom";
import {RetroService, Template} from "../../../services/RetroService.ts";
import {TeamPageData} from "../teamLoader.ts";
import {CreateRetroFormOption} from "./CreateRetroFormOption.tsx";
import styles from "./CreateRetroForm.module.css";

interface CreateRetroFormProps {
    onSubmitSuccess: () => void;
    onCancel: () => void;
    templates: Template[];
}

export function CreateRetroForm({onSubmitSuccess, onCancel, templates}: CreateRetroFormProps) {
    const revalidator = useRevalidator();
    const {id: teamId} = useLoaderData() as TeamPageData;

    const handleSelection = (templateId: string) => {
        RetroService.createRetro(teamId, templateId)
            .then(() => {
                revalidator.revalidate()
                    .then(() => onSubmitSuccess())
                    .catch((error) => console.error('Error refreshing team page content:', error));
            })
            .catch((error) => console.error('Error creating retro:', error));
    };

    return (
        <div className={styles.createRetroContainer}>
            <button className={styles.closeButton} onClick={onCancel}>X</button>
            <ol className={styles.optionsList}>
                {templates.map((template) => <li key={`option-${template.id}`}>
                    <CreateRetroFormOption template={template} selectionCallback={handleSelection}/>
                </li>)}
            </ol>
        </div>
    )
}

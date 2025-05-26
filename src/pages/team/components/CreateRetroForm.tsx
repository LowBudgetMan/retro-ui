import {useRevalidator} from "react-router-dom";
import {Template} from "../../../services/RetroService.ts";
import {useCallback} from "react";

interface CreateRetroFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    templates: Template[];
}

export function CreateRetroForm({ setIsOpen, templates }: CreateRetroFormProps) {
    const revalidator = useRevalidator();

    const onSubmitSuccess = () => {
        revalidator.revalidate()
            .then(() => setIsOpen(false))
            .catch((error) => console.error('Error refreshing team page content:', error));
    };

    const onCancel = () => {
        setIsOpen(false);
    };

    const createTemplateOption = useCallback((template: Template) => {
        return (
            <li key={template.id}>
                <div>
                    <h3>{template.name}</h3>
                    {/*<p>{template.description}</p>*/}
                </div>
            </li>
        )
    }, [])

    return (
        <div>
            <h2>Choose a Retro Style</h2>
            <ul>
                {templates.map(createTemplateOption)}
            </ul>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onSubmitSuccess}>Confirm</button>
        </div>
    )
}
import {Template} from "../../../services/retro-service/RetroService.ts";
import {useCallback} from "react";
import {Link} from "react-router-dom";
import optionStyles from "./CreateRetroFormOption.module.css";
import {CategoryList} from "../../../components/category-list/CategoryList.tsx";

interface OptionProps {
    template: Template;
    selectionCallback: (templateId: string) => void;
}

export function CreateRetroFormOption({template, selectionCallback}: OptionProps) {
    const onSelect = useCallback(() => {
        selectionCallback(template.id);
    }, [template, selectionCallback])

    return (
        <div className={optionStyles.option}>
            <div className={optionStyles.displayContent}>
                <h3 className={optionStyles.title}>{template.name}</h3>
                <CategoryList categories={template.categories} />
            </div>
            <div className={optionStyles.actionsContainer}>
                <Link to={`/templates#${template.id}`} target={'_blank'} className={optionStyles.moreInfo}>Learn more</Link>
                <button className={optionStyles.selectButton} onClick={onSelect}>Use this template</button>
            </div>
        </div>
    )
}
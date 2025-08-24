import {useLoaderData} from "react-router-dom";
import {TemplatesPageData} from "./templatesLoader.ts";
import {Template} from "../../services/retro-service/RetroService.ts";
import {useCallback} from "react";
import {CategoryList} from "../../components/category-list/CategoryList.tsx";

export function TemplatesPage() {
    const {templates} = useLoaderData() as TemplatesPageData;

    const displayTemplate = useCallback((template: Template) => {
        return (<section key={template.id}>
            <h2 id={template.id}>{template.name}</h2>
            <CategoryList categories={template.categories} />
            <p>{template.description}</p>
        </section>)
    }, [])

    return (
        <div>
            <h1>Retro Templates</h1>
            {templates.map((template) => displayTemplate(template))}
        </div>
    )
}
import {Category} from "../../services/RetroService.ts";
import styles from "./CategoryList.module.css";
import {CategoryPill} from "../category-pill/CategoryPill.tsx";


interface Props {
    categories: Category[]
}

export function CategoryList({categories}: Props) {
    return (
        <ol className={styles.categoriesList}>
            {
                categories
                    .sort((a, b) => a.position - b.position)
                    .map(category => (<li key={category.name + category.position}><CategoryPill category={category} /></li>))
            }
        </ol>
    )
}
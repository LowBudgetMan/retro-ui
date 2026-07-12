import {Category} from "../../services/retro-service/RetroService.ts";
import styles from "./CategoryList.module.css";
import {CategoryPill} from "../category-pill/CategoryPill.tsx";


interface Props {
    categories: Category[],
    variant?: 'inline' | 'stacked'
}

export function CategoryList({categories, variant = 'inline'}: Props) {
    const className = variant === 'stacked'
        ? `${styles.categoriesList} ${styles.stacked}`
        : styles.categoriesList;
    return (
        <ol className={className}>
            {
                categories
                    .sort((a, b) => a.position - b.position)
                    .map(category => (<li key={category.name + category.position}><CategoryPill category={category} /></li>))
            }
        </ol>
    )
}
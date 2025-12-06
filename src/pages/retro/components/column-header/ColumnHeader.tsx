import {CategoryStyling} from "../retro-column/RetroColumn.tsx";
import {Category} from "../../../../services/retro-service/RetroService.ts";
import styles from './ColumnHeader.module.css';
import {BsCaretDown, BsCaretDownFill} from "react-icons/bs";

interface ColumnHeaderProps {
    category: Category;
    styling: CategoryStyling;
    isSorting: boolean;
    toggleSort: () => void;
}

export function ColumnHeader({category, styling, isSorting, toggleSort}: ColumnHeaderProps) {
    return (
        <>
            <h2 className={styles.categoryName} style={{
                'backgroundColor': styling.backgroundColor,
                'color': styling.textColor
            }}>
                {category.name}
                    <button
                        className={styles.sortButton}
                        aria-label={`Sort ${category.name} by ${isSorting ? 'time' : 'votes'}`}
                        onClick={toggleSort}
                    >
                    {isSorting
                        ? <BsCaretDownFill className={styles.sortIcon} color={styling.textColor}/>
                        : <BsCaretDown className={styles.sortIcon} color={styling.textColor}/>}
                </button>
            </h2>
        </>
    )
}
import {CategoryStyling} from "../retro-column/RetroColumn.tsx";
import {Category} from "../../../../services/retro-service/RetroService.ts";
import styles from './ColumnHeader.module.css';
import {BsCaretDown, BsCaretDownFill} from "react-icons/bs";
import {useEffect, useRef, useState} from "react";

interface ColumnHeaderProps {
    category: Category;
    styling: CategoryStyling;
    isSorting: boolean;
    toggleSort: () => void;
}

export function ColumnHeader({category, styling, isSorting, toggleSort}: ColumnHeaderProps) {
    const [isTooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const delay = 1000;
    const tooltipText = isSorting ? 'Sort by time added' : 'Sort by number of votes';

    const handleMouseEnter = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        hoverTimeout.current = setTimeout(() => {
            setTooltipVisible(true);
        }, delay);
    }

    const handleMouseLeave = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
        setTooltipVisible(false);
    }

    useEffect(() => () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    }, []);


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
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                    {isSorting
                        ? <BsCaretDownFill className={styles.sortIcon} color={styling.textColor}/>
                        : <BsCaretDown className={styles.sortIcon} color={styling.textColor}/>}
                    <span
                        id="sort-tooltip"
                        role="tooltip"
                        className={isTooltipVisible ? styles.tooltip : styles.tooltipHidden}
                    >
                        {tooltipText}
                    </span>
                </button>
            </h2>
        </>
    )
}
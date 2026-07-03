import {CategoryStyling} from "../retro-column/RetroColumn.tsx";
import {Category} from "../../../../services/retro-service/RetroService.ts";
import styles from './ColumnHeader.module.css';
import {BsCaretDown, BsCaretDownFill} from "react-icons/bs";
import {useEffect, useId, useRef, useState} from "react";

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

    const [isDescriptionVisible, setDescriptionVisible] = useState<boolean>(false);
    const descriptionTimeout = useRef<NodeJS.Timeout | null>(null);
    const descriptionDelay = 400;
    const descriptionId = useId();
    const hasDescription = Boolean(category.description);

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

    const handleDescriptionEnter = () => {
        if (descriptionTimeout.current) {
            clearTimeout(descriptionTimeout.current);
        }
        descriptionTimeout.current = setTimeout(() => {
            setDescriptionVisible(true);
        }, descriptionDelay);
    }

    const handleDescriptionLeave = () => {
        if (descriptionTimeout.current) {
            clearTimeout(descriptionTimeout.current);
            descriptionTimeout.current = null;
        }
        setDescriptionVisible(false);
    }

    const handleDescriptionFocus = () => {
        if (descriptionTimeout.current) {
            clearTimeout(descriptionTimeout.current);
            descriptionTimeout.current = null;
        }
        setDescriptionVisible(true);
    }

    useEffect(() => () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        if (descriptionTimeout.current) clearTimeout(descriptionTimeout.current);
    }, []);


    return (
        <>
            <h2 className={styles.categoryName} style={{
                'backgroundColor': styling.backgroundColor,
                'color': styling.textColor
            }}>
                <span
                    className={hasDescription ? styles.categoryNameText : undefined}
                    tabIndex={hasDescription ? 0 : undefined}
                    aria-describedby={hasDescription ? descriptionId : undefined}
                    onMouseEnter={hasDescription ? handleDescriptionEnter : undefined}
                    onMouseLeave={hasDescription ? handleDescriptionLeave : undefined}
                    onFocus={hasDescription ? handleDescriptionFocus : undefined}
                    onBlur={hasDescription ? handleDescriptionLeave : undefined}
                >
                    {category.name}
                </span>
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
                {hasDescription && (
                    <span
                        id={descriptionId}
                        role="tooltip"
                        className={isDescriptionVisible ? styles.descriptionTooltip : styles.descriptionTooltipHidden}
                    >
                        {category.description}
                    </span>
                )}
            </h2>
        </>
    )
}

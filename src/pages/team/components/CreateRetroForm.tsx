import {useLoaderData, useRevalidator} from "react-router-dom";
import {RetroService, Template} from "../../../services/RetroService.ts";
import {FormEvent, useEffect, useState} from "react";
import {useTheme, Theme} from "../../../styles/ThemeContext.tsx";
import {TeamPageData} from "../teamLoader.ts";
import styles from "./CreateRetroForm.module.css";

interface CreateRetroFormProps {
    onSubmitSuccess: () => void;
    onCancel: () => void;
    templates: Template[];
}

export function CreateRetroForm({ onSubmitSuccess, onCancel, templates }: CreateRetroFormProps) {
    const revalidator = useRevalidator();
    const { theme } = useTheme();
    const { id: teamId } = useLoaderData() as TeamPageData;
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = () => {
            const effectiveTheme = theme === Theme.SYSTEM
                ? (mediaQuery.matches ? Theme.DARK : Theme.LIGHT)
                : theme;
            setIsDarkMode(effectiveTheme === Theme.DARK);
        };

        updateTheme();
        
        if (theme === Theme.SYSTEM) {
            mediaQuery.addEventListener('change', updateTheme);
            return () => mediaQuery.removeEventListener('change', updateTheme);
        }
    }, [theme]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const templateInput = form.elements.namedItem('template') as HTMLInputElement;
        
        if (!templateInput || !templateInput.value) {
            alert("Please select a template");
            return;
        }

        RetroService.createRetro(teamId, templateInput.value)
            .then(() => {
                revalidator.revalidate()
                    .then(() => onSubmitSuccess())
                    .catch((error) => console.error('Error refreshing team page content:', error));
            })
            .catch((error) => console.error('Error creating retro:', error));
    };

    const handleReset = () => {
        onCancel();
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} onReset={handleReset} role="form">
            <p className={styles.explanationText}>Choose a Retro Style</p>
            <div className={styles.templateGrid}>
                {templates.map((template) => (
                    <div key={template.id} className={styles.templateOption}>
                        <input
                            type="radio"
                            id={`template-${template.id}`}
                            name="template"
                            value={template.id}
                            className={styles.hiddenRadio}
                        />
                        <label 
                            htmlFor={`template-${template.id}`}
                            className={styles.templateLabel}
                        >
                            <div className={styles.templateContent}>
                                <h3 className={styles.templateName}>{template.name}</h3>
                                <div className={styles.categoriesPreview}>
                                    {template.categories.map((category, index) => (
                                        <span 
                                            key={index}
                                            className={styles.categoryTag}
                                            style={{
                                                backgroundColor: isDarkMode ? category.darkBackgroundColor : category.lightBackgroundColor,
                                                color: isDarkMode ? category.darkTextColor : category.lightTextColor
                                            }}
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>
            <div className={styles.modalButtonsContainer}>
                <button type="reset">Close</button>
                <button type="submit">Confirm</button>
            </div>
        </form>
    )
}

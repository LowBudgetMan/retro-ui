import {useContext, useMemo} from "react";
import {RetroContext, RetroContextValue} from "./retro/RetroContext.tsx";
import {ActionItemsContext, ActionItemsContextValue} from "./action-items/ActionItemsContext.tsx";
import {ThemeContext} from "./theme/ThemeContext.tsx";
import {Theme} from "./theme/ThemeContextTypes.ts";
import {Category} from "../services/retro-service/RetroService.ts";

export function useRetro(): RetroContextValue {
    return useContext(RetroContext);
}

export function useActionItems(): ActionItemsContextValue {
    return useContext(ActionItemsContext)
}

export function useTheme() {
    return useContext(ThemeContext);
}

export function useCategoryBackgroundColor(category: Category | undefined): string | undefined {
    const {getEffectiveTheme} = useTheme();

    return useMemo(() => {
        if (!category) return undefined;
        const isDark = getEffectiveTheme() === Theme.DARK;
        return isDark ? category.darkBackgroundColor : category.lightBackgroundColor;
    }, [category, getEffectiveTheme]);
}
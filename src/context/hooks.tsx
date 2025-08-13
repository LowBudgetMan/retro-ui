import {useContext} from "react";
import {RetroContext, RetroContextValue} from "./retro/RetroContext.tsx";
import {ActionItemsContext, ActionItemsContextValue} from "./action-items/ActionItemsContext.tsx";

export function useRetro(): RetroContextValue {
    return useContext(RetroContext);
}

export function useActionItems(): ActionItemsContextValue {
    return useContext(ActionItemsContext)
}
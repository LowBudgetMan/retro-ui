export const CrudEventTypes = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
} as const;

export const RetroEventTypes = {
    TIMER_START: "TIMER_START",
    TIMER_STOP: "TIMER_STOP",
    FOCUS: "FOCUS",
    FOCUS_CLEAR: "FOCUS_CLEAR",
    SORT: "SORT",
    PHASE: "PHASE",
    RETRO_FINISHED: "RETRO_FINISHED",
} as const;

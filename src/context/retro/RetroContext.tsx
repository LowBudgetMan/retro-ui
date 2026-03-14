import {Retro, Template, Thought, transformThought} from "../../services/retro-service/RetroService.ts";
import {createContext, PropsWithChildren, useCallback, useEffect, useState} from "react";
import {DateTime} from "luxon";
import {WebsocketService} from "../../services/websocket/WebsocketService.ts";
import {retroDestination} from "../../services/websocket/destinations.ts";
import {CrudEventTypes, RetroEventTypes} from "../../services/websocket/EventTypes.ts";

export type RetroContextProviderProps = {
    retro: Retro;
}

export type RetroContextValue = {
    retro: Retro;
    createThought: (thought: Thought) => void;
    updateThought: (thought: Thought) => void;
    deleteThought: (thought: Thought) => void;
    setFinished: (isFinished: boolean) => void;
}

export const RetroContext = createContext<RetroContextValue>({
    retro: {
        id: '',
        teamId: '',
        finished: false,
        createdAt: DateTime.now(),
        thoughts: [],
        template: {} as Template
    },
    createThought: () => {},
    updateThought: () => {},
    deleteThought: () => {},
    setFinished: () => {}
});

export function RetroContextProvider({children, retro}: PropsWithChildren<RetroContextProviderProps>) {
    const [retroState, setRetroState] = useState<Retro>(retro);

    const setFinished = useCallback((isFinished: boolean) => {
        setRetroState(prevState => ({
            ...prevState,
            finished: isFinished,
        }))
    }, []);

    const createThought = useCallback((newThought: Thought) => {
        setRetroState(prevState => ({
            ...prevState,
            thoughts: [...prevState.thoughts, transformThought(newThought)]
        }));
    }, []);

    const updateThought = useCallback((updatedThought: Thought) => {
        setRetroState(prevState => {
            const index = prevState.thoughts.findIndex(t => t.id === updatedThought.id);
            if (index === -1) return prevState;

            const newThoughts = [...prevState.thoughts];
            newThoughts[index] = transformThought(updatedThought);
            return {...prevState, thoughts: newThoughts};
        });
    }, []);

    const deleteThought = useCallback((deletedThought: Thought) => {
        setRetroState(prevState => {
            const thoughts = prevState.thoughts.filter(t => t.id !== deletedThought.id);
            return {...prevState, thoughts};
        });
    }, []);

    useEffect(() => {
        const unsubscribe = WebsocketService.subscribe(
            retroDestination(retro.id, 'thoughts'),
            {
                transform: transformThought,
                [CrudEventTypes.CREATE]: createThought,
                [CrudEventTypes.UPDATE]: updateThought,
                [CrudEventTypes.DELETE]: deleteThought,
            },
            retro.id
        );
        return unsubscribe;
    }, [retro.id, createThought, updateThought, deleteThought]);

    useEffect(() => {
        const unsubscribe = WebsocketService.subscribe(
            retroDestination(retro.id, 'events'),
            {
                [RetroEventTypes.RETRO_FINISHED]: setFinished,
            },
            retro.id
        );
        return unsubscribe;
    }, [retro.id, setFinished]);

    return (
        <RetroContext.Provider value={{retro: retroState, createThought, updateThought, deleteThought, setFinished}}>
            {children}
        </RetroContext.Provider>
    );
}

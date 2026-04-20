import {Toast} from "./ToastContextTypes.ts";
import {Toast as ToastComponent} from "./Toast.tsx";
import {createContext, PropsWithChildren, useState} from "react";

type ToastContextValue = {
    toasts: Toast[]
    queueToast: (toast: Toast) => void;
}

export const ToastContext = createContext<ToastContextValue>({
    toasts: [],
    queueToast: () => {}
});

export function ToastProvider({ children }: PropsWithChildren) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const queueToast = (toast: Toast) => {
        setToasts(prevState => {
            return [...prevState, toast]
        })
    }

    const dequeueToast = () => {
        setToasts(prevState => prevState.slice(1));
    }

    return (
        <ToastContext.Provider value={{toasts, queueToast}}>
            {children}
            {toasts[0] && <ToastComponent content={toasts[0]} closeToast={dequeueToast}/>}
        </ToastContext.Provider>
    )
}
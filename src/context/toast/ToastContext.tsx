import {Toast} from "./ToastContextTypes.ts";
import {Toast as ToastComponent} from "./Toast.tsx";
import {createContext, PropsWithChildren, useEffect, useState} from "react";
import {registerToastHandler, unregisterToastHandler} from "./toastBus.ts";

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
    const [dismissCount, setDismissCount] = useState(0);

    const queueToast = (toast: Toast) => {
        setToasts(prevState => {
            return [...prevState, toast]
        })
    }

    const dequeueToast = () => {
        setToasts(prevState => prevState.slice(1));
        setDismissCount(count => count + 1);
    }

    useEffect(() => {
        registerToastHandler(queueToast);
        return unregisterToastHandler;
    }, []);

    return (
        <ToastContext.Provider value={{toasts, queueToast}}>
            {children}
            {toasts[0] && <ToastComponent key={dismissCount} content={toasts[0]} closeToast={dequeueToast}/>}
        </ToastContext.Provider>
    )
}
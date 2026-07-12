import {Toast} from "./ToastContextTypes.ts";

let queueToastRef: ((toast: Toast) => void) | null = null;

// Registered once by ToastProvider on mount so services can queue toasts
export function registerToastHandler(handler: (toast: Toast) => void): void {
    queueToastRef = handler;
}

export function unregisterToastHandler(): void {
    queueToastRef = null;
}

//  No-op if no provider is given or mounted
export function notifyToast(toast: Toast): void {
    queueToastRef?.(toast);
}
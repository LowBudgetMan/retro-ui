export type Toast = {
    message: string;
    type: ToastType;
}

export enum ToastType {
    SUCCESS = 'success',
    FAILURE = 'failure',
    INFO = 'info',
    WARNING = 'warning',
}


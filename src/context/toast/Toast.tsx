import {Toast as ToastValue, ToastType} from "./ToastContextTypes.ts";
import {TbCircleCheck, TbAlertHexagon, TbAlertCircle, TbAlertTriangle} from "react-icons/tb";
import {useEffect} from "react";
import styles from './Toast.module.css';

interface ToastProps {
    content: ToastValue,
    closeToast: () => void,
}

export function Toast({content, closeToast}: ToastProps) {
    useEffect(() => {
        setTimeout(() => {
            closeToast();
        }, 5000)
    }, [content, closeToast])

    return (
        <div className={styles.container}>
            <span className={styles.icon}>{typeToIcon(content.type)}</span>
            <span className={styles.message}>{content.message}</span>
        </div>
    );
}

function typeToIcon(type: ToastType) {
    switch (type) {
        case ToastType.SUCCESS:
            return <TbCircleCheck title={'Success'}/>;
        case ToastType.FAILURE:
            return <TbAlertHexagon title={'Error'}/>;
        case ToastType.WARNING:
            return <TbAlertTriangle title={'Warning'}/>;
        case ToastType.INFO:
        default:
            return <TbAlertCircle title={'Info'}/>;
    }
}
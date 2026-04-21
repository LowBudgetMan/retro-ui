import {Toast as ToastValue, ToastType} from "./ToastContextTypes.ts";
import {TbCircleCheck, TbAlertHexagon, TbAlertCircle, TbAlertTriangle} from "react-icons/tb";
import {useEffect, useState} from "react";
import styles from './Toast.module.css';

interface ToastProps {
    content: ToastValue,
    closeToast: () => void,
}

const DISPLAY_DURATION_MS = 3000;

export function Toast({content, closeToast}: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsExiting(true), DISPLAY_DURATION_MS);
        return () => clearTimeout(timer);
    }, []);

    const handleAnimationEnd = () => {
        if (isExiting) closeToast();
    };

    return (
        <div
            className={`${styles.container} ${isExiting ? styles.exiting : ''}`}
            data-toast-type={content.type}
            onAnimationEnd={handleAnimationEnd}
        >
            {typeToIcon(content.type)}
            <span className={styles.message}>{content.message}</span>
        </div>
    );
}

function typeToIcon(type: ToastType) {
    switch (type) {
        case ToastType.SUCCESS:
            return <TbCircleCheck title={'Success'} className={styles.icon}/>;
        case ToastType.FAILURE:
            return <TbAlertHexagon title={'Error'} className={styles.icon}/>;
        case ToastType.WARNING:
            return <TbAlertTriangle title={'Warning'} className={styles.icon}/>;
        case ToastType.INFO:
        default:
            return <TbAlertCircle title={'Info'} className={styles.icon}/>;
    }
}

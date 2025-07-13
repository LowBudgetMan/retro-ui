import styles from './CountSeparator.module.css';

interface Props {
    count: number
}

export function CountSeparator({ count }: Props) {
    return (
        <div className={styles.separatorContainer}>
            <span className={`${styles.separator} ${styles.leftLine}`}/>
            <span className={styles.count}>{count}</span>
            <span className={`${styles.separator} ${styles.rightLine}`}/>
        </div>
    )
}
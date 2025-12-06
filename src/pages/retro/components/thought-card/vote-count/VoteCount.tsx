import {FaStar} from "react-icons/fa";
import styles from './VoteCount.module.css'

interface VoteCountProps {
    votes: number;
}

export function VoteCount({votes}: VoteCountProps) {
    return (
        <div className={styles.voteCount}>
            <div className={styles.star}>
                <FaStar className={styles.starIcon} fontSize={'1rem'} aria-hidden={true}/>
                <span className={styles.starShadow}/>
            </div>
            <span className={styles.votes}>{votes}</span>
        </div>
    )
}
import style from './LandingPage.module.css';

export function LandingPage() {
    return (
        <>
            <main className={style.main}>
                <div className={style.hero}>
                    <h2 className={style.header}>Where your team uses its voice</h2>
                    <p className={style.tagline}>
                        Run retrospectives that surface what matters. Give every team member
                        a safe space to share honest feedback, then turn those insights into action items.
                    </p>
                </div>
                <div className={style.features}>
                    <div className={style.feature}>
                        <strong>Speak freely</strong> Everyone adds their thoughts independently,
                        so quieter voices get heard alongside the loudest ones.
                    </div>
                    <div className={style.feature}>
                        <strong>Vote on what matters</strong> Everyone gets to give weight to the topics. Everyone votes to prioritize the
                        topics that need attention.
                    </div>
                    <div className={style.feature}>
                        <strong>Capture action items</strong> Turn discussion into commitments.
                        Assign owners to actions and use the cards to stay on track.
                    </div>
                    <div className={style.feature}>
                        <strong>Multiple formats</strong> Pick a retrospective format
                        that fits your needs, from Plus/Delta to the classic Sailboat retro.
                    </div>
                </div>
            </main>
        </>
    );
}
import style from "./RetroPage.module.css"
import {Link, useNavigate} from "react-router-dom";
import {RetroColumn} from "./components/retro-column/RetroColumn.tsx";
import {ActionItemsTab} from "./components/action-items/ActionItemsTab.tsx";
import {useRetro} from "../../context/hooks.tsx";
import {EndRetroButton} from "./components/end-retro-button/EndRetroButton.tsx";
import {useEffect} from "react";

export function RetroComponent() {
    const {retro} = useRetro();
    const navigate = useNavigate();

    useEffect(() => {
        if(retro.finished) {
            navigate(`/teams/${retro.teamId}`)
        }
    }, [retro.finished, retro.teamId, navigate]);

    return (
        <div>
            <h1>
                <Link to={`/teams/${retro.teamId}`} className={'breadcrumb'}>&lt;</Link>
                {retro.template.name}
                <EndRetroButton teamId={retro.teamId} retroId={retro.id} />
            </h1>
            <div className={style.retroColumnsContainer}>
                <div className={style.retroColumns}>
                    {retro.template.categories.map(category => (
                        <RetroColumn
                            key={category.name}
                            teamId={retro.teamId}
                            retroId={retro.id}
                            category={category}
                            thoughts={retro.thoughts
                                .filter(thought => thought.category === category.name)
                                 .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())}
                        />
                    ))}
                </div>
            </div>
            <ActionItemsTab />
        </div>
    );
}

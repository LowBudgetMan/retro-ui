import style from "./RetroPage.module.css"
import {Link, useNavigate} from "react-router-dom";
import {RetroColumn} from "./components/retro-column/RetroColumn.tsx";
import {ActionItemsTab} from "./components/action-items/ActionItemsTab.tsx";
import {useRetro} from "../../context/hooks.tsx";
import {EndRetroButton} from "./components/end-retro-button/EndRetroButton.tsx";
import {ShareButton} from "./components/share-button/ShareButton.tsx";
import {useEffect} from "react";
import {clearShareToken, hasShareToken} from "../../services/anonymous-auth/AnonymousAuthService.ts";
import {FocusThoughtModal} from "./components/focus-thought-modal/FocusThoughtModal.tsx";

export function RetroComponent() {
    const {retro} = useRetro();
    const navigate = useNavigate();
    const anonymous = hasShareToken(retro.id);

    useEffect(() => {
        if(retro.finished) {
            if (anonymous) {
                clearShareToken(retro.id);
                navigate('/');
            } else {
                navigate(`/teams/${retro.teamId}`);
            }
        }
    }, [retro.finished, retro.teamId, retro.id, navigate, anonymous]);

    return (
        <div>
            <h1 className={style.retroHeaderContainer}>
                {!anonymous && <Link to={`/teams/${retro.teamId}`} className={'breadcrumb'}>&lt;</Link>}
                {retro.template.name}
                {!anonymous && <ShareButton teamId={retro.teamId} retroId={retro.id} />}
                {!anonymous && <EndRetroButton teamId={retro.teamId} retroId={retro.id} />}
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
            {!anonymous && <ActionItemsTab />}
            <FocusThoughtModal teamId={retro.teamId} retroId={retro.id} thoughts={retro.thoughts} />
        </div>
    );
}

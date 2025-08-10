import {useRetro} from "./RetroContext.tsx";
import style from "./RetroPage.module.css"
import {Link} from "react-router-dom";
import {RetroColumn} from "./components/retro-column/RetroColumn.tsx";

export function RetroComponent() {
    const {retro} = useRetro();
    return (
        <div>
            <h1><Link to={`/teams/${retro.teamId}`} className={'breadcrumb'}>&lt;</Link>{retro.template.name}</h1>
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
                                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

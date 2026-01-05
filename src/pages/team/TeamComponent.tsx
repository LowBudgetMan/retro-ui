import {Link} from "react-router-dom";
import {RetroCard} from "../../components/retro-card/RetroCard.tsx";
import teamStyles from "./TeamComponent.module.css";
import "../../styles/global.css";
import {CreateRetroButton} from "./components/CreateRetroButton.tsx";
import {notFoundTemplate, RetroListItem, Template} from "../../services/retro-service/RetroService.ts";
import {Invite} from "../../services/team-service/TeamService.ts";
import {TeamSidePane} from "./components/team-side-panel/TeamSidePane.tsx";

interface Props {
    id: string;
    name: string;
    invites: Invite[];
    retros: RetroListItem[];
    templates: Template[];
}

export function TeamComponent(props: Props) {
    return (
        <div className={teamStyles.teamPage}>
            <TeamSidePane id={props.id} name={props.name} invites={props.invites} />
            <main className={teamStyles.mainContent}>
                {/* This probably needs to not be directly in the h1 tag for accessibility reasons */}
                <h1><Link to={'/user'} className={'breadcrumb'} aria-label={"Back to user home"}>&lt;</Link> {props.name}
                </h1>
                <ol className={teamStyles.retrosList} data-testid="retros-list">
                    <li className={teamStyles.retroListItem}><CreateRetroButton/></li>
                    {props.retros.map(retro => <li key={retro.id + retro.teamId} className={teamStyles.retroListItem}>
                        <RetroCard retro={retro}
                                   template={props.templates.find((template) => template.id === retro.templateId) || notFoundTemplate}/>
                    </li>)}
                </ol>
            </main>
        </div>
    )
}

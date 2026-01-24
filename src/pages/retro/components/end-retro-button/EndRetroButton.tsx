import {RetroService} from "../../../../services/retro-service/RetroService.ts";
import {useNavigate} from "react-router-dom";

interface Props {
    teamId: string;
    retroId: string;
}

export function EndRetroButton({teamId, retroId}: Props) {
    const navigate = useNavigate();

    const handleClick = () => {
        RetroService.setFinished(teamId, retroId, true).then(() => navigate(`/teams/${teamId}`));
    }

    return (
        <button onClick={handleClick}>End Retro</button>
    )
}
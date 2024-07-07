import {RetroService} from "../../services/RetroService.ts";

export async function loader({params}: any) {
    return await RetroService.getRetro(params.teamId, params.retroId);
}
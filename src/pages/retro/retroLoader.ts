import {RetroService} from "../../services/RetroService.ts";

export async function loader({params}: any) {
    // TODO: Set up both active and inactive retros to have retro object
    // const retro = await RetroService.getRetro(params.teamId, params.retroId);
    return {
        teamId: params.teamId,
        thoughts: await RetroService.getThoughts(params.teamId),
        columns: await RetroService.getColumns(params.teamId)
    }
}
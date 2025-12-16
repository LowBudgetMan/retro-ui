import {TeamListItem, TeamService} from "../../services/team-service/TeamService.ts";
import {ensureAuthenticatedWithReturnUrl} from "../../utils/authSetup.ts";

export interface UserPageData {
    teams: TeamListItem[]
}

export async function loader(): Promise<UserPageData> {
    await ensureAuthenticatedWithReturnUrl();

    return {
        teams: await TeamService.getTeams()
    }
}

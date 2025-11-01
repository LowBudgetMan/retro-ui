import {TeamListItem, TeamService} from "../../services/team-service/TeamService.ts";
import {ensureAuthenticatedApi} from "../../utils/authSetup.ts";

export interface UserPageData {
    teams: TeamListItem[]
}

export async function loader(): Promise<UserPageData> {
    await ensureAuthenticatedApi();

    return {
        teams: await TeamService.getTeams()
    }
}

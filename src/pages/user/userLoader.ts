import {TeamListItem, TeamService} from "../../services/team-service/TeamService.ts";
import {waitForAuthInitialization} from "./UserContext.ts";

export interface UserPageData {
    teams: TeamListItem[]
}

export async function loader(): Promise<UserPageData> {
    await waitForAuthInitialization();
    
    return {
        teams: await TeamService.getTeams()
    }
}

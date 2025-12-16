import {ensureAuthenticatedWithReturnUrl} from "../../utils/authSetup.ts";

export interface InvitePageData {
    teamId: string,
    inviteId: string,
    teamName: string,
}

export interface InvitePackage {
    inviteId: string;
    teamId: string;
    teamName: string;
}

function throwNotNull(field: string): string {
    throw new Error(`${field} cannot be null`);
}

export async function loader({request}: {request: {url: string}}): Promise<InvitePageData> {
    await ensureAuthenticatedWithReturnUrl();
    const searchParams = new URL(request.url).searchParams;
    const invitePackageParam: string = searchParams.get('package') || throwNotNull('package');

    const invitePackage: InvitePackage = JSON.parse(atob(invitePackageParam));

    // Validate that all required fields are present
    if (!invitePackage.inviteId || !invitePackage.teamId || !invitePackage.teamName) {
        throw new Error('Invalid invite package: missing required fields');
    }

    return {
        teamId: invitePackage.teamId,
        inviteId: invitePackage.inviteId,
        teamName: invitePackage.teamName
    }
}

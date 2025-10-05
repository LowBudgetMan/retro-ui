import {loader, InvitePageData, InvitePackage} from './inviteLoader';
import {waitForAuthInitialization} from '../user/UserContext';
import '@testing-library/jest-dom';

jest.mock('../user/UserContext');

const mockWaitForAuthInitialization = waitForAuthInitialization as jest.MockedFunction<typeof waitForAuthInitialization>;

describe('inviteLoader', () => {
    const mockInvitePackage: InvitePackage = {
        inviteId: 'invite-123',
        teamId: 'team-456',
        teamName: 'Test Team'
    };

    const validPackageParam = btoa(JSON.stringify(mockInvitePackage));

    beforeEach(() => {
        jest.clearAllMocks();
        mockWaitForAuthInitialization.mockResolvedValue();
    });

    describe('Authentication', () => {
        it('should call waitForAuthInitialization', async () => {
            const request = {url: `http://localhost:3000/invite?package=${validPackageParam}`};
            await loader({request});
            expect(mockWaitForAuthInitialization).toHaveBeenCalledTimes(1);
        });

        it('should propagate authentication errors', async () => {
            mockWaitForAuthInitialization.mockRejectedValue(new Error('Auth failed'));
            const request = {url: `http://localhost:3000/invite?package=${validPackageParam}`};
            await expect(loader({request})).rejects.toThrow('Auth failed');
        });
    });

    it('should throw error when package parameter is missing or empty', async () => {
        const requestMissing = {url: 'http://localhost:3000/invite'};
        await expect(loader({request: requestMissing})).rejects.toThrow('package cannot be null');

        const requestEmpty = {url: 'http://localhost:3000/invite?package='};
        await expect(loader({request: requestEmpty})).rejects.toThrow('package cannot be null');
    });

    it('should handle invalid base64 in package parameter', async () => {
        const request = {url: 'http://localhost:3000/invite?package=invalid-base64!'};
        await expect(loader({request})).rejects.toThrow();
    });

    it('should handle malformed JSON', async () => {
        const request = {url: `http://localhost:3000/invite?package=${btoa('{"invalid": json}')}`};
        await expect(loader({request})).rejects.toThrow();
    });

    it('should handle JSON with missing required fields', async () => {
        const incompletePackage = {inviteId: 'invite-123'}; // missing teamId and teamName
        const request = {url: `http://localhost:3000/invite?package=${btoa(JSON.stringify(incompletePackage))}`};
        await expect(loader({request})).rejects.toThrow('Invalid invite package: missing required fields');
    });

    it('should handle JSON with null values for required fields', async () => {
        const nullPackage = {
            inviteId: null,
            teamId: null,
            teamName: null
        } as unknown as Partial<InvitePackage>;
        const request = {
            url: `http://localhost:3000/invite?package=${btoa(JSON.stringify(nullPackage))}`
        };

        await expect(loader({request})).rejects.toThrow('Invalid invite package: missing required fields');
    });

    it('should correctly decode, parse, and transform valid package', async () => {
        const request = {
            url: `http://localhost:3000/invite?package=${validPackageParam}`
        };

        const result = await loader({request});

        expect(result).toEqual({
            teamId: 'team-456',
            inviteId: 'invite-123',
            teamName: 'Test Team'
        });

        const actual: InvitePageData = result;
        expect(actual.teamId).toBe('team-456');
        expect(actual.inviteId).toBe('invite-123');
        expect(actual.teamName).toBe('Test Team');
    });

    it('should handle team names with special characters', async () => {
        const specialCharsPackage = {
            inviteId: 'invite-789',
            teamId: 'team-special',
            teamName: 'Team with Special Characters! @#$%'
        };
        const request = {
            url: `http://localhost:3000/invite?package=${btoa(JSON.stringify(specialCharsPackage))}`
        };

        const result = await loader({request});

        expect(result.teamName).toBe('Team with Special Characters! @#$%');
    });
});

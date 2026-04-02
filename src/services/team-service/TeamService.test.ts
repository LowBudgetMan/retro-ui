import { vi } from 'vitest';
import { fetchClient, FetchResponse } from '../../config/FetchClient';
import {Invite, TeamListItem, TeamService} from './TeamService.ts';

vi.mock('../../config/FetchClient', () => ({
    fetchClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}));

vi.mock('../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
        websocketUrl: () => 'ws://localhost:8080/websocket/websocket'
    }
}));

const TestConfig = {
  teamId: 'team-123',
  inviteId: '7136b165-7d90-42a2-8d75-ced473151094',
  teamName: 'Test Team',
  createdAt: new Date(),
};

function mockSuccess<T>(method: 'get' | 'post' | 'put' | 'delete', data: T, status = 200, headers = new Headers()) {
    vi.mocked(fetchClient[method]).mockResolvedValue({data, status, headers} as FetchResponse);
}

function mockNetworkError(method: 'get' | 'post' | 'put' | 'delete') {
    vi.mocked(fetchClient[method]).mockRejectedValue(new TypeError('Network error'));
}

function mockServerError(method: 'get' | 'post' | 'put' | 'delete') {
    vi.mocked(fetchClient[method]).mockRejectedValue(new Error('Request failed'));
}

describe('TeamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvite', () => {
      const setupCreateInviteMock = (
          headers = new Headers({location: `/api/teams/261cc597-63e6-4ea5-8c78-666c074b5685/invites/${TestConfig.inviteId}`}),
      ) => {
          mockSuccess('post', null, 201, headers);
      };

      it('should return the invite ID on successful creation', async () => {
          setupCreateInviteMock();
          const actual = await TeamService.createInvite(TestConfig.teamId);
          expect(fetchClient.post).toHaveBeenCalledWith(
              `http://localhost:8080/api/teams/${TestConfig.teamId}/invites`
          );
          expect(actual).toEqual(TestConfig.inviteId);
      });

      it('should throw exception when network call fails', async () => {
          mockNetworkError('post');
          await expect(TeamService.createInvite(TestConfig.teamId)).rejects.toThrow();
      });

      it('should throw exception when location header does not exist', async () => {
          setupCreateInviteMock(new Headers());
          await expect(TeamService.createInvite(TestConfig.teamId)).rejects.toThrow();
      });
  });

  describe('getInvitesForTeam', () => {
      const setupGetInvitesMock = (
          responseData: {id: string, teamId: string, createdAt: string}[] = [],
      ) => {
          mockSuccess('get', responseData);
      };

      it('should return a list of invites on success', async () => {
          const remoteData = [
              {id: 'invite1', teamId: 'teamId', createdAt: new Date().toISOString()},
              {id: 'invite2', teamId: 'teamId', createdAt: new Date().toISOString()}
          ];

          const expected: Invite[] = [
              {id: 'invite1', teamId: 'teamId', createdAt: new Date()},
              {id: 'invite2', teamId: 'teamId', createdAt: new Date()}
          ];

          setupGetInvitesMock(remoteData);

          const actual = await TeamService.getInvitesForTeam(TestConfig.teamId);

          expect(fetchClient.get).toHaveBeenCalledWith(
              `http://localhost:8080/api/teams/${TestConfig.teamId}/invites`
          );
          expect(actual.toString()).toEqual(expected.toString());
      });

      it('should handle server errors when fetching invites', async () => {
          mockServerError('get');
          await expect(TeamService.getInvitesForTeam(TestConfig.teamId)).rejects.toThrow();
      });

      it('should handle network errors when fetching invites', async () => {
          mockNetworkError('get');
          await expect(TeamService.getInvitesForTeam(TestConfig.teamId)).rejects.toThrow();
      });
  });

  describe('deleteInvite', () => {
      const setupDeleteInviteMock = () => {
          mockSuccess('delete', null, 204);
      };

      it('should successfully call delete endpoint', async () => {
          setupDeleteInviteMock();
          await expect(TeamService.deleteInvite(TestConfig.teamId, TestConfig.inviteId)).resolves.toBeTruthy();
          expect(fetchClient.delete).toHaveBeenCalledWith(
              `http://localhost:8080/api/teams/${TestConfig.teamId}/invites/${TestConfig.inviteId}`
          );
      });

      it('should throw exception when not 204', async () => {
          mockServerError('delete');
          await expect(TeamService.deleteInvite(TestConfig.teamId, TestConfig.inviteId)).rejects.toThrow();
      });

      it('should throw exception when there is a network error', async () => {
          mockNetworkError('delete');
          await expect(TeamService.deleteInvite(TestConfig.teamId, TestConfig.inviteId)).rejects.toThrow();
      });
  })

  describe('addUserToTeam', () => {
      const setupAddUserMock = () => {
          mockSuccess('post', null, 204);
      };

      it('should return when user successfully added to team', async () => {
          setupAddUserMock();
          await expect(TeamService.addUserToTeam(TestConfig.teamId, 'inviteId')).resolves.toBeTruthy();
          expect(fetchClient.post).toHaveBeenCalledWith(
              `http://localhost:8080/api/teams/${TestConfig.teamId}/users`,
              {inviteId: 'inviteId'}
          );
      })

      it('should throw an error when user unsuccessfully added to team', async () => {
          mockServerError('post');
          await expect(TeamService.addUserToTeam(TestConfig.teamId, 'inviteId')).rejects.toThrow();
      })
  })

  describe('getTeams', () => {
    const setupGetTeamsMock = (responseData: TeamListItem[] = []) => {
        mockSuccess('get', responseData);
    };

    it('should fetch all teams', async () => {
      const mockTeams = [
        createTeam('team-123', 'Team 1', new Date('2023-01-01')),
        createTeam('team-456', 'Team 2', new Date('2023-02-01')),
        createTeam('team-789', 'Team 3', new Date('2023-03-01'))
      ];

      setupGetTeamsMock(mockTeams);

      const result = await TeamService.getTeams();

      expect(fetchClient.get).toHaveBeenCalledWith(
          `http://localhost:8080/api/teams`
      );
      expect(result).toEqual(mockTeams);
      expect(result.length).toBe(3);
    });

    it('should return an empty array when no teams exist', async () => {
      setupGetTeamsMock([]);

      const result = await TeamService.getTeams();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle server errors when fetching teams', async () => {
      mockServerError('get');
      await expect(TeamService.getTeams()).rejects.toThrow();
    });

    it('should handle unauthorized errors when fetching teams', async () => {
      mockServerError('get');
      await expect(TeamService.getTeams()).rejects.toThrow();
    });

    it('should handle network errors when fetching teams', async () => {
      mockNetworkError('get');
      await expect(TeamService.getTeams()).rejects.toThrow();
    });
  });

  describe('getTeam', () => {
    const setupGetTeamMock = (responseData: TeamListItem) => {
        mockSuccess('get', responseData);
    };

    it('should fetch a team by id', async () => {
      const mockTeamResponse = createTeam(TestConfig.teamId, TestConfig.teamName, new Date(TestConfig.createdAt));
      setupGetTeamMock(mockTeamResponse);

      const result = await TeamService.getTeam(TestConfig.teamId);

      expect(fetchClient.get).toHaveBeenCalledWith(
          `http://localhost:8080/api/teams/${TestConfig.teamId}`
      );
      expect(result).toEqual({...mockTeamResponse, createdAt: TestConfig.createdAt});
    });

    it('should handle errors when fetching a team', async () => {
      mockServerError('get');
      await expect(TeamService.getTeam(TestConfig.teamId)).rejects.toThrow();
    });

    it('should handle network errors when fetching a team', async () => {
      mockNetworkError('get');
      await expect(TeamService.getTeam(TestConfig.teamId)).rejects.toThrow();
    });
  });

  describe('createTeam', () => {
    const setupCreateTeamMock = () => {
        mockSuccess('post', null, 201);
    };

    it('should create a new team', async () => {
      setupCreateTeamMock();

      await TeamService.createTeam(TestConfig.teamName);

      expect(fetchClient.post).toHaveBeenCalledWith(
          `http://localhost:8080/api/teams`,
          {name: TestConfig.teamName}
      );
    });

    it('should handle validation errors when creating a team', async () => {
      mockServerError('post');
      await expect(TeamService.createTeam('')).rejects.toThrow();
    });

    it('should handle server errors when creating a team', async () => {
      mockServerError('post');
      await expect(TeamService.createTeam(TestConfig.teamName)).rejects.toThrow();
    });

    it('should handle network errors when creating a team', async () => {
      mockNetworkError('post');
      await expect(TeamService.createTeam(TestConfig.teamName)).rejects.toThrow();
    });
  });
});

function createTeam(id: string = 'team-123', name: string = 'Test Team', createdAt: Date = new Date()): TeamListItem {
  return {
    id,
    name,
    createdAt,
  };
}

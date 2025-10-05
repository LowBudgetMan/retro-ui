import '@jest/globals';
import axios, {AxiosHeaders} from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {Invite, TeamListItem, TeamService} from './TeamService.ts';

const mock = new MockAdapter(axios);

const TestConfig = {
  baseUrl: 'http://localhost:8080/api',
  teamId: 'team-123',
  teamName: 'Test Team',
  createdAt: new Date(),
};

describe('TeamService', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('createInvite', () => {
      const setupCreateInviteMock = (
          statusCode: number = 201,
          isNetworkError: boolean = false,
          headers: AxiosHeaders = {location: '/api/teams/261cc597-63e6-4ea5-8c78-666c074b5685/invites/7136b165-7d90-42a2-8d75-ced473151094'} as unknown as AxiosHeaders
      ) => {
          const endpoint = `${TestConfig.baseUrl}/teams/${TestConfig.teamId}/invites`;

          if (isNetworkError) {
              mock.onPost(endpoint).networkError();
              return;
          }

          mock.onPost(endpoint).reply(statusCode, null, headers);
      }

      it('should return the invite ID on successful creation', async () => {
          setupCreateInviteMock(201, false);
          const actual = await TeamService.createInvite(TestConfig.teamId);
          expect(actual).toEqual('7136b165-7d90-42a2-8d75-ced473151094');
      });

      it('should throw exception when network call fails', async () => {
          setupCreateInviteMock(201, true);
          await expect(TeamService.createInvite(TestConfig.teamId)).rejects.toThrow();
      });

      it('should throw exception when location header does not exist', async () => {
          setupCreateInviteMock(201, false, {} as unknown as AxiosHeaders);
          await expect(TeamService.createInvite(TestConfig.teamId)).rejects.toThrow();
      });
  });

  describe('getInvitesForTeam', () => {
      const setupGetInvitesForTeamMock = (
          statusCode: number = 200,
          isNetworkError: boolean = false,
          responseData?: {id: string, teamId: string, createdAt: string}[],
      ) => {
          const endpoint = `${TestConfig.baseUrl}/teams/${TestConfig.teamId}/invites`;

          if (isNetworkError) {
              mock.onPost(endpoint).networkError();
              return;
          }

          mock.onGet(endpoint).reply(statusCode, responseData);
      }

      it('should return a list of invites on success', async () => {
          const remoteData = [
              {id: 'invite1', teamId: 'teamId', createdAt: new Date().toISOString()},
              {id: 'invite2', teamId: 'teamId', createdAt: new Date().toISOString()}
          ];

          const expected: Invite[] = [
              {id: 'invite1', teamId: 'teamId', createdAt: new Date()},
              {id: 'invite2', teamId: 'teamId', createdAt: new Date()}
          ];
          setupGetInvitesForTeamMock(200, false, remoteData);

          const actual = await TeamService.getInvitesForTeam(TestConfig.teamId);

          expect(actual.toString()).toEqual(expected.toString());
      });

      it('should handle server errors when fetching invites', async () => {
          setupGetInvitesForTeamMock(500);
          await expect(TeamService.getInvitesForTeam(TestConfig.teamId)).rejects.toThrow();
      });

      it('should handle network errors when fetching invites', async () => {
          setupGetInvitesForTeamMock(200, true);
          await expect(TeamService.getInvitesForTeam(TestConfig.teamId)).rejects.toThrow();
      });
  })

  describe('addUserToTeam', () => {
      const setupAddUserToTeamMock = (
          statusCode: number = 204,
          request: {inviteId: string},
          isNetworkError: boolean = false,
      ) => {
          const endpoint = `${TestConfig.baseUrl}/teams/${TestConfig.teamId}/users`;
          if (isNetworkError) {
              mock.onPost(endpoint, request).networkError();
              return;
          }

          mock.onPost(endpoint, request).reply(statusCode, null);
      };

      it('should return when user successfully added to team', async () => {
          const inviteId = 'inviteId';
          setupAddUserToTeamMock(204, {inviteId})
          await expect(TeamService.addUserToTeam(TestConfig.teamId, inviteId)).resolves.toBeTruthy();
      })

      it('should throw an error when user unsuccessfully added to team', async () => {
          const inviteId = 'inviteId';
          setupAddUserToTeamMock(409, {inviteId})
          await expect(TeamService.addUserToTeam(TestConfig.teamId, inviteId)).rejects.toThrow();
      })
  })

  describe('getTeams', () => {
    const setupGetTeamsMock = (
      statusCode: number = 200,
      responseData?: TeamListItem[],
      isNetworkError: boolean = false
    ) => {
      const endpoint = `${TestConfig.baseUrl}/teams`;
      
      if (isNetworkError) {
        mock.onGet(endpoint).networkError();
        return;
      }
      
      mock.onGet(endpoint).reply(statusCode, responseData);
    };

    it('should fetch all teams', async () => {
      const mockTeams = [
        createTeam('team-123', 'Team 1', new Date('2023-01-01')),
        createTeam('team-456', 'Team 2', new Date('2023-02-01')),
        createTeam('team-789', 'Team 3', new Date('2023-03-01'))
      ];
      
      setupGetTeamsMock(200, mockTeams);

      const result = await TeamService.getTeams();

      expect(result).toEqual(mockTeams);
      expect(result.length).toBe(3);
    });

    it('should return an empty array when no teams exist', async () => {
      setupGetTeamsMock(200, []);

      const result = await TeamService.getTeams();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle server errors when fetching teams', async () => {
      setupGetTeamsMock(500);
      
      await expect(TeamService.getTeams()).rejects.toThrow();
    });

    it('should handle unauthorized errors when fetching teams', async () => {
      setupGetTeamsMock(401);
      
      await expect(TeamService.getTeams()).rejects.toThrow();
    });

    it('should handle network errors when fetching teams', async () => {
      setupGetTeamsMock(0, undefined, true);
      
      await expect(TeamService.getTeams()).rejects.toThrow();
    });
  });

  describe('getTeam', () => {
    const setupGetTeamMock = (
      statusCode: number = 200, 
      responseData?: TeamListItem,
      isNetworkError: boolean = false
    ) => {
      const endpoint = `${TestConfig.baseUrl}/teams/${TestConfig.teamId}`;
      
      if (isNetworkError) {
        mock.onGet(endpoint).networkError();
        return;
      }
      
      mock.onGet(endpoint).reply(statusCode, responseData);
    };

    it('should fetch a team by id', async () => {
      const mockTeamResponse = createTeam(TestConfig.teamId, TestConfig.teamName, new Date(TestConfig.createdAt));
      setupGetTeamMock(200, mockTeamResponse);

      const result = await TeamService.getTeam(TestConfig.teamId);

      expect(result).toEqual({...mockTeamResponse, createdAt: TestConfig.createdAt});
    });

    it('should handle errors when fetching a team', async () => {
      setupGetTeamMock(404);
      await expect(TeamService.getTeam(TestConfig.teamId)).rejects.toThrow();
    });

    it('should handle network errors when fetching a team', async () => {
      setupGetTeamMock(0, undefined, true);
      await expect(TeamService.getTeam(TestConfig.teamId)).rejects.toThrow();
    });
  });

  describe('createTeam', () => {
    const setupCreateTeamMock = (
      statusCode: number = 201,
      isNetworkError: boolean = false
    ) => {
      const endpoint = `${TestConfig.baseUrl}/teams`;
      
      if (isNetworkError) {
        mock.onPost(endpoint).networkError();
        return;
      }
      
      mock.onPost(endpoint).reply(statusCode, null);
    };

    it('should create a new team', async () => {
      setupCreateTeamMock(201);

      await TeamService.createTeam(TestConfig.teamName);

      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: TestConfig.teamName });
    });

    it('should handle validation errors when creating a team', async () => {
      setupCreateTeamMock(400);
      await expect(TeamService.createTeam('')).rejects.toThrow();
    });

    it('should handle server errors when creating a team', async () => {
      setupCreateTeamMock(500);
      await expect(TeamService.createTeam(TestConfig.teamName)).rejects.toThrow();
    });

    it('should handle network errors when creating a team', async () => {
      setupCreateTeamMock(0, true);
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

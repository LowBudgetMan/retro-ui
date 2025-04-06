import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {TeamListItem, TeamService} from './TeamService';

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

      expect(result).toEqual(mockTeams.map(team => ({
        ...team,
        createdAt: team.createdAt.toISOString()
      })));
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

      expect(result).toEqual({...mockTeamResponse, createdAt: TestConfig.createdAt.toISOString()});
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

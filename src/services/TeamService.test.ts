import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { TeamService } from './TeamService';
import { Team } from './Teams.types';

const mock = new MockAdapter(axios);

const TestConfig = {
  baseUrl: 'http://localhost:8080/api',
  teamId: 'team-123',
  teamName: 'Test Team'
};

describe('TeamService', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('getTeam', () => {
    const setupGetTeamMock = (
      statusCode: number = 200, 
      responseData?: Team, 
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
      const mockTeamResponse = createTeam(TestConfig.teamId, TestConfig.teamName);
      setupGetTeamMock(200, mockTeamResponse);

      const result = await TeamService.getTeam(TestConfig.teamId);

      expect(result).toEqual(mockTeamResponse);
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

function createTeam(id: string = 'team-123', name: string = 'Test Team'): Team {
  return {
    id,
    name
  };
}

import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UserService } from './UserService';
import { Team } from './Teams.types';

const mock = new MockAdapter(axios);

const TestConfig = {
  baseUrl: 'http://localhost:8080/api',
  teams: [
    { id: 'team-123', name: 'Test Team 1' },
    { id: 'team-456', name: 'Test Team 2' }
  ]
};

describe('UserService', () => {
  beforeEach(() => {
    mock.reset();
  });

  describe('getTeamsForUser', () => {
    const setupGetTeamsForUserMock = (
      statusCode: number = 200,
      responseData?: Team[],
      isNetworkError: boolean = false
    ) => {
      const endpoint = `${TestConfig.baseUrl}/teams`;
      
      if (isNetworkError) {
        mock.onGet(endpoint).networkError();
        return;
      }
      
      mock.onGet(endpoint).reply(statusCode, responseData);
    };

    it('should fetch teams for the current user', async () => {
      setupGetTeamsForUserMock(200, TestConfig.teams);

      const result = await UserService.getTeamsForUser();

      expect(result).toEqual(TestConfig.teams);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('team-123');
      expect(result[0].name).toBe('Test Team 1');
      expect(result[1].id).toBe('team-456');
      expect(result[1].name).toBe('Test Team 2');
    });

    it('should return an empty array when user has no teams', async () => {
      setupGetTeamsForUserMock(200, []);

      const result = await UserService.getTeamsForUser();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle server errors when fetching teams', async () => {
      setupGetTeamsForUserMock(500);
      
      await expect(UserService.getTeamsForUser()).rejects.toThrow();
    });

    it('should handle unauthorized errors when fetching teams', async () => {
      setupGetTeamsForUserMock(401);
      
      await expect(UserService.getTeamsForUser()).rejects.toThrow();
    });

    it('should handle network errors when fetching teams', async () => {
      setupGetTeamsForUserMock(0, undefined, true);
      
      await expect(UserService.getTeamsForUser()).rejects.toThrow();
    });
  });
});

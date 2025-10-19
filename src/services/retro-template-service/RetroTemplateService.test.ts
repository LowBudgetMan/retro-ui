import '@jest/globals';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RetroTemplateService } from './RetroTemplateService.ts';
import { Template } from '../retro-service/RetroService.ts';
import {ApiConfig} from '../../config/ApiConfig.ts';

const mock = new MockAdapter(axios);

jest.mock('../../config/ApiConfig.ts', () => ({
    ApiConfig: {
        baseApiUrl: () => 'http://localhost:8080',
        websocketUrl: () => 'ws://localhost:8080/websocket/websocket'
    }
}));

describe('RetroTemplateService', () => {
    beforeEach(() => {
        mock.reset();
    });

    describe('getTemplates', () => {
        it('should fetch all templates successfully', async () => {
            const mockTemplatesResponse: Template[] = [
                {
                    id: 'template-1',
                    name: 'Start, Stop, Continue',
                    description: 'A classic retrospective format focusing on what to start, stop, and continue doing',
                    categories: [
                        {
                            name: 'Start',
                            position: 1,
                            lightBackgroundColor: '#e8f5e8',
                            lightTextColor: '#2d5a2d',
                            darkBackgroundColor: '#1a3d1a',
                            darkTextColor: '#90ee90'
                        },
                        {
                            name: 'Stop',
                            position: 2,
                            lightBackgroundColor: '#ffe8e8',
                            lightTextColor: '#5a2d2d',
                            darkBackgroundColor: '#3d1a1a',
                            darkTextColor: '#ff9090'
                        },
                        {
                            name: 'Continue',
                            position: 3,
                            lightBackgroundColor: '#e8f0ff',
                            lightTextColor: '#2d3d5a',
                            darkBackgroundColor: '#1a2a3d',
                            darkTextColor: '#90b0ff'
                        }
                    ]
                },
                {
                    id: 'template-2',
                    name: 'What Went Well, What Could Be Improved',
                    description: 'A simple two-column retrospective format',
                    categories: [
                        {
                            name: 'What Went Well',
                            position: 1,
                            lightBackgroundColor: '#e8f5e8',
                            lightTextColor: '#2d5a2d',
                            darkBackgroundColor: '#1a3d1a',
                            darkTextColor: '#90ee90'
                        },
                        {
                            name: 'What Could Be Improved',
                            position: 2,
                            lightBackgroundColor: '#fff8e8',
                            lightTextColor: '#5a4d2d',
                            darkBackgroundColor: '#3d321a',
                            darkTextColor: '#ffdd90'
                        }
                    ]
                }
            ];

            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, mockTemplatesResponse);

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual(mockTemplatesResponse);
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('template-1');
            expect(result[0].name).toBe('Start, Stop, Continue');
            expect(result[0].categories).toHaveLength(3);
            expect(result[1].id).toBe('template-2');
            expect(result[1].categories).toHaveLength(2);
        });

        it('should return empty array when no templates exist', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, []);

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle server errors when fetching templates', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(500, {
                error: 'Internal Server Error'
            });

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });

        it('should handle network errors when fetching templates', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).networkError();

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });

        it('should handle malformed response data', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, 'invalid json');

            const result = await RetroTemplateService.getTemplates();
            expect(result).toBe('invalid json');
        });

        it('should handle templates with minimal data', async () => {
            const minimalTemplate: Template = {
                id: 'minimal-template',
                name: 'Minimal Template',
                description: '',
                categories: []
            };

            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, [minimalTemplate]);

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual([minimalTemplate]);
            expect(result[0].categories).toHaveLength(0);
            expect(result[0].description).toBe('');
        });

        it('should handle templates with complex category structures', async () => {
            const complexTemplate: Template = {
                id: 'complex-template',
                name: 'Complex Template',
                description: 'A template with many categories',
                categories: [
                    {
                        name: 'Category 1',
                        position: 1,
                        lightBackgroundColor: '#ffffff',
                        lightTextColor: '#000000',
                        darkBackgroundColor: '#000000',
                        darkTextColor: '#ffffff'
                    },
                    {
                        name: 'Category 2',
                        position: 2,
                        lightBackgroundColor: '#f0f0f0',
                        lightTextColor: '#333333',
                        darkBackgroundColor: '#333333',
                        darkTextColor: '#f0f0f0'
                    },
                    {
                        name: 'Category 3',
                        position: 3,
                        lightBackgroundColor: '#e0e0e0',
                        lightTextColor: '#666666',
                        darkBackgroundColor: '#666666',
                        darkTextColor: '#e0e0e0'
                    }
                ]
            };

            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, [complexTemplate]);

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual([complexTemplate]);
            expect(result[0].categories).toHaveLength(3);
            expect(result[0].categories[0].position).toBe(1);
            expect(result[0].categories[1].position).toBe(2);
            expect(result[0].categories[2].position).toBe(3);
        });

        it('should verify the correct API endpoint is called', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).reply(200, []);

            await RetroTemplateService.getTemplates();

            expect(mock.history.get).toHaveLength(1);
            expect(mock.history.get[0].url).toBe(`${ApiConfig.baseApiUrl()}/api/templates`);
        });

        it('should handle timeout errors', async () => {
            mock.onGet(`${ApiConfig.baseApiUrl()}/api/templates`).timeout();

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });
    });
});

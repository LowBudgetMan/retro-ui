import { vi } from 'vitest';
import { fetchClient } from '../../config/FetchClient';
import { RetroTemplateService } from './RetroTemplateService.ts';
import { Template } from '../retro-service/RetroService.ts';
import { hexToOklch } from '../../utils/color/color.ts';

function toExpectedTemplate(template: Template): Template {
    return {
        ...template,
        categories: template.categories.map((category) => ({
            ...category,
            lightBackgroundColor: hexToOklch(category.lightBackgroundColor),
            lightTextColor: hexToOklch(category.lightTextColor),
            darkBackgroundColor: hexToOklch(category.darkBackgroundColor),
            darkTextColor: hexToOklch(category.darkTextColor),
        }))
    };
}

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

describe('RetroTemplateService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

            vi.mocked(fetchClient.get).mockResolvedValue({data: mockTemplatesResponse, status: 200, headers: new Headers()});

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual(mockTemplatesResponse.map(toExpectedTemplate));
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('template-1');
            expect(result[0].name).toBe('Start, Stop, Continue');
            expect(result[0].categories).toHaveLength(3);
            expect(result[1].id).toBe('template-2');
            expect(result[1].categories).toHaveLength(2);
        });

        it('should return empty array when no templates exist', async () => {
            vi.mocked(fetchClient.get).mockResolvedValue({data: [], status: 200, headers: new Headers()});

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle server errors when fetching templates', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Request failed'));

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });

        it('should handle network errors when fetching templates', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new TypeError('Network error'));

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });

        it('should throw when response data is not an array of templates', async () => {
            vi.mocked(fetchClient.get).mockResolvedValue({data: 'invalid json', status: 200, headers: new Headers()});

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });

        it('should handle templates with minimal data', async () => {
            const minimalTemplate: Template = {
                id: 'minimal-template',
                name: 'Minimal Template',
                description: '',
                categories: []
            };

            vi.mocked(fetchClient.get).mockResolvedValue({data: [minimalTemplate], status: 200, headers: new Headers()});

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

            vi.mocked(fetchClient.get).mockResolvedValue({data: [complexTemplate], status: 200, headers: new Headers()});

            const result = await RetroTemplateService.getTemplates();

            expect(result).toEqual([toExpectedTemplate(complexTemplate)]);
            expect(result[0].categories).toHaveLength(3);
            expect(result[0].categories[0].position).toBe(1);
            expect(result[0].categories[1].position).toBe(2);
            expect(result[0].categories[2].position).toBe(3);
        });

        it('should verify the correct API endpoint is called', async () => {
            vi.mocked(fetchClient.get).mockResolvedValue({data: [], status: 200, headers: new Headers()});

            await RetroTemplateService.getTemplates();

            expect(fetchClient.get).toHaveBeenCalledWith('http://localhost:8080/api/templates');
        });

        it('should handle timeout errors', async () => {
            vi.mocked(fetchClient.get).mockRejectedValue(new Error('Timeout'));

            await expect(RetroTemplateService.getTemplates()).rejects.toThrow();
        });
    });
});

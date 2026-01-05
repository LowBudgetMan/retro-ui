import {render, screen, within} from '@testing-library/react';
import {TeamComponent} from './TeamComponent.tsx';
import {useLoaderData} from 'react-router-dom';
import {TeamPageData} from './teamLoader';
import {RetroListItem, Template} from '../../services/retro-service/RetroService.ts';
import '@testing-library/jest-dom';
import {DateTime} from 'luxon';
import React from "react";
import {Mock} from "vitest";

vi.mock('react-router-dom', () => ({
    useLoaderData: vi.fn(),
    useRevalidator: vi.fn(),
    Link: ({to, children, ...props}: { to: string; children: React.ReactNode }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('../../components/retro-card/RetroCard.tsx', () => ({
    RetroCard: ({retro, template}: { retro: RetroListItem; template: Template }) => (
        <div data-testid={`retro-card-${retro.id}`}>
            <span data-testid="retro-template-name">{template.name}</span>
            <span data-testid="retro-id">{retro.id}</span>
            <span data-testid="retro-team-id">{retro.teamId}</span>
            <span data-testid="retro-created-date">{new Intl.DateTimeFormat("en-US").format(retro.createdAt.toJSDate())}</span>
        </div>
    ),
}));

vi.mock('./components/CreateRetroButton.tsx', () => ({
    CreateRetroButton: () => (
        <div data-testid="create-retro-button">Create Retro Button</div>
    ),
}));

vi.mock('./TeamPage.module.css', () => ({
    default: {
        teamPage: 'mock-team-page-class',
        retrosList: 'mock-retros-list-class',
        retroListItem: 'mock-retro-list-item-class',
    },
    teamPage: 'mock-team-page-class',
    retrosList: 'mock-retros-list-class',
    retroListItem: 'mock-retro-list-item-class',
}));

describe('TeamComponent', () => {
    const mockTemplates: Template[] = [
        {
            id: 'template-1',
            name: 'Start Stop Continue',
            description: 'Classic retrospective format',
            categories: [
                {
                    name: 'Start',
                    position: 0,
                    lightBackgroundColor: '#e8f5e8',
                    lightTextColor: '#2d5a2d',
                    darkBackgroundColor: '#1a3d1a',
                    darkTextColor: '#90ee90'
                }
            ]
        },
        {
            id: 'template-2',
            name: 'Mad Sad Glad',
            description: 'Emotional retrospective format',
            categories: [
                {
                    name: 'Mad',
                    position: 0,
                    lightBackgroundColor: '#ffe8e8',
                    lightTextColor: '#5a2d2d',
                    darkBackgroundColor: '#3d1a1a',
                    darkTextColor: '#ff9090'
                }
            ]
        }
    ];

    const mockRetros: RetroListItem[] = [
        {
            id: 'retro-1',
            teamId: 'team-123',
            finished: false,
            templateId: 'template-1',
            createdAt: DateTime.fromISO('2023-01-15T10:00:00Z')
        },
        {
            id: 'retro-2',
            teamId: 'team-123',
            finished: true,
            templateId: 'template-2',
            createdAt: DateTime.fromISO('2023-01-20T14:30:00Z')
        }
    ];

    const mockTeamData: TeamPageData = {
        id: 'team-123',
        name: 'Test Team',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        retros: mockRetros,
        templates: mockTemplates,
        invites: [],
        actionItems: []
    };

    const teamComponent = <TeamComponent id={'team-123'} name={'Test Team'} retros={mockRetros} templates={mockTemplates} invites={[]}/>;

    describe('Rendering', () => {
        it('should render the home link', () => {
            render(teamComponent);

            const homeLink = screen.getByRole('link', {name: 'Back to user home'});
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/user');
        });

        it('should render the team name', () => {
            render(teamComponent);
            expect(screen.getByText('Test Team')).toBeInTheDocument();
        });

        it('should render CreateRetroButton as first list item', () => {
            render(teamComponent);

            const createRetroButton = screen.getByTestId('create-retro-button');
            expect(createRetroButton).toBeInTheDocument();

            const retrosList = screen.getByTestId('retros-list');
            const listItems = within(retrosList).getAllByRole('listitem');
            expect(listItems).toHaveLength(3); // CreateRetroButton + 2 retros
            expect(listItems[0]).toContainElement(createRetroButton);
        });
    });

    describe('Retro Cards Rendering', () => {
        it('should render RetroCard for each retro', () => {
            render(teamComponent);

            expect(screen.getByTestId('retro-card-retro-1')).toBeInTheDocument();
            expect(screen.getByTestId('retro-card-retro-2')).toBeInTheDocument();
        });

        it('should match retros with correct templates', () => {
            render(teamComponent);

            const templateNames = screen.getAllByTestId('retro-template-name');
            expect(templateNames).toHaveLength(2);
            expect(templateNames[0]).toHaveTextContent('Start Stop Continue');
            expect(templateNames[1]).toHaveTextContent('Mad Sad Glad');
        });
    });

    describe('Template Matching', () => {
        it('should use notFoundTemplate when template is not found', () => {
            const retroWithMissingTemplate: RetroListItem = {
                id: 'retro-3',
                teamId: 'team-123',
                finished: false,
                templateId: 'non-existent-template',
                createdAt: DateTime.fromISO('2023-01-25T09:00:00Z')
            };

            const teamDataWithMissingTemplate: TeamPageData = {
                ...mockTeamData,
                retros: [...mockRetros, retroWithMissingTemplate]
            };

            (useLoaderData as Mock).mockReturnValue(teamDataWithMissingTemplate);

            render(<TeamComponent id={mockTeamData.id} name={mockTeamData.name} invites={mockTeamData.invites}
                                  retros={[...mockRetros, retroWithMissingTemplate]}
                                  templates={mockTeamData.templates}/>);

            const templateNames = screen.getAllByTestId('retro-template-name');
            expect(templateNames[2]).toHaveTextContent('Retro Type Not Found');
        });

        it('should correctly match templates by id', () => {
            render(teamComponent);

            const retro1TemplateId = screen.getAllByTestId('retro-id')[0];
            const retro2TemplateId = screen.getAllByTestId('retro-id')[1];

            expect(retro1TemplateId).toHaveTextContent('retro-1');
            expect(retro2TemplateId).toHaveTextContent('retro-2');
        });
    });

    describe('Navigation', () => {
        it('should render home link with correct href', () => {
            render(teamComponent);

            const homeLink = screen.getByRole('link', {name: 'Back to user home'});
            expect(homeLink).toHaveAttribute('href', '/user');
        });
    });
});

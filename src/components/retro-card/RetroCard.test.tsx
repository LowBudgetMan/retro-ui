import {render, screen} from '@testing-library/react';
import {RetroCard} from './RetroCard';
import {RetroListItem, Template} from '../../services/retro-service/RetroService.ts';
import '@testing-library/jest-dom';
import {DateTime} from 'luxon';

interface MockLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className, ...props }: MockLinkProps) => (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('./RetroCard.module.css', () => ({
  default: {
    link: 'mock-link-class',
    retroCard: 'mock-retro-card-class',
    retroName: 'mock-retro-name-class',
    retroCreatedDate: 'mock-retro-created-date-class',
  },
  link: 'mock-link-class',
  retroCard: 'mock-retro-card-class',
  retroName: 'mock-retro-name-class',
  retroCreatedDate: 'mock-retro-created-date-class',
}));

describe('RetroCard', () => {
  const mockTemplate: Template = {
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
      },
      {
        name: 'Stop',
        position: 1,
        lightBackgroundColor: '#ffe8e8',
        lightTextColor: '#5a2d2d',
        darkBackgroundColor: '#3d1a1a',
        darkTextColor: '#ff9090'
      },
      {
        name: 'Continue',
        position: 2,
        lightBackgroundColor: '#e8e8ff',
        lightTextColor: '#2d2d5a',
        darkBackgroundColor: '#1a1a3d',
        darkTextColor: '#9090ff'
      }
    ]
  };

  const mockRetro: RetroListItem = {
    id: 'retro-123',
    teamId: 'team-456',
    finished: false,
    templateId: 'template-1',
    createdAt: DateTime.fromISO('2023-01-15T10:30:00Z')
  };

  describe('Rendering', () => {
    it('should render the retro card as a link', () => {
      render(<RetroCard retro={mockRetro} template={mockTemplate} />);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/teams/team-456/retros/retro-123');
    });

      it('should not render the card as a link if the retro is finished', () => {
          render(<RetroCard retro={{...mockRetro, finished: true}} template={mockTemplate} />);
          expect(screen.queryByRole('link')).toBeNull();
      });

      it('should render the template name', () => {
      render(<RetroCard retro={mockRetro} template={mockTemplate} />);
      expect(screen.getByText('Start Stop Continue')).toBeInTheDocument();
    });

    it('should render the formatted creation date', () => {
      render(<RetroCard retro={mockRetro} template={mockTemplate} />);
      expect(screen.getByText('1/15/2023')).toBeInTheDocument();
    });
  });
});

import { render, screen } from '@testing-library/react';
import { TemplatesPage } from './TemplatesPage';
import { useLoaderData } from 'react-router-dom';
import { TemplatesPageData } from './templatesLoader';
import { Template } from '../../services/RetroService';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
}));

jest.mock('../../styles/ThemeContext.tsx', () => ({
  useTheme: () => ({
    theme: 'light'
  }),
  Theme: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  }
}));

const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('TemplatesPage', () => {
  const mockTemplates: Template[] = [
    {
      id: 'template-1',
      name: 'Start Stop Continue',
      description: 'Classic retrospective format focusing on what to start, stop, and continue doing.',
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
    },
    {
      id: 'template-2',
      name: 'Mad Sad Glad',
      description: 'Emotional retrospective format to express feelings about the sprint.',
      categories: [
        {
          name: 'Mad',
          position: 0,
          lightBackgroundColor: '#ffe8e8',
          lightTextColor: '#5a2d2d',
          darkBackgroundColor: '#3d1a1a',
          darkTextColor: '#ff9090'
        },
        {
          name: 'Sad',
          position: 1,
          lightBackgroundColor: '#fff8e8',
          lightTextColor: '#5a4d2d',
          darkBackgroundColor: '#3d2f1a',
          darkTextColor: '#ffcc90'
        },
        {
          name: 'Glad',
          position: 2,
          lightBackgroundColor: '#e8f5e8',
          lightTextColor: '#2d5a2d',
          darkBackgroundColor: '#1a3d1a',
          darkTextColor: '#90ee90'
        }
      ]
    },
    {
      id: 'template-3',
      name: 'What Went Well',
      description: 'Simple format focusing on positive outcomes and improvements.',
      categories: [
        {
          name: 'What went well',
          position: 0,
          lightBackgroundColor: '#e8f5e8',
          lightTextColor: '#2d5a2d',
          darkBackgroundColor: '#1a3d1a',
          darkTextColor: '#90ee90'
        },
        {
          name: 'What could be improved',
          position: 1,
          lightBackgroundColor: '#fff8e8',
          lightTextColor: '#5a4d2d',
          darkBackgroundColor: '#3d2f1a',
          darkTextColor: '#ffcc90'
        }
      ]
    }
  ];

  const mockTemplatesPageData: TemplatesPageData = {
    templates: mockTemplates
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLoaderData as jest.Mock).mockReturnValue(mockTemplatesPageData);
  });

  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<TemplatesPage />);
      expect(screen.getByText('Retro Templates')).toBeInTheDocument();
    });

    it('should render all template names as headings', () => {
      render(<TemplatesPage />);
      
      expect(screen.getByRole('heading', { name: 'Start Stop Continue' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Mad Sad Glad' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'What Went Well' })).toBeInTheDocument();
    });

    it('should render all template descriptions', () => {
      render(<TemplatesPage />);
      
      expect(screen.getByText('Classic retrospective format focusing on what to start, stop, and continue doing.')).toBeInTheDocument();
      expect(screen.getByText('Emotional retrospective format to express feelings about the sprint.')).toBeInTheDocument();
      expect(screen.getByText('Simple format focusing on positive outcomes and improvements.')).toBeInTheDocument();
    });

    it('should render category names for all templates', () => {
      render(<TemplatesPage />);
      
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
      
      expect(screen.getByText('Mad')).toBeInTheDocument();
      expect(screen.getByText('Sad')).toBeInTheDocument();
      expect(screen.getByText('Glad')).toBeInTheDocument();
      
      expect(screen.getByText('What went well')).toBeInTheDocument();
      expect(screen.getByText('What could be improved')).toBeInTheDocument();
    });

    it('should set template id as heading id attribute', () => {
      render(<TemplatesPage />);
      
      const startStopContinueHeading = screen.getByRole('heading', { name: 'Start Stop Continue' });
      const madSadGladHeading = screen.getByRole('heading', { name: 'Mad Sad Glad' });
      const whatWentWellHeading = screen.getByRole('heading', { name: 'What Went Well' });
      
      expect(startStopContinueHeading).toHaveAttribute('id', 'template-1');
      expect(madSadGladHeading).toHaveAttribute('id', 'template-2');
      expect(whatWentWellHeading).toHaveAttribute('id', 'template-3');
    });
  });
});

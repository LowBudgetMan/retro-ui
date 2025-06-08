import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateRetroForm } from './CreateRetroForm';
import { RetroService, Template } from '../../../services/RetroService';
import { useTheme, Theme } from '../../../styles/ThemeContext';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
  useRevalidator: jest.fn(),
}));

jest.mock('../../../services/RetroService.ts', () => ({
  RetroService: {
    createRetro: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../styles/ThemeContext.tsx', () => ({
  useTheme: jest.fn(),
  Theme: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
}));

jest.mock('./CreateRetroForm.module.css', () => ({
  form: 'mock-form-class',
  explanationText: 'mock-explanation-text-class',
  templateGrid: 'mock-template-grid-class',
  templateOption: 'mock-template-option-class',
  hiddenRadio: 'mock-hidden-radio-class',
  templateLabel: 'mock-template-label-class',
  templateContent: 'mock-template-content-class',
  templateName: 'mock-template-name-class',
  categoriesPreview: 'mock-categories-preview-class',
  categoryTag: 'mock-category-tag-class',
  modalButtonsContainer: 'mock-modal-buttons-container-class',
}));

describe('CreateRetroForm', () => {
  const mockRevalidate = jest.fn().mockResolvedValue(undefined);
  const mockRevalidator = {
    revalidate: mockRevalidate,
    state: 'idle'
  };

  const mockTeamData = {
    id: 'team-123',
    name: 'Test Team',
    retros: [],
    templates: []
  };

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
        },
        {
          name: 'Stop',
          position: 1,
          lightBackgroundColor: '#ffe8e8',
          lightTextColor: '#5a2d2d',
          darkBackgroundColor: '#3d1a1a',
          darkTextColor: '#ff9090'
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

  const defaultProps = {
    onSubmitSuccess: jest.fn(),
    onCancel: jest.fn(),
    templates: mockTemplates
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRevalidator as jest.Mock).mockReturnValue(mockRevalidator);
    (useLoaderData as jest.Mock).mockReturnValue(mockTeamData);
    (useTheme as jest.Mock).mockReturnValue({ theme: Theme.LIGHT });
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Rendering', () => {
    it('should render the form with explanation text', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByText('Choose a Retro Style')).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should render all template options', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByText('Start Stop Continue')).toBeInTheDocument();
      expect(screen.getByText('Mad Sad Glad')).toBeInTheDocument();
    });

    it('should render template categories with correct styling in light mode', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const startCategory = screen.getByText('Start');
      expect(startCategory).toBeInTheDocument();
      expect(startCategory).toHaveStyle({
        backgroundColor: '#e8f5e8',
        color: '#2d5a2d'
      });
    });

    it('should render template categories with correct styling in dark mode', () => {
      (useTheme as jest.Mock).mockReturnValue({ theme: Theme.DARK });
      
      render(<CreateRetroForm {...defaultProps} />);
      
      const startCategory = screen.getByText('Start');
      expect(startCategory).toHaveStyle({
        backgroundColor: '#1a3d1a',
        color: '#90ee90'
      });
    });

    it('should render template categories with correct styling in system mode with dark preference', () => {
      (useTheme as jest.Mock).mockReturnValue({ theme: Theme.SYSTEM });
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: true, // Dark mode preference
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(<CreateRetroForm {...defaultProps} />);
      
      const startCategory = screen.getByText('Start');
      expect(startCategory).toHaveStyle({
        backgroundColor: '#1a3d1a',
        color: '#90ee90'
      });
    });

    it('should render radio inputs for each template', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      const template2Radio = screen.getByRole('radio', { name: /mad sad glad/i });
      
      expect(template1Radio).toBeInTheDocument();
      expect(template2Radio).toBeInTheDocument();
      expect(template1Radio).toHaveAttribute('value', 'template-1');
      expect(template2Radio).toHaveAttribute('value', 'template-2');
    });

    it('should render Close and Confirm buttons', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Theme handling', () => {
    it('should listen for system theme changes when theme is SYSTEM', () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: mockAddEventListener,
          removeEventListener: mockRemoveEventListener,
          dispatchEvent: jest.fn(),
        })),
      });

      (useTheme as jest.Mock).mockReturnValue({ theme: Theme.SYSTEM });
      
      const { unmount } = render(<CreateRetroForm {...defaultProps} />);
      
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should not listen for system theme changes when theme is not SYSTEM', () => {
      const mockAddEventListener = jest.fn();
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: mockAddEventListener,
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      (useTheme as jest.Mock).mockReturnValue({ theme: Theme.LIGHT });
      
      render(<CreateRetroForm {...defaultProps} />);
      
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onCancel when Close button is clicked', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should allow selecting a template', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      
      fireEvent.click(template1Radio);
      
      expect(template1Radio).toBeChecked();
    });

    it('should allow switching between templates', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      const template2Radio = screen.getByRole('radio', { name: /mad sad glad/i });
      
      fireEvent.click(template1Radio);
      expect(template1Radio).toBeChecked();
      expect(template2Radio).not.toBeChecked();
      
      fireEvent.click(template2Radio);
      expect(template2Radio).toBeChecked();
      expect(template1Radio).not.toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('should show alert when no template is selected', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.submit(screen.getByRole('form'));
      
      expect(alertSpy).toHaveBeenCalledWith('Please select a template');
      expect(RetroService.createRetro).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });

    it('should call RetroService.createRetro with correct parameters when template is selected', async () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      fireEvent.click(template1Radio);
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
      });
    });

    it('should call revalidator.revalidate after successful retro creation', async () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      fireEvent.click(template1Radio);
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
      });
    });

    it('should call onSubmitSuccess after successful retro creation and revalidation', async () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      fireEvent.click(template1Radio);
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
        expect(defaultProps.onSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should handle error when retro creation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (RetroService.createRetro as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      fireEvent.click(template1Radio);
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating retro:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle error when revalidation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRevalidate.mockRejectedValueOnce(new Error('Revalidation error'));
      
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      fireEvent.click(template1Radio);
      fireEvent.submit(screen.getByRole('form'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error refreshing team page content:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form role', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should have proper radio group structure', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
      
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'template');
      });
    });

    it('should have proper labels for radio buttons', () => {
      render(<CreateRetroForm {...defaultProps} />);
      
      const template1Radio = screen.getByRole('radio', { name: /start stop continue/i });
      const template2Radio = screen.getByRole('radio', { name: /mad sad glad/i });
      
      expect(template1Radio).toHaveAttribute('id', 'template-template-1');
      expect(template2Radio).toHaveAttribute('id', 'template-template-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty templates array', () => {
      render(<CreateRetroForm {...defaultProps} templates={[]} />);
      
      expect(screen.getByText('Choose a Retro Style')).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('should handle template with no categories', () => {
      const templateWithNoCategories: Template[] = [
        {
          id: 'template-empty',
          name: 'Empty Template',
          description: 'Template with no categories',
          categories: []
        }
      ];
      
      render(<CreateRetroForm {...defaultProps} templates={templateWithNoCategories} />);
      
      expect(screen.getByText('Empty Template')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /empty template/i })).toBeInTheDocument();
    });
  });
});

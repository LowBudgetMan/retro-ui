import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateRetroForm } from './CreateRetroForm';
import { RetroService, Template } from '../../../services/retro-service/RetroService.ts';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useLoaderData: vi.fn(),
  useRevalidator: vi.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../services/retro-service/RetroService.ts', () => ({
  RetroService: {
    createRetro: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./CreateRetroForm.module.css', () => ({
  default: {
    createRetroContainer: 'mock-create-retro-container-class',
    closeButton: 'mock-close-button-class',
    optionsList: 'mock-options-list-class',
  },
}));

interface MockCreateRetroFormOptionProps {
  template: Template;
  selectionCallback: (templateId: string) => void;
}

vi.mock('./CreateRetroFormOption.tsx', () => ({
  CreateRetroFormOption: ({ template, selectionCallback }: MockCreateRetroFormOptionProps) => (
    <div data-testid={`option-${template.id}`}>
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <button
        data-testid={`select-${template.id}`}
        onClick={() => selectionCallback(template.id)}
      >
        Use this template
      </button>
    </div>
  ),
}));

describe('CreateRetroForm', () => {
  const mockRevalidate = vi.fn().mockResolvedValue(undefined);
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
    onSubmitSuccess: vi.fn(),
    onCancel: vi.fn(),
    templates: mockTemplates
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRevalidator as ReturnType<typeof vi.fn>).mockReturnValue(mockRevalidator);
    (useLoaderData as ReturnType<typeof vi.fn>).mockReturnValue(mockTeamData);
  });

  describe('Rendering', () => {
    it('should render the container with close button', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
    });

    it('should render a list of template options', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      const optionsList = screen.getByRole('list');
      expect(optionsList).toBeInTheDocument();
      
      // Check that all templates are rendered as options
      expect(screen.getByTestId('option-template-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-template-2')).toBeInTheDocument();
    });

    it('should render all template options with correct content', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByText('Start Stop Continue')).toBeInTheDocument();
      expect(screen.getByText('Mad Sad Glad')).toBeInTheDocument();
      expect(screen.getByText('Classic retrospective format')).toBeInTheDocument();
      expect(screen.getByText('Emotional retrospective format')).toBeInTheDocument();
    });

    it('should render selection buttons for each template', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      expect(screen.getByTestId('select-template-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-template-2')).toBeInTheDocument();
      
      const selectButtons = screen.getAllByText('Use this template');
      expect(selectButtons).toHaveLength(2);
    });

    it('should render list items for each template', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    it('should call onCancel when close button is clicked', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'X' }));
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should pass handleSelection to each option component', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      // Verify that the selection buttons are present, indicating handleSelection was passed
      expect(screen.getByTestId('select-template-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-template-2')).toBeInTheDocument();
    });
  });

  describe('Selection Handling', () => {
    it('should call RetroService.createRetro when handleSelection is called', async () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
      });
    });

    it('should call revalidator.revalidate after successful retro creation', async () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
      });
    });

    it('should call onSubmitSuccess after successful retro creation and revalidation', async () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
        expect(defaultProps.onSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should handle different template selections correctly', async () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      // Test first template
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
      });
      
      vi.clearAllMocks();

      // Test second template
      fireEvent.click(screen.getByTestId('select-template-2'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-2');
      });
    });

    it('should handle error when retro creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (RetroService.createRetro as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API error'));
      
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating retro:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle error when revalidation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRevalidate.mockRejectedValueOnce(new Error('Revalidation error'));
      
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
        expect(mockRevalidate).toHaveBeenCalled();
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error refreshing team page content:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty templates array', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} templates={[]} />);
      
      const optionsList = screen.getByRole('list');
      expect(optionsList).toBeInTheDocument();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
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
      
      renderWithRouter(<CreateRetroForm {...defaultProps} templates={templateWithNoCategories} />);
      
      expect(screen.getByText('Empty Template')).toBeInTheDocument();
      expect(screen.getByTestId('option-template-empty')).toBeInTheDocument();
      expect(screen.getByTestId('select-template-empty')).toBeInTheDocument();
    });

    it('should render correct number of list items for any number of templates', () => {
      const singleTemplate = [mockTemplates[0]];
      
      renderWithRouter(<CreateRetroForm {...defaultProps} templates={singleTemplate} />);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });
  });

  describe('Component Integration', () => {
    it('should pass template data correctly to CreateRetroFormOption components', () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      // Verify that template data is passed correctly by checking rendered content
      expect(screen.getByText('Start Stop Continue')).toBeInTheDocument();
      expect(screen.getByText('Mad Sad Glad')).toBeInTheDocument();
      expect(screen.getByText('Classic retrospective format')).toBeInTheDocument();
      expect(screen.getByText('Emotional retrospective format')).toBeInTheDocument();
    });

    it('should pass selectionCallback correctly to CreateRetroFormOption components', async () => {
      renderWithRouter(<CreateRetroForm {...defaultProps} />);
      
      // Test that clicking the button triggers the callback
      fireEvent.click(screen.getByTestId('select-template-1'));
      
      await waitFor(() => {
        expect(RetroService.createRetro).toHaveBeenCalledWith('team-123', 'template-1');
      });
    });
  });
});

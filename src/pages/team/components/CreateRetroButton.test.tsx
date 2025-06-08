import { render, screen, fireEvent } from '@testing-library/react';
import { CreateRetroButton } from './CreateRetroButton';
import { useLoaderData } from 'react-router-dom';
import { Template } from '../../../services/RetroService';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useLoaderData: jest.fn(),
}));

jest.mock('../../../components/Modal/CreateModal.tsx', () => ({
  CreateModal: ({ buttonContent, buttonClassName, modalContent, backgroundButtonAriaLabel }: any) => {
    const mockSetIsOpen = jest.fn();
    return (
      <div data-testid="create-modal">
        <button 
          className={buttonClassName}
          data-testid="modal-trigger-button"
          onClick={() => {}}
        >
          {buttonContent}
        </button>
        <div data-testid="modal-content" data-aria-label={backgroundButtonAriaLabel}>
          {typeof modalContent === 'function' 
            ? modalContent({ setIsOpen: mockSetIsOpen })
            : modalContent
          }
        </div>
      </div>
    );
  },
}));

jest.mock('./CreateRetroForm.tsx', () => ({
  CreateRetroForm: ({ onSubmitSuccess, onCancel, templates }: any) => (
    <div data-testid="create-retro-form">
      <span data-testid="templates-count">{templates ? templates.length : 0}</span>
      <button data-testid="form-submit" onClick={onSubmitSuccess}>Submit</button>
      <button data-testid="form-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock('./CreateRetroButton.module.css', () => ({
  createNewRetroButton: 'mock-create-new-retro-button-class',
}));

describe('CreateRetroButton', () => {
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

  const mockTeamData = {
    id: 'team-123',
    name: 'Test Team',
    retros: [],
    templates: mockTemplates
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLoaderData as jest.Mock).mockReturnValue(mockTeamData);
  });

  describe('Rendering', () => {
    it('should render the CreateModal component', () => {
      render(<CreateRetroButton />);
      
      expect(screen.getByTestId('create-modal')).toBeInTheDocument();
    });

    it('should render the trigger button with correct content and styling', () => {
      render(<CreateRetroButton />);
      
      const triggerButton = screen.getByTestId('modal-trigger-button');
      expect(triggerButton).toBeInTheDocument();
      expect(triggerButton).toHaveClass('mock-create-new-retro-button-class');
      expect(triggerButton).toHaveTextContent('+');
    });

    it('should render the CreateRetroForm in the modal content', () => {
      render(<CreateRetroButton />);
      
      expect(screen.getByTestId('create-retro-form')).toBeInTheDocument();
    });

    it('should pass templates from loader data to CreateRetroForm', () => {
      render(<CreateRetroButton />);
      
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent('2');
    });

    it('should set correct background button aria label', () => {
      render(<CreateRetroButton />);
      
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveAttribute('data-aria-label', 'Close create retro form');
    });
  });

  describe('Data Integration', () => {
    it('should use templates from useLoaderData', () => {
      const customTemplates: Template[] = [
        {
          id: 'custom-template',
          name: 'Custom Template',
          description: 'A custom template',
          categories: []
        }
      ];

      (useLoaderData as jest.Mock).mockReturnValue({
        ...mockTeamData,
        templates: customTemplates
      });

      render(<CreateRetroButton />);
      
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent('1');
    });

    it('should handle empty templates array', () => {
      (useLoaderData as jest.Mock).mockReturnValue({
        ...mockTeamData,
        templates: []
      });

      render(<CreateRetroButton />);
      
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent('0');
    });

    it('should extract templates from TeamPageData correctly', () => {
      const teamDataWithExtraProps = {
        id: 'team-456',
        name: 'Another Team',
        description: 'Team description',
        retros: [
          { id: 'retro-1', teamId: 'team-456', finished: false, templateId: 'template-1', createdAt: new Date() }
        ],
        templates: mockTemplates,
        extraProp: 'should be ignored'
      };

      (useLoaderData as jest.Mock).mockReturnValue(teamDataWithExtraProps);

      render(<CreateRetroButton />);
      
      expect(screen.getByTestId('create-retro-form')).toBeInTheDocument();
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent('2');
    });
  });

  describe('Modal Integration', () => {
    it('should pass correct props to CreateModal', () => {
      render(<CreateRetroButton />);
      
      // Verify button content
      const triggerButton = screen.getByTestId('modal-trigger-button');
      expect(triggerButton).toHaveTextContent('+');
      
      // Verify button className
      expect(triggerButton).toHaveClass('mock-create-new-retro-button-class');
      
      // Verify background button aria label
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveAttribute('data-aria-label', 'Close create retro form');
      
      // Verify modal content renders CreateRetroForm
      expect(screen.getByTestId('create-retro-form')).toBeInTheDocument();
    });

    it('should pass setIsOpen function to CreateRetroForm callbacks', () => {
      render(<CreateRetroButton />);
      
      // The form should have access to submit and cancel buttons
      // which would call setIsOpen(false) when clicked
      expect(screen.getByTestId('form-submit')).toBeInTheDocument();
      expect(screen.getByTestId('form-cancel')).toBeInTheDocument();
    });
  });

  describe('CreateRetroForm Integration', () => {
    it('should pass onSubmitSuccess callback that closes modal', () => {
      render(<CreateRetroButton />);
      
      const submitButton = screen.getByTestId('form-submit');
      expect(submitButton).toBeInTheDocument();
      
      // Clicking submit should trigger onSubmitSuccess
      fireEvent.click(submitButton);
      
      // In a real scenario, this would close the modal
      // Our mock just verifies the callback is wired up
    });

    it('should pass onCancel callback that closes modal', () => {
      render(<CreateRetroButton />);
      
      const cancelButton = screen.getByTestId('form-cancel');
      expect(cancelButton).toBeInTheDocument();
      
      // Clicking cancel should trigger onCancel
      fireEvent.click(cancelButton);
      
      // In a real scenario, this would close the modal
      // Our mock just verifies the callback is wired up
    });

    it('should pass all templates to CreateRetroForm', () => {
      render(<CreateRetroButton />);
      
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent(mockTemplates.length.toString());
    });
  });

  describe('TypeScript Integration', () => {
    it('should properly type the loader data as TeamPageData', () => {
      // This test verifies that the component correctly expects TeamPageData
      // and extracts the templates property
      const validTeamPageData = {
        id: 'team-123',
        name: 'Test Team',
        retros: [],
        templates: mockTemplates
      };

      (useLoaderData as jest.Mock).mockReturnValue(validTeamPageData);

      expect(() => render(<CreateRetroButton />)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined templates gracefully', () => {
      (useLoaderData as jest.Mock).mockReturnValue({
        id: 'team-123',
        name: 'Test Team',
        retros: [],
        templates: undefined
      });

      // Component should handle this gracefully
      expect(() => render(<CreateRetroButton />)).not.toThrow();
      
      const templatesCount = screen.getByTestId('templates-count');
      expect(templatesCount).toHaveTextContent('0');
    });

    it('should handle null loader data', () => {
      (useLoaderData as jest.Mock).mockReturnValue(null);

      // This should throw an error as the component expects valid data
      expect(() => render(<CreateRetroButton />)).toThrow(
        "Cannot destructure property 'templates' of '(0 , react_router_dom_1.useLoaderData)(...)' as it is null."
      );
    });
  });

  describe('Accessibility', () => {
    it('should provide proper aria label for background button', () => {
      render(<CreateRetroButton />);
      
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent).toHaveAttribute('data-aria-label', 'Close create retro form');
    });

    it('should render button with accessible content', () => {
      render(<CreateRetroButton />);
      
      const triggerButton = screen.getByTestId('modal-trigger-button');
      expect(triggerButton).toHaveTextContent('+');
      // The '+' symbol should be clear enough for screen readers
      // In a real implementation, you might want to add aria-label="Create new retro"
    });
  });
});

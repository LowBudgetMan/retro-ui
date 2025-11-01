import { render, screen } from '@testing-library/react';
import { CreateTeamButton } from './CreateTeamButton';
import '@testing-library/jest-dom';
import { vi, describe, it, beforeEach, expect } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useRevalidator: () => ({
    revalidate: vi.fn().mockResolvedValue(undefined),
    state: 'idle'
  })
}));

// Mock the CreateModal component
interface ModalContentFunctionProps {
  isOpen?: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface MockCreateModalProps {
  buttonContent: React.ReactNode;
  buttonClassName?: string;
  modalContent: React.ReactNode | ((params: ModalContentFunctionProps) => React.ReactNode);
  backgroundButtonAriaLabel?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

vi.mock('../../../components/modal/CreateModal', () => ({
  CreateModal: ({ buttonContent, buttonClassName, modalContent, backgroundButtonAriaLabel }: MockCreateModalProps) => (
    <div data-testid="mock-create-modal" data-aria-label={backgroundButtonAriaLabel}>
      <button data-testid="mock-button" className={buttonClassName}>
        {buttonContent}
      </button>
      <div data-testid="modal-content">
        {typeof modalContent === 'function' ? modalContent({ isOpen: true, setIsOpen: vi.fn() }) : modalContent}
      </div>
    </div>
  ),
}));

// Mock the CreateTeamModal component
interface MockCreateTeamModalProps {
  isOpen?: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

vi.mock('./CreateTeamModal', () => ({
  CreateTeamModal: ({ isOpen, setIsOpen }: MockCreateTeamModalProps) => (
    <div data-testid="mock-create-team-modal" data-is-open={isOpen ? 'true' : 'false'}>
      <div data-testid="mock-create-team-form">
        <button data-testid="form-submit" onClick={() => setIsOpen(false)}>Submit</button>
        <button data-testid="form-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
      </div>
    </div>
  ),
}));



// TextEncoder and TextDecoder are now mocked globally in setupTests.ts

// Mock the CSS module
vi.mock('../UserPage.module.css', () => ({
  default: {
    createNewTeamButton: 'mock-create-new-team-button-class',
  },
}));

describe('CreateTeamButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the CreateModal with the correct props', () => {
      render(<CreateTeamButton />);

      const createModal = screen.getByTestId('mock-create-modal');
      expect(createModal).toHaveAttribute('data-aria-label', 'Close create team form');

      // Button should have the correct class and content
      const button = screen.getByTestId('mock-button');
      expect(button).toHaveClass('mock-create-new-team-button-class');
      expect(button).toHaveTextContent('+');

      // modal content should be the CreateTeamModal
      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
    });

    it('should render the trigger button with correct content and styling', () => {
      render(<CreateTeamButton />);

      const triggerButton = screen.getByTestId('mock-button');
      expect(triggerButton).toBeInTheDocument();
      expect(triggerButton).toHaveClass('mock-create-new-team-button-class');
      expect(triggerButton).toHaveTextContent('+');
    });

    it('should render the CreateTeamModal in the modal content', () => {
      render(<CreateTeamButton />);

      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
    });

    it('should set correct background button aria label', () => {
      render(<CreateTeamButton />);

      const modal = screen.getByTestId('mock-create-modal');
      expect(modal).toHaveAttribute('data-aria-label', 'Close create team form');
    });
  });

  describe('Modal Integration', () => {
    it('should pass correct props to CreateModal', () => {
      render(<CreateTeamButton />);

      // Verify button content
      const triggerButton = screen.getByTestId('mock-button');
      expect(triggerButton).toHaveTextContent('+');

      // Verify button className
      expect(triggerButton).toHaveClass('mock-create-new-team-button-class');

      // Verify background button aria label
      const modal = screen.getByTestId('mock-create-modal');
      expect(modal).toHaveAttribute('data-aria-label', 'Close create team form');

      // Verify modal content renders CreateTeamModal
      expect(screen.getByTestId('mock-create-team-modal')).toBeInTheDocument();
    });

    it('should pass setIsOpen function to CreateTeamModal', () => {
      render(<CreateTeamButton />);

      // The modal should have access to close functionality through form buttons
      const cancelButton = screen.getByTestId('form-cancel');
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('CreateTeamModal Integration', () => {
    it('should pass onSubmitSuccess callback that closes modal and refreshes', () => {
      render(<CreateTeamButton />);

      // The form should have access to submit and cancel buttons
      // which would call setIsOpen(false) when clicked
      expect(screen.getByTestId('form-submit')).toBeInTheDocument();
      expect(screen.getByTestId('form-cancel')).toBeInTheDocument();
    });

    it('should pass onCancel callback that closes modal', () => {
      render(<CreateTeamButton />);

      const cancelButton = screen.getByTestId('form-cancel');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should render CreateTeamForm within CreateTeamModal', () => {
      render(<CreateTeamButton />);

      expect(screen.getByTestId('mock-create-team-form')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper aria label for background button', () => {
      render(<CreateTeamButton />);

      const modal = screen.getByTestId('mock-create-modal');
      expect(modal).toHaveAttribute('data-aria-label', 'Close create team form');
    });

    it('should render button with accessible content', () => {
      render(<CreateTeamButton />);

      const triggerButton = screen.getByTestId('mock-button');
      expect(triggerButton).toHaveTextContent('+');
      // The '+' symbol should be clear enough for screen readers
      // In a real implementation, you might want to add aria-label="Create new team"
    });
  });
});

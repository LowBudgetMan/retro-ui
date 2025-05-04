import { render, screen } from '@testing-library/react';
import { CreateTeamModal } from './CreateTeamModal';
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useRevalidator: () => ({
    revalidate: jest.fn().mockResolvedValue(undefined),
    state: 'idle'
  })
}));

// Mock the Modal component
jest.mock('../../../components/Modal/Modal', () => ({
  Modal: ({ children, isOpen, setIsOpen, backgroundButtonAriaLabel }: any) => (
    <div data-testid="mock-modal" data-is-open={isOpen} data-aria-label={backgroundButtonAriaLabel}>
      <button data-testid="mock-close-button" onClick={() => setIsOpen(false)}>Close Modal</button>
      {children}
    </div>
  ),
}));

// Mock the CreateTeamForm component
jest.mock('./CreateTeamForm', () => ({
  CreateTeamForm: ({ onSubmitSuccess, onCancel }: any) => (
    <div data-testid="mock-create-team-form">
      <button data-testid="mock-form-submit-button" onClick={onSubmitSuccess}>Submit Form</button>
      <button data-testid="mock-form-cancel-button" onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}));

// TextEncoder and TextDecoder are now mocked globally in setupTests.ts

describe('CreateTeamModal', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    setIsOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the Modal with the correct props', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      const modal = screen.getByTestId('mock-modal');
      expect(modal).toHaveAttribute('data-is-open', 'true');
      expect(modal).toHaveAttribute('data-aria-label', 'Close create team form');
      
      // Modal content should be the CreateTeamForm
      expect(screen.getByTestId('mock-create-team-form')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should pass the onCancel function to the CreateTeamForm', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      // Simulate clicking the cancel button in the form
      const cancelButton = screen.getByTestId('mock-form-cancel-button');
      cancelButton.click();
      
      // The setIsOpen function should be called with false
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should pass the onSubmitSuccess function to the CreateTeamForm', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      // Simulate clicking the submit button in the form
      const submitButton = screen.getByTestId('mock-form-submit-button');
      submitButton.click();
    });
  });
});

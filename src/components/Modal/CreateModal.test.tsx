import { render, screen, fireEvent } from '@testing-library/react';
import { CreateModal } from './CreateModal';
import '@testing-library/jest-dom';

// Mock the Modal component
jest.mock('./Modal', () => ({
  Modal: ({ isOpen, setIsOpen, children, backgroundButtonAriaLabel }: any) => (
    <div data-testid="mock-modal" data-is-open={isOpen} data-aria-label={backgroundButtonAriaLabel}>
      <button data-testid="mock-close-button" onClick={() => setIsOpen(false)}>Close Modal</button>
      {children}
    </div>
  ),
}));

describe('CreateModal', () => {
  // Common props for testing
  const defaultProps = {
    buttonContent: <span>Open Modal</span>,
    buttonClassName: 'test-button-class',
    modalContent: <div>Modal Content</div>,
    backgroundButtonAriaLabel: 'Close modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render a button with the provided content and className', () => {
      render(<CreateModal {...defaultProps} />);
      
      const button = screen.getByText('Open Modal').closest('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('test-button-class');
    });

    it('should render the Modal component with the correct props', () => {
      render(<CreateModal {...defaultProps} />);
      
      const modal = screen.getByTestId('mock-modal');
      expect(modal).toHaveAttribute('data-is-open', 'false'); // Initially closed
      expect(modal).toHaveAttribute('data-aria-label', 'Close modal');
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should open the modal when the button is clicked', () => {
      render(<CreateModal {...defaultProps} />);
      
      const button = screen.getByText('Open Modal').closest('button');
      fireEvent.click(button!);
      
      const modal = screen.getByTestId('mock-modal');
      expect(modal).toHaveAttribute('data-is-open', 'true');
    });

    it('should use external state when provided', () => {
      const setIsOpen = jest.fn();
      render(<CreateModal {...defaultProps} isOpen={true} setIsOpen={setIsOpen} />);
      
      const modal = screen.getByTestId('mock-modal');
      expect(modal).toHaveAttribute('data-is-open', 'true');
      
      const closeButton = screen.getByTestId('mock-close-button');
      fireEvent.click(closeButton);
      
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should handle function-based modalContent', () => {
      const modalContentFn = jest.fn().mockReturnValue(<div>Function Content</div>);
      render(<CreateModal {...defaultProps} modalContent={modalContentFn} />);
      
      expect(modalContentFn).toHaveBeenCalled();
      expect(screen.getByText('Function Content')).toBeInTheDocument();
    });
  });
});

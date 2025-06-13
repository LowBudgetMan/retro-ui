import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';
import '@testing-library/jest-dom';

// Mock the CSS module
jest.mock('./Modal.module.css', () => ({
  backgroundButton: 'mock-background-button-class',
  modalContainer: 'mock-modal-container-class',
}));

describe('Modal', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    setIsOpen: jest.fn(),
    children: <div>Modal Content</div>,
    ariaLabel: 'Close modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal with open attribute when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('open');
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not have open attribute on dialog when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      
      // Dialog might still be in the DOM but without the open attribute
      const dialog = screen.queryByRole('dialog', { hidden: true });
      expect(dialog).not.toHaveAttribute('open');
      
      // Background button should not be rendered when closed
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call setIsOpen(false) when the background button is clicked', () => {
      render(<Modal {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('Close modal'));
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should call setIsOpen(false) when the Escape key is pressed', () => {
      render(<Modal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should not call setIsOpen(false) when a different key is pressed', () => {
      render(<Modal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(defaultProps.setIsOpen).not.toHaveBeenCalled();
    });

    it('should not add event listener when isOpen is false', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      render(<Modal {...defaultProps} isOpen={false} />);
      
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      
      addEventListenerSpy.mockRestore();
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<Modal {...defaultProps} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });
});

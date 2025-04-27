import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTeamModal } from './CreateTeamModal';
import { TeamService } from '../../../services/TeamService';
import '@testing-library/jest-dom';
import { useRevalidator } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useRevalidator: jest.fn(),
}));

// Mock the TeamService
jest.mock('../../../services/TeamService.ts', () => ({
  TeamService: {
    createTeam: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the CSS module
jest.mock('./CreateTeamModal.module.css', () => ({
  backgroundButton: 'mock-background-button-class',
  modalContainer: 'mock-modal-container-class',
  form: 'mock-form-class',
  explanationText: 'mock-explanation-text-class',
  modalButtonsContainer: 'mock-modal-buttons-container-class',
}));

describe('CreateTeamModal', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    setIsOpen: jest.fn(),
  };

  // Mock revalidator
  const mockRevalidate = jest.fn().mockResolvedValue(undefined);
  const mockRevalidator = {
    revalidate: mockRevalidate,
    state: 'idle'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRevalidator as jest.Mock).mockReturnValue(mockRevalidator);
  });

  describe('Rendering', () => {
    it('should render the modal with open attribute when isOpen is true', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('open');
      expect(screen.getByText('What should we call your new team?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('should not have open attribute on dialog when isOpen is false', () => {
      render(<CreateTeamModal isOpen={false} setIsOpen={defaultProps.setIsOpen} />);
      
      // Dialog might still be in the DOM but without the open attribute
      const dialog = screen.queryByRole('dialog', { hidden: true });
      expect(dialog).not.toHaveAttribute('open');
      
      // Background button should not be rendered when closed
      expect(screen.queryByLabelText('Close create team form')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call setIsOpen(false) when the Close button is clicked', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should call setIsOpen(false) when the background button is clicked', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      fireEvent.click(screen.getByLabelText('Close create team form'));
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should call setIsOpen(false) when the Escape key is pressed', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should not call setIsOpen(false) when a different key is pressed', () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(defaultProps.setIsOpen).not.toHaveBeenCalled();
    });

    it('should not add event listener when isOpen is false', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      render(<CreateTeamModal isOpen={false} setIsOpen={defaultProps.setIsOpen} />);
      
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      
      addEventListenerSpy.mockRestore();
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<CreateTeamModal {...defaultProps} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Form Submission', () => {
    it('should call TeamService.createTeam with the input value when form is submitted', async () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
      });
    });

    it('should call revalidator.revalidate after successful team creation', async () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(mockRevalidate).toHaveBeenCalled();
      });
    });

    it('should close the modal after successful team creation and revalidation', async () => {
      render(<CreateTeamModal {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should handle error when team creation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (TeamService.createTeam as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      render(<CreateTeamModal {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(mockRevalidate).not.toHaveBeenCalled();
        expect(defaultProps.setIsOpen).not.toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error when revalidation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRevalidate.mockRejectedValueOnce(new Error('Revalidation error'));
      
      render(<CreateTeamModal {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(mockRevalidate).toHaveBeenCalled();
        expect(defaultProps.setIsOpen).not.toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});

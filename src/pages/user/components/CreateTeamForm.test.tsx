import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTeamForm } from './CreateTeamForm';
import { TeamService } from '../../../services/TeamService';
import '@testing-library/jest-dom';
import { useRevalidator } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useRevalidator: jest.fn(),
}));

jest.mock('../../../services/TeamService.ts', () => ({
  TeamService: {
    createTeam: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('./CreateTeamForm.module.css', () => ({
  form: 'mock-form-class',
  explanationText: 'mock-explanation-text-class',
  modalButtonsContainer: 'mock-modal-buttons-container-class',
}));

describe('CreateTeamForm', () => {
  const mockRevalidate = jest.fn().mockResolvedValue(undefined);
  const mockRevalidator = {
    revalidate: mockRevalidate,
    state: 'idle'
  };

  const defaultProps = {
    onSubmitSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRevalidator as jest.Mock).mockReturnValue(mockRevalidator);
  });

  describe('Rendering', () => {
    it('should render the form with the correct elements', () => {
      render(<CreateTeamForm {...defaultProps} />);
      
      expect(screen.getByText('What should we call your new team?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Team name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onCancel when the Close button is clicked', () => {
      render(<CreateTeamForm {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call TeamService.createTeam with the input value when form is submitted', async () => {
      render(<CreateTeamForm {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
      });
    });

    it('should call onSubmitSuccess after successful team creation', async () => {
      render(<CreateTeamForm {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(defaultProps.onSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should call onSubmitSuccess after successful team creation', async () => {
      render(<CreateTeamForm {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(defaultProps.onSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should handle error when team creation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (TeamService.createTeam as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      render(<CreateTeamForm {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error when revalidation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRevalidate.mockRejectedValueOnce(new Error('Revalidation error'));
      
      render(<CreateTeamForm {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Team name');
      const form = screen.getByRole('form');
      
      fireEvent.change(input, { target: { value: 'New Team Name' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(TeamService.createTeam).toHaveBeenCalledWith('New Team Name');
        expect(defaultProps.onSubmitSuccess).not.toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});

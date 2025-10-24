import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTeamForm } from './CreateTeamForm';
import { TeamService } from '../../../services/team-service/TeamService.ts';
import '@testing-library/jest-dom';
import { vi, describe, it, beforeEach, expect } from 'vitest';

vi.mock('../../../services/team-service/TeamService.ts', () => ({
  TeamService: {
    createTeam: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./CreateTeamForm.module.css', () => ({
  default: {
    form: 'mock-form-class',
    explanationText: 'mock-explanation-text-class',
    modalButtonsContainer: 'mock-modal-buttons-container-class',
  },
}));

describe('CreateTeamForm', () => {
  const defaultProps = {
    onSubmitSuccess: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should handle error when team creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (TeamService.createTeam as jest.MockedFunction<typeof TeamService.createTeam>).mockRejectedValueOnce(new Error('API error'));

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

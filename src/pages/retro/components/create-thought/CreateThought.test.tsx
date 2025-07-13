import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateThought } from './CreateThought.tsx';
import { RetroService } from '../../../../services/RetroService.ts';
import '@testing-library/jest-dom';

jest.mock('../../../../services/RetroService.ts', () => ({
  RetroService: {
    createThought: jest.fn(),
  },
}));

describe('CreateThought', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (RetroService.createThought as jest.Mock).mockResolvedValue({});
  });

  test('creates a thought when input loses focus with content', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(RetroService.createThought).toHaveBeenCalledWith(
        'team-456',
        'retro-123',
        'New thought',
        'Went Well'
      );
    });
    
    expect(input).toHaveValue('');
  });

  test('creates a thought when Enter key is pressed', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(RetroService.createThought).toHaveBeenCalledWith(
        'team-456',
        'retro-123',
        'New thought',
        'Went Well'
      );
    });
    
    expect(input).toHaveValue('');
  });

  test('does not create a thought when input is empty', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(RetroService.createThought).not.toHaveBeenCalled();
  });

  test('does not create a thought when input contains only whitespace', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);

    expect(RetroService.createThought).not.toHaveBeenCalled();
  });

  test('handles error when creating thought fails', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    (RetroService.createThought as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    
    fireEvent.change(input, { target: { value: 'New thought' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error creating thought:', expect.any(Error));
    });
    
    console.error = originalConsoleError;
  });
});

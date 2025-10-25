import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateThought } from './CreateThought.tsx';
import { RetroService } from '../../../../services/retro-service/RetroService.ts';
import '@testing-library/jest-dom';
import {vi, describe, test, beforeEach, expect, Mock} from 'vitest';

vi.mock('../../../../services/retro-service/RetroService.ts', () => ({
  RetroService: {
    createThought: vi.fn(),
  },
}));

describe('CreateThought', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (RetroService.createThought as any).mockResolvedValue({});
  });

  test('creates a thought when input loses focus with content', async () => {
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
        borderColor="#FFF"
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
        borderColor="#FFF"
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
        borderColor="#FFF"
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
        borderColor="#FFF"
      />
    );
    
    const input = screen.getByPlaceholderText('Add a thought...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);

    expect(RetroService.createThought).not.toHaveBeenCalled();
  });

  test('handles error when creating thought fails', async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    (RetroService.createThought as Mock).mockRejectedValue(new Error('API error'));
    
    render(
      <CreateThought
        teamId="team-456"
        retroId="retro-123"
        category="Went Well"
        borderColor="#FFF"
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

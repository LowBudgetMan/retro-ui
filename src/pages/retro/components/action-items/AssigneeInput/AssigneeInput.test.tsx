import { fireEvent, render, screen } from '@testing-library/react';
import { AssigneeInput } from './AssigneeInput';
import { ActionItemsService } from '../../../../../services/action-items-service/ActionItemsService';
import { DateTime } from 'luxon';
import {vi, describe, it, beforeEach, expect, Mock} from 'vitest';

vi.mock('../../../../../services/action-items-service/ActionItemsService');

const setAssigneeMock = ActionItemsService.setAssignee as Mock;

describe('AssigneeInput', () => {
    const actionItem = {
        id: '1',
        teamId: '123',
        action: 'Test Action',
        assignee: 'Test User',
        completed: false,
        createdAt: DateTime.now(),
    };

    beforeEach(() => {
        setAssigneeMock.mockClear();
    });

    it('should render with the initial assignee value', () => {
        render(<AssigneeInput actionItem={actionItem} />);
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('should call setAssignee on blur when value is changed', () => {
        render(<AssigneeInput actionItem={actionItem} />);
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: 'New User' } });
        fireEvent.blur(input);
        expect(setAssigneeMock).toHaveBeenCalledWith('123', '1', 'New User');
    });

    it('should call setAssignee on Enter key press when value is changed', () => {
        render(<AssigneeInput actionItem={actionItem} />);
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: 'New User' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(setAssigneeMock).toHaveBeenCalledWith('123', '1', 'New User');
    });

    it('should not call setAssignee and should reset value on blur when value is cleared', () => {
        render(<AssigneeInput actionItem={actionItem} />);
        const input = screen.getByDisplayValue('Test User') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);
        expect(setAssigneeMock).not.toHaveBeenCalled();
        expect(input.value).toBe('Test User');
    });

    it('should not call setAssignee and should reset value on Enter key press when value is cleared', () => {
        render(<AssigneeInput actionItem={actionItem} />);
        const input = screen.getByDisplayValue('Test User') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(setAssigneeMock).not.toHaveBeenCalled();
        expect(input.value).toBe('Test User');
    });
});

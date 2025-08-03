import '@jest/globals';
import { onKeys } from './KeyEventHandler';

describe('onKeys', () => {
    let mockCallback: jest.Mock;
    let mockEvent: KeyboardEvent;

    beforeEach(() => {
        mockCallback = jest.fn();
        mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    });

    it('should call callback when event key matches single key in array', () => {
        const handler = onKeys(['Enter'], mockCallback);
        
        handler(mockEvent);
        
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(mockEvent);
    });

    it('should call callback when event key matches one of multiple keys in array', () => {
        const handler = onKeys(['Enter', 'Escape', 'Space'], mockCallback);
        
        handler(mockEvent);
        
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith(mockEvent);
    });

    it('should not call callback when event key does not match any key in array', () => {
        const handler = onKeys(['Escape', 'Space'], mockCallback);
        
        handler(mockEvent);
        
        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle empty keys array', () => {
        const handler = onKeys([], mockCallback);
        
        handler(mockEvent);
        
        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should be case sensitive for key matching', () => {
        const lowerCaseEvent = new KeyboardEvent('keydown', { key: 'enter' });
        const handler = onKeys(['Enter'], mockCallback);
        
        handler(lowerCaseEvent);
        
        expect(mockCallback).not.toHaveBeenCalled();
    });
});

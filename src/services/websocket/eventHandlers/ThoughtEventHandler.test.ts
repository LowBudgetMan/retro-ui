import {
    createThoughtEventHandler,
    deleteThoughtEventHandler,
    updateThoughtEventHandler,
    getDestination
} from './ThoughtEventHandler';
import {IMessage} from "@stomp/stompjs";
import {Thought} from "../../RetroService";

describe('ThoughtEventHandler', () => {
    const testDate = new Date('2025-03-13T05:19:22.898Z');
    const baseMockThought: Thought = {
        id: 'thought-123',
        message: 'Test thought',
        votes: 0,
        completed: false,
        category: 'What went well',
        retroId: 'retro-123',
        createdAt: testDate
    };

    const createMockMessage = (actionType: string, thought: Thought = baseMockThought): IMessage => ({
        ack: jest.fn(),
        nack: jest.fn(),
        body: JSON.stringify({
            actionType,
            payload: {
                ...thought,
                createdAt: thought.createdAt.toISOString()
            }
        }),
        command: 'MESSAGE',
        headers: {},
        binaryBody: new Uint8Array(),
        isBinaryBody: false
    });

    describe('getDestination', () => {
        it('should return the correct topic string for a retro ID', () => {
            const retroId = 'test-retro-123';
            const expected = `/topic/${retroId}.thoughts`;
            
            expect(getDestination(retroId)).toBe(expected);
        });
    });

    describe('createThoughtEventHandler', () => {
        it('should call createThought when receiving a CREATE event', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            const message = createMockMessage('CREATE');

            handler(message);

            expect(createThought).toHaveBeenCalledWith({
                ...baseMockThought,
                createdAt: baseMockThought.createdAt.toISOString()
            });
        });

        it('should not call createThought for non-CREATE events', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            
            handler(createMockMessage('UPDATE'));
            expect(createThought).not.toHaveBeenCalled();

            handler(createMockMessage('DELETE'));
            expect(createThought).not.toHaveBeenCalled();
        });

        it('should handle malformed messages gracefully', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            
            const invalidMessage: IMessage = {
                ...createMockMessage('CREATE'),
                body: 'invalid json'
            };

            expect(() => handler(invalidMessage)).toThrow();
            expect(createThought).not.toHaveBeenCalled();
        });
    });

    describe('updateThoughtEventHandler', () => {
        const updatedThought: Thought = {
            ...baseMockThought,
            message: 'Updated thought',
            votes: 5,
            completed: true
        };

        it('should call updateThought when receiving an UPDATE event', () => {
            const updateThought = jest.fn();
            const handler = updateThoughtEventHandler(updateThought);
            const message = createMockMessage('UPDATE', updatedThought);

            handler(message);

            expect(updateThought).toHaveBeenCalledWith({
                ...updatedThought,
                createdAt: updatedThought.createdAt.toISOString()
            });
        });

        it('should not call updateThought for non-UPDATE events', () => {
            const updateThought = jest.fn();
            const handler = updateThoughtEventHandler(updateThought);
            
            handler(createMockMessage('CREATE'));
            expect(updateThought).not.toHaveBeenCalled();

            handler(createMockMessage('DELETE'));
            expect(updateThought).not.toHaveBeenCalled();
        });

        it('should handle malformed messages gracefully', () => {
            const updateThought = jest.fn();
            const handler = updateThoughtEventHandler(updateThought);
            
            const invalidMessage: IMessage = {
                ...createMockMessage('UPDATE'),
                body: 'invalid json'
            };

            expect(() => handler(invalidMessage)).toThrow();
            expect(updateThought).not.toHaveBeenCalled();
        });
    });

    describe('deleteThoughtEventHandler', () => {
        const deletedThought: Thought = {
            ...baseMockThought,
            message: 'Deleted thought',
            votes: 5,
            completed: true
        };

        it('should call deleteThought when receiving an DELETE event', () => {
            const deleteThought = jest.fn();
            const handler = deleteThoughtEventHandler(deleteThought);
            const message = createMockMessage('DELETE', deletedThought);

            handler(message);

            expect(deleteThought).toHaveBeenCalledWith({
                ...deletedThought,
                createdAt: deletedThought.createdAt.toISOString()
            });
        });

        it('should not call deleteThought for non-DELETE events', () => {
            const deleteThought = jest.fn();
            const handler = deleteThoughtEventHandler(deleteThought);

            handler(createMockMessage('CREATE'));
            expect(deleteThought).not.toHaveBeenCalled();

            handler(createMockMessage('UPDATE'));
            expect(deleteThought).not.toHaveBeenCalled();
        });

        it('should handle malformed messages gracefully', () => {
            const deleteThought = jest.fn();
            const handler = deleteThoughtEventHandler(deleteThought);

            const invalidMessage: IMessage = {
                ...createMockMessage('DELETE'),
                body: 'invalid json'
            };

            expect(() => handler(invalidMessage)).toThrow();
            expect(deleteThought).not.toHaveBeenCalled();
        });
    });
});

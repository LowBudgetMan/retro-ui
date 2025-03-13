import {createThoughtEventHandler, getDestination} from './ThoughtEventHandler';
import {IMessage} from "@stomp/stompjs";
import {Thought} from "../../RetroService";

describe('ThoughtEventHandler', () => {
    describe('getDestination', () => {
        it('should return the correct topic string for a retro ID', () => {
            const retroId = 'test-retro-123';
            const expected = `/topic/${retroId}.thoughts`;
            
            expect(getDestination(retroId)).toBe(expected);
        });
    });

    describe('createThoughtEventHandler', () => {
        const testDate = new Date('2025-03-13T05:19:22.898Z');
        const mockThought: Thought = {
            id: 'thought-123',
            message: 'Test thought',
            votes: 0,
            completed: false,
            category: 'What went well',
            retroId: 'retro-123',
            createdAt: testDate
        };

        const createMockMessage = (actionType: string): IMessage => ({
            ack: jest.fn(),
            nack: jest.fn(),
            body: JSON.stringify({
                actionType,
                payload: {
                    ...mockThought,
                    createdAt: mockThought.createdAt.toISOString()
                }
            }),
            command: 'MESSAGE',
            headers: {},
            binaryBody: new Uint8Array(),
            isBinaryBody: false
        });

        it('should call createThought when receiving a CREATE event', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            const message = createMockMessage('CREATE');

            handler(message);

            expect(createThought).toHaveBeenCalledWith({
                ...mockThought,
                createdAt: mockThought.createdAt.toISOString()
            });
        });

        it('should not call createThought for non-CREATE events', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            
            const updateMessage = createMockMessage('UPDATE');
            handler(updateMessage);
            expect(createThought).not.toHaveBeenCalled();

            const deleteMessage = createMockMessage('DELETE');
            handler(deleteMessage);
            expect(createThought).not.toHaveBeenCalled();
        });

        it('should handle malformed messages gracefully', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            
            // Test with invalid JSON
            const invalidMessage: IMessage = {
                ...createMockMessage('CREATE'),
                body: 'invalid json'
            };

            expect(() => handler(invalidMessage)).toThrow();
            expect(createThought).not.toHaveBeenCalled();
        });

        it('should handle missing body gracefully', () => {
            const createThought = jest.fn();
            const handler = createThoughtEventHandler(createThought);
            
            const messageWithoutBody: IMessage = {
                ...createMockMessage('CREATE'),
                body: ''
            };

            expect(() => handler(messageWithoutBody)).toThrow();
            expect(createThought).not.toHaveBeenCalled();
        });
    });
}); 
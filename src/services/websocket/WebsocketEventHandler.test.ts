import { vi } from 'vitest';
import {Thought} from "../retro-service/RetroService.ts";
import {IMessage} from "@stomp/stompjs";
import {eventHandler, EventType} from "./WebsocketEventHandler.ts";
import {DateTime} from "luxon";

describe('WebsocketEventHandler', () => {
    const testDate = DateTime.fromISO('2025-03-13T05:19:22.898Z');
    const baseMockThought: Thought = {
        id: 'thought-123',
        message: 'Test thought',
        votes: 0,
        completed: false,
        category: 'What went well',
        retroId: 'retro-123',
        createdAt: testDate
    };

    const createMockMessage = (actionType: EventType, content: Thought = baseMockThought): IMessage => ({
        ack: vi.fn(),
        nack: vi.fn(),
        body: JSON.stringify({
            actionType,
            payload: {
                ...content,
            }
        }),
        command: 'MESSAGE',
        headers: {},
        binaryBody: new Uint8Array(),
        isBinaryBody: false
    });

    it('Should call handler when action matches requested action', () => {
        const mockHandler = vi.fn();
        const message = createMockMessage(EventType.CREATE)
        const subject = eventHandler(EventType.CREATE, mockHandler);

        subject(message);

        expect(mockHandler).toHaveBeenCalledWith({
            ...baseMockThought,
            createdAt: baseMockThought.createdAt.toISO()
        });
    });

    it('Should not call handler when action does not match requested action', () => {
        const mockHandler = vi.fn();
        const message = createMockMessage(EventType.CREATE)
        const subject = eventHandler(EventType.UPDATE, mockHandler);

        subject(message);

        expect(mockHandler).not.toHaveBeenCalledWith({
            ...baseMockThought,
            createdAt: baseMockThought.createdAt.toISO()
        });
    });

    it('should throw exception when body cannot be parsed into requested type', () => {
        const mockHandler = vi.fn();
        const invalidMessage: IMessage = {
            ...createMockMessage(EventType.CREATE),
            body: 'invalid json'
        };
        const subject = eventHandler(EventType.CREATE, mockHandler);

        expect(() => subject(invalidMessage)).toThrow();
        expect(mockHandler).not.toHaveBeenCalled();
    });
})

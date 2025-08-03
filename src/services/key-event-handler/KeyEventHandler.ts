import { KeyboardEvent as ReactKeyboardEvent } from 'react';

type KeyEvent = KeyboardEvent | ReactKeyboardEvent;

export function onKeys<T extends KeyEvent>(keys: string[], callback: (event: T) => void): (event: T) => void {
    return (e) => {
        if (keys.includes(e.key)) {
            callback(e);
        }
    };
}
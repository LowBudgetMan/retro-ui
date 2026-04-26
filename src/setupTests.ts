import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Use Node.js built-in implementations of TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util';

// Make TextEncoder and TextDecoder available globally
// Use type assertions to handle TypeScript type compatibility issues
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Node 22+ exposes a native `localStorage` global that requires
// `--localstorage-file=PATH` to be functional. Without it, the object exists
// but has no methods, which shadows happy-dom's localStorage and breaks any
// code that calls getItem/setItem. Install a working in-memory polyfill.
function createMemoryStorage(): Storage {
    const store = new Map<string, string>();
    return {
        get length() { return store.size; },
        clear: () => store.clear(),
        getItem: (key) => store.has(key) ? store.get(key)! : null,
        key: (index) => Array.from(store.keys())[index] ?? null,
        removeItem: (key) => { store.delete(key); },
        setItem: (key, value) => { store.set(key, String(value)); },
    };
}

const memoryLocalStorage = createMemoryStorage();
const memorySessionStorage = createMemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryLocalStorage });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: memorySessionStorage });
Object.defineProperty(window, 'localStorage', { configurable: true, value: memoryLocalStorage });
Object.defineProperty(window, 'sessionStorage', { configurable: true, value: memorySessionStorage });

beforeEach(() => {
    memoryLocalStorage.clear();
    memorySessionStorage.clear();
});

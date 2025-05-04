import '@testing-library/jest-dom';

// Use Node.js built-in implementations of TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from 'util';

// Make TextEncoder and TextDecoder available globally
// Use type assertions to handle TypeScript type compatibility issues
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

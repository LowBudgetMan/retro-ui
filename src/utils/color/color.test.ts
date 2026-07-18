import { hexToOklch, transformCategoryColors } from './color.ts';
import { Category } from '../../services/retro-service/RetroService.ts';

describe('hexToOklch', () => {
    it.each([
        ['#ff0000', 'oklch(0.6280 0.2577 29.23)'],
        ['#00ff00', 'oklch(0.8664 0.2948 142.50)'],
        ['#0000ff', 'oklch(0.4520 0.3132 264.05)'],
        ['#ffffff', 'oklch(1.0000 0.0000 0.00)'],
        ['#000000', 'oklch(0.0000 0.0000 0.00)'],
        ['#808080', 'oklch(0.5999 0.0000 0.00)'],
        ['#e8f5e8', 'oklch(0.9569 0.0220 145.40)'],
        ['#2d5a2d', 'oklch(0.4231 0.0877 143.83)'],
    ])('converts %s to %s', (hex, expected) => {
        expect(hexToOklch(hex)).toBe(expected);
    });

    it('is case-insensitive', () => {
        expect(hexToOklch('#FF0000')).toBe(hexToOklch('#ff0000'));
    });

    it.each([
        ['notahex'],
        ['#12345'],
        ['#f00'],
        ['ff0000'],
        [''],
    ])('returns %j unchanged when malformed', (input) => {
        expect(hexToOklch(input)).toBe(input);
    });
});

describe('transformCategoryColors', () => {
    it('converts all four color fields to oklch', () => {
        const category: Category = {
            name: 'Start',
            position: 1,
            lightBackgroundColor: '#e8f5e8',
            lightTextColor: '#2d5a2d',
            darkBackgroundColor: '#1a3d1a',
            darkTextColor: '#90ee90',
        };

        const result = transformCategoryColors(category);

        expect(result).toEqual({
            name: 'Start',
            position: 1,
            lightBackgroundColor: hexToOklch('#e8f5e8'),
            lightTextColor: hexToOklch('#2d5a2d'),
            darkBackgroundColor: hexToOklch('#1a3d1a'),
            darkTextColor: hexToOklch('#90ee90'),
        });
    });

    it('leaves name and position untouched', () => {
        const category: Category = {
            name: 'Stop',
            position: 2,
            lightBackgroundColor: '#ffe8e8',
            lightTextColor: '#5a2d2d',
            darkBackgroundColor: '#3d1a1a',
            darkTextColor: '#ff9090',
        };

        const result = transformCategoryColors(category);

        expect(result.name).toBe('Stop');
        expect(result.position).toBe(2);
    });
});

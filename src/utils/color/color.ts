import { Category } from "../../services/retro-service/RetroService.ts";

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string): string {
    if (!HEX_PATTERN.test(hex)) {
        return hex;
    }

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);

    // Linear sRGB -> OKLab, via the LMS matrices from Björn Ottosson's
    // reference implementation (https://bottosson.github.io/posts/oklab/).
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const labB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    const C = Math.sqrt(a * a + labB * labB);
    let H = (Math.atan2(labB, a) * 180) / Math.PI;
    if (H < 0) H += 360;

    const roundedC = Number(C.toFixed(4));
    // Chroma near zero (grays, black, white) leaves hue as meaningless
    // floating-point noise, so normalize it to 0 for a clean, stable output.
    const roundedH = roundedC === 0 ? 0 : H;

    return `oklch(${L.toFixed(4)} ${roundedC.toFixed(4)} ${roundedH.toFixed(2)})`;
}

export function transformCategoryColors(category: Category): Category {
    return {
        ...category,
        lightBackgroundColor: hexToOklch(category.lightBackgroundColor),
        lightTextColor: hexToOklch(category.lightTextColor),
        darkBackgroundColor: hexToOklch(category.darkBackgroundColor),
        darkTextColor: hexToOklch(category.darkTextColor),
    };
}

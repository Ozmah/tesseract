import { useEffect, useState } from 'react';

const OKLCH_PATTERN = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/;

/**
 * Reads a CSS custom property from the document root, with nested var()
 * references already resolved by the browser.
 */
export function readToken(name: string): string {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${name}`)
        .trim();
}

function oklchLuminance(value: string): number | null {
    const match = OKLCH_PATTERN.exec(value);

    if (!match) {
        return null;
    }

    const lightness = Number(match[1]) / (match[2] === '%' ? 100 : 1);
    const chroma = Number(match[3]);
    const hue = (Number(match[4]) * Math.PI) / 180;
    const a = chroma * Math.cos(hue);
    const b = chroma * Math.sin(hue);

    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

    const clamp = (channel: number): number =>
        Math.min(1, Math.max(0, channel));
    const red = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
    const green = clamp(
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    );
    const blue = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * WCAG contrast ratio between two OKLCH colors, or null when either value
 * is not a plain OKLCH color (for example a color-mix() token).
 */
export function contrastRatio(
    foreground: string,
    background: string,
): number | null {
    const first = oklchLuminance(foreground);
    const second = oklchLuminance(background);

    if (first === null || second === null) {
        return null;
    }

    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * Resolved values for the given tokens. Reads after mount (the page is
 * server-rendered) and again whenever the root class list changes, so the
 * values follow the active appearance.
 */
export function useTokenValues(
    names: readonly string[],
): Record<string, string> {
    const [values, setValues] = useState<Record<string, string>>({});
    const key = names.join('|');

    useEffect(() => {
        const tokenNames = key.split('|');
        const read = (): void =>
            setValues(
                Object.fromEntries(
                    tokenNames.map((name) => [name, readToken(name)]),
                ),
            );

        read();

        const observer = new MutationObserver(read);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [key]);

    return values;
}

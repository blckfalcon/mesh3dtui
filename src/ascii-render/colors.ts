import type { Color } from "./types";

/**
 * Clamp a value to the byte range [0, 255] and round to the nearest integer
 */
export function clampByte(value: number): number {
	return Math.max(0, Math.min(255, Math.round(value)));
}

/** Alpha threshold for determining if a pixel is considered transparent */
const ALPHA_THRESHOLD = 128;

/** Fully opaque black */
export const BLACK: Color = { r: 0, g: 0, b: 0, a: 255 };

/** Fully opaque white */
export const WHITE: Color = { r: 255, g: 255, b: 255, a: 255 };

/** Fully transparent black */
export const TRANSPARENT: Color = { r: 0, g: 0, b: 0, a: 0 };

/**
 * Calculate the brightness of a color (0-255)
 * Uses the luminance formula: 0.299*R + 0.587*G + 0.114*B
 */
export function getBrightness(color: Color): number {
	return clampByte(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
}

/**
 * Check if a color is "on" based on brightness threshold
 */
export function isPixelOn(color: Color, threshold: number): boolean {
	if (color.a !== undefined && color.a < ALPHA_THRESHOLD) {
		return false; // Transparent
	}
	return getBrightness(color) >= threshold;
}

/**
 * Calculate the average of multiple colors
 */
export function averageColors(colors: Color[]): Color {
	if (colors.length === 0) {
		return { ...BLACK };
	}

	let r = 0,
		g = 0,
		b = 0,
		a = 0;
	for (const color of colors) {
		r += color.r;
		g += color.g;
		b += color.b;
		a += color.a ?? 255;
	}

	return {
		r: clampByte(r / colors.length),
		g: clampByte(g / colors.length),
		b: clampByte(b / colors.length),
		a: clampByte(a / colors.length),
	};
}

/**
 * Blend two colors using proper alpha compositing ("over" operation)
 */
export function blendColors(fg: Color, bg: Color): Color {
	const fgA = (fg.a ?? 255) / 255;
	const bgA = (bg.a ?? 255) / 255;
	const outA = fgA + bgA * (1 - fgA);

	if (outA === 0) {
		return { ...TRANSPARENT };
	}

	return {
		r: clampByte((fg.r * fgA + bg.r * bgA * (1 - fgA)) / outA),
		g: clampByte((fg.g * fgA + bg.g * bgA * (1 - fgA)) / outA),
		b: clampByte((fg.b * fgA + bg.b * bgA * (1 - fgA)) / outA),
		a: clampByte(outA * 255),
	};
}

/**
 * Interpolate between two colors
 * @param t Interpolation factor (0-1), clamped internally
 */
export function interpolateColor(color1: Color, color2: Color, t: number): Color {
	const clampedT = Math.max(0, Math.min(1, t));
	const a1 = color1.a ?? 255;
	const a2 = color2.a ?? 255;
	return {
		r: clampByte(color1.r + (color2.r - color1.r) * clampedT),
		g: clampByte(color1.g + (color2.g - color1.g) * clampedT),
		b: clampByte(color1.b + (color2.b - color1.b) * clampedT),
		a: clampByte(a1 + (a2 - a1) * clampedT),
	};
}

/**
 * Generate ANSI escape code for foreground truecolor (24-bit RGB)
 */
export function fgTruecolor(color: Color): string {
	return `\x1b[38;2;${clampByte(color.r)};${clampByte(color.g)};${clampByte(color.b)}m`;
}

/**
 * Generate ANSI escape code for background truecolor (24-bit RGB)
 */
export function bgTruecolor(color: Color): string {
	return `\x1b[48;2;${clampByte(color.r)};${clampByte(color.g)};${clampByte(color.b)}m`;
}

/**
 * Reset ANSI color codes
 */
export function resetColors(): string {
	return "\x1b[0m";
}

/**
 * Create a color from RGB values
 */
export function rgb(r: number, g: number, b: number, a?: number): Color {
	return {
		r: clampByte(r),
		g: clampByte(g),
		b: clampByte(b),
		a: a !== undefined ? clampByte(a) : undefined,
	};
}

/**
 * Create a color from a hex string (#RGB, #RRGGBB)
 * Returns black for invalid input.
 */
export function hex(hexStr: string): Color {
	const clean = hexStr.replace("#", "");

	if (clean.length === 3) {
		const c0 = clean[0] ?? "0";
		const c1 = clean[1] ?? "0";
		const c2 = clean[2] ?? "0";
		const r = parseInt(c0 + c0, 16);
		const g = parseInt(c1 + c1, 16);
		const b = parseInt(c2 + c2, 16);
		if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
			return { ...BLACK };
		}
		return { r, g, b, a: 255 };
	}

	if (clean.length === 6) {
		const r = parseInt(clean.slice(0, 2), 16);
		const g = parseInt(clean.slice(2, 4), 16);
		const b = parseInt(clean.slice(4, 6), 16);
		if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
			return { ...BLACK };
		}
		return { r, g, b, a: 255 };
	}

	return { ...BLACK };
}

/**
 * Generate a rainbow color at position t (0-1)
 * Uses sine waves with 120-degree phase offsets for R, G, B.
 */
export function rainbow(t: number): Color {
	const phase = (t % 1) * Math.PI * 2;
	const r = Math.sin(phase) * 127 + 128;
	const g = Math.sin(phase + (Math.PI * 2) / 3) * 127 + 128;
	const b = Math.sin(phase + (Math.PI * 4) / 3) * 127 + 128;
	return { r: clampByte(r), g: clampByte(g), b: clampByte(b), a: 255 };
}

/**
 * Invert a color
 */
export function invertColor(color: Color): Color {
	return {
		r: 255 - color.r,
		g: 255 - color.g,
		b: 255 - color.b,
		a: color.a ?? 255,
	};
}

/**
 * Check if two colors are equal (including alpha)
 */
export function colorsEqual(c1: Color, c2: Color): boolean {
	return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && (c1.a ?? 255) === (c2.a ?? 255);
}

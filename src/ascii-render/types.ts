/**
 * Color representation with RGBA channels
 */
export interface Color {
	r: number;
	g: number;
	b: number;
	a?: number;
}

/**
 * Available symbol sets for rendering
 */
export enum SymbolSet {
	/** Simple ASCII characters for 1x1 resolution */
	ASCII = "ascii",
	/** Half-block characters for 2x1 vertical resolution */
	HALF = "half",
	/** Quadrant characters for 2x2 resolution */
	QUADRANT = "quadrant",
	/** Braille patterns for 2x4 resolution */
	BRAILLE = "braille",
	/** Sextant characters for 2x3 resolution (Unicode 13.0+) */
	SEXTANT = "sextant",
}

/**
 * Color mode options
 */
export enum ColorMode {
	/** No color, monochrome output */
	NONE = "none",
	/** Truecolor with 24-bit RGB */
	TRUECOLOR = "truecolor",
}

/**
 * Options for rendering pixels to ASCII/Unicode
 */
export interface RenderOptions {
	/** Symbol set to use for rendering */
	symbolSet: SymbolSet;
	/** Color mode for output */
	colorMode: ColorMode;
	/** Brightness threshold for considering a pixel "on" (0-255, default: 128) */
	threshold?: number;
}

/**
 * A cell represents a character position with its associated colors
 */
export interface Cell {
	/** The character to render */
	char: string;
	/** Foreground color */
	fg: Color;
	/** Background color */
	bg: Color;
}

/**
 * A row of cells
 */
export type Row = Cell[];

/**
 * 2D grid of cells representing the rendered output
 */
export type Grid = Row[];

/**
 * Pixel buffer - 2D array of colors
 */
export type PixelBuffer = Color[][];

/**
 * Symbol definition for mapping pixel patterns
 */
export interface SymbolDef {
	/** Unicode character */
	char: string;
	/** Bit pattern representing which sub-pixels are filled */
	pattern: number;
	/** Width of the pattern in sub-pixels */
	width: number;
	/** Height of the pattern in sub-pixels */
	height: number;
}

/**
 * Line style for line drawing
 */
export interface LineStyle {
	/** Pattern of on/off pixels (e.g., [1,1,0,0] for dashed) */
	pattern?: number[];
	/** Line thickness in pixels */
	thickness?: number;
	/** Start color for gradient */
	startColor?: Color;
	/** End color for gradient */
	endColor?: Color;
}

/**
 * Default render options
 */
export const DEFAULT_OPTIONS: Required<RenderOptions> = {
	symbolSet: SymbolSet.HALF,
	colorMode: ColorMode.TRUECOLOR,
	threshold: 128,
};

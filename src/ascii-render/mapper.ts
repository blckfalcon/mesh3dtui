import { averageColors, BLACK, isPixelOn } from "./colors";
import { BRAILLE_DOTS, getBrailleChar, getSymbolDimensions, getSymbolSet } from "./symbols";
import type { Cell, Color, PixelBuffer, SymbolDef } from "./types";
import { SymbolSet } from "./types";

/**
 * Safely read a pixel from the buffer, returning BLACK for out-of-bounds access
 */
function getPixelSafe(pixels: PixelBuffer, x: number, y: number): Color {
	const row = pixels[y];
	if (row && x >= 0 && x < row.length) {
		return row[x] ?? { ...BLACK };
	}
	return { ...BLACK };
}

/**
 * Braille dot-to-pixel mapping, hoisted to module scope to avoid
 * recreating on every call to mapBrailleRegion.
 *
 * Dot layout (Unicode standard):
 *   Dot1 Dot4   (row 0)
 *   Dot2 Dot5   (row 1)
 *   Dot3 Dot6   (row 2)
 *   Dot7 Dot8   (row 3)
 */
const BRAILLE_DOT_MAP = [
	{ x: 0, y: 0, bit: BRAILLE_DOTS.DOT1 },
	{ x: 0, y: 1, bit: BRAILLE_DOTS.DOT2 },
	{ x: 0, y: 2, bit: BRAILLE_DOTS.DOT3 },
	{ x: 0, y: 3, bit: BRAILLE_DOTS.DOT7 },
	{ x: 1, y: 0, bit: BRAILLE_DOTS.DOT4 },
	{ x: 1, y: 1, bit: BRAILLE_DOTS.DOT5 },
	{ x: 1, y: 2, bit: BRAILLE_DOTS.DOT6 },
	{ x: 1, y: 3, bit: BRAILLE_DOTS.DOT8 },
] as const;

/**
 * Map a region of pixels to a bit pattern
 * @param pixels The pixel buffer
 * @param startX Starting X position
 * @param startY Starting Y position
 * @param width Width of the region
 * @param height Height of the region
 * @param threshold Brightness threshold
 * @returns Bit pattern representing which sub-pixels are "on"
 */
export function mapRegionToPattern(
	pixels: PixelBuffer,
	startX: number,
	startY: number,
	width: number,
	height: number,
	threshold: number,
): { pattern: number; fg: Color; bg: Color } {
	const patternBits: boolean[] = [];
	const fgColors: Color[] = [];
	const bgColors: Color[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const color = getPixelSafe(pixels, startX + x, startY + y);
			const on = isPixelOn(color, threshold);
			patternBits.push(on);

			if (on) {
				fgColors.push(color);
			} else {
				bgColors.push(color);
			}
		}
	}

	// Convert boolean pattern to bit pattern
	let bitPattern = 0;
	for (let i = 0; i < patternBits.length; i++) {
		if (patternBits[i]) {
			bitPattern |= 1 << i;
		}
	}

	const fg = averageColors(fgColors);
	const bg = averageColors(bgColors);

	return { pattern: bitPattern, fg, bg };
}

/**
 * Find the best matching symbol for a given pattern
 * @param pattern Bit pattern to match
 * @param symbols Array of available symbols
 * @returns The best matching symbol
 */
export function findBestSymbol(pattern: number, symbols: SymbolDef[]): SymbolDef {
	// Exact match
	for (const symbol of symbols) {
		if (symbol.pattern === pattern) {
			return symbol;
		}
	}

	// Find closest match by counting differing bits (Hamming distance)
	let bestSymbol = symbols[0] ?? { char: " ", pattern: 0, width: 1, height: 1 };
	let minDistance = Infinity;

	for (const symbol of symbols) {
		const distance = countBits(pattern ^ symbol.pattern);
		if (distance < minDistance) {
			minDistance = distance;
			bestSymbol = symbol;
		}
	}

	return bestSymbol;
}

/**
 * Count the number of set bits in a number
 */
function countBits(n: number): number {
	let count = 0;
	let v = n;
	while (v) {
		count += v & 1;
		v >>= 1;
	}
	return count;
}

/**
 * Map Braille pattern specifically
 * For Braille, we need to map 2x4 pixel regions to dot patterns
 */
export function mapBrailleRegion(
	pixels: PixelBuffer,
	startX: number,
	startY: number,
	threshold: number,
): { pattern: number; fg: Color; bg: Color } {
	let pattern = 0;
	const fgColors: Color[] = [];
	const bgColors: Color[] = [];

	for (const dot of BRAILLE_DOT_MAP) {
		const color = getPixelSafe(pixels, startX + dot.x, startY + dot.y);

		if (isPixelOn(color, threshold)) {
			pattern |= dot.bit;
			fgColors.push(color);
		} else {
			bgColors.push(color);
		}
	}

	return {
		pattern,
		fg: averageColors(fgColors),
		bg: averageColors(bgColors),
	};
}

/**
 * Convert pixel buffer to grid of cells using specified symbol set
 */
export function mapPixelsToCells(
	pixels: PixelBuffer,
	symbolSetName: SymbolSet,
	threshold: number,
): Cell[][] {
	const symbols = getSymbolSet(symbolSetName);
	const dims = getSymbolDimensions(symbolSetName);

	if (pixels.length === 0) {
		return [];
	}

	const firstRow = pixels[0];
	if (!firstRow || firstRow.length === 0) {
		return [];
	}

	const pixelHeight = pixels.length;
	const pixelWidth = firstRow.length;

	const cellWidth = Math.ceil(pixelWidth / dims.width);
	const cellHeight = Math.ceil(pixelHeight / dims.height);

	const grid: Cell[][] = [];

	for (let cy = 0; cy < cellHeight; cy++) {
		const row: Cell[] = [];
		for (let cx = 0; cx < cellWidth; cx++) {
			const startX = cx * dims.width;
			const startY = cy * dims.height;

			let result: { pattern: number; fg: Color; bg: Color };

			if (symbolSetName === SymbolSet.BRAILLE) {
				result = mapBrailleRegion(pixels, startX, startY, threshold);
				// For braille, compute the character directly (O(1)) instead of
				// searching through 256 symbols with findBestSymbol (O(n))
				const char = getBrailleChar(result.pattern);
				row.push({ char, fg: result.fg, bg: result.bg });
			} else {
				result = mapRegionToPattern(pixels, startX, startY, dims.width, dims.height, threshold);
				const symbol = findBestSymbol(result.pattern, symbols);
				row.push({ char: symbol.char, fg: result.fg, bg: result.bg });
			}
		}
		grid.push(row);
	}

	return grid;
}

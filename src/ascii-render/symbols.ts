import type { SymbolDef } from "./types";
import { SymbolSet } from "./types";

/**
 * ASCII symbols ordered by density (light to dark)
 * Used for 1x1 resolution rendering
 */
export const ASCII_SYMBOLS: SymbolDef[] = [
	{ char: " ", pattern: 0b0, width: 1, height: 1 },
	{ char: ".", pattern: 0b1, width: 1, height: 1 },
	{ char: ",", pattern: 0b1, width: 1, height: 1 },
	{ char: "-", pattern: 0b1, width: 1, height: 1 },
	{ char: "~", pattern: 0b1, width: 1, height: 1 },
	{ char: "+", pattern: 0b1, width: 1, height: 1 },
	{ char: "=", pattern: 0b1, width: 1, height: 1 },
	{ char: "*", pattern: 0b1, width: 1, height: 1 },
	{ char: "#", pattern: 0b1, width: 1, height: 1 },
	{ char: "@", pattern: 0b1, width: 1, height: 1 },
];

/**
 * Half-block symbols for 2x1 vertical resolution
 * Each character represents 2 vertical pixels
 */
export const HALF_BLOCK_SYMBOLS: SymbolDef[] = [
	{ char: " ", pattern: 0b00, width: 1, height: 2 },
	{ char: "▀", pattern: 0b01, width: 1, height: 2 },
	{ char: "▄", pattern: 0b10, width: 1, height: 2 },
	{ char: "█", pattern: 0b11, width: 1, height: 2 },
];

/**
 * Quadrant symbols for 2x2 resolution
 * Pattern bits: [top-left, top-right, bottom-left, bottom-right]
 */
export const QUADRANT_SYMBOLS: SymbolDef[] = [
	{ char: " ", pattern: 0b0000, width: 2, height: 2 },
	{ char: "▘", pattern: 0b0001, width: 2, height: 2 },
	{ char: "▝", pattern: 0b0010, width: 2, height: 2 },
	{ char: "▀", pattern: 0b0011, width: 2, height: 2 },
	{ char: "▖", pattern: 0b0100, width: 2, height: 2 },
	{ char: "▌", pattern: 0b0101, width: 2, height: 2 },
	{ char: "▞", pattern: 0b0110, width: 2, height: 2 },
	{ char: "▛", pattern: 0b0111, width: 2, height: 2 },
	{ char: "▗", pattern: 0b1000, width: 2, height: 2 },
	{ char: "▚", pattern: 0b1001, width: 2, height: 2 },
	{ char: "▐", pattern: 0b1010, width: 2, height: 2 },
	{ char: "▜", pattern: 0b1011, width: 2, height: 2 },
	{ char: "▄", pattern: 0b1100, width: 2, height: 2 },
	{ char: "▙", pattern: 0b1101, width: 2, height: 2 },
	{ char: "▟", pattern: 0b1110, width: 2, height: 2 },
	{ char: "█", pattern: 0b1111, width: 2, height: 2 },
];

/**
 * Braille patterns (U+2800 - U+28FF)
 * 2x4 dot matrix with the following dot numbering (per Unicode standard):
 *
 *   Dot1 Dot4     (row 0)
 *   Dot2 Dot5     (row 1)
 *   Dot3 Dot6     (row 2)
 *   Dot7 Dot8     (row 3)
 *
 * Left column: dots 1, 2, 3, 7
 * Right column: dots 4, 5, 6, 8
 */
export const BRAILLE_BASE = 0x2800;

/**
 * Get Braille character for a given pattern
 * @param pattern 8-bit pattern representing dots 1-8
 */
export function getBrailleChar(pattern: number): string {
	return String.fromCodePoint(BRAILLE_BASE + (pattern & 0xff));
}

/**
 * Braille dot positions as bit masks (per Unicode standard numbering)
 */
export const BRAILLE_DOTS = {
	DOT1: 0b00000001, // Row 0, Left column
	DOT2: 0b00000010, // Row 1, Left column
	DOT3: 0b00000100, // Row 2, Left column
	DOT4: 0b00001000, // Row 0, Right column
	DOT5: 0b00010000, // Row 1, Right column
	DOT6: 0b00100000, // Row 2, Right column
	DOT7: 0b01000000, // Row 3, Left column
	DOT8: 0b10000000, // Row 3, Right column
};

/**
 * Generate all Braille symbols as SymbolDef array
 */
export function generateBrailleSymbols(): SymbolDef[] {
	const symbols: SymbolDef[] = [];
	for (let pattern = 0; pattern < 256; pattern++) {
		symbols.push({
			char: getBrailleChar(pattern),
			pattern,
			width: 2,
			height: 4,
		});
	}
	return symbols;
}

export const BRAILLE_SYMBOLS = generateBrailleSymbols();

/**
 * Sextant symbols for 2x3 resolution (Unicode 13.0+)
 * Pattern bits: [top-left, top-right, mid-left, mid-right, bottom-left, bottom-right]
 * Sorted by pattern value for maintainability.
 */
export const SEXTANT_SYMBOLS: SymbolDef[] = [
	{ char: " ", pattern: 0b000000, width: 2, height: 3 }, // 0
	{ char: "🬀", pattern: 0b000001, width: 2, height: 3 }, // 1
	{ char: "🬁", pattern: 0b000010, width: 2, height: 3 }, // 2
	{ char: "🬂", pattern: 0b000011, width: 2, height: 3 }, // 3
	{ char: "🬃", pattern: 0b000100, width: 2, height: 3 }, // 4
	{ char: "🬄", pattern: 0b000101, width: 2, height: 3 }, // 5
	{ char: "🬅", pattern: 0b000110, width: 2, height: 3 }, // 6
	{ char: "🬆", pattern: 0b000111, width: 2, height: 3 }, // 7
	{ char: "🬇", pattern: 0b001000, width: 2, height: 3 }, // 8
	{ char: "🬈", pattern: 0b001001, width: 2, height: 3 }, // 9
	{ char: "🬉", pattern: 0b001010, width: 2, height: 3 }, // 10
	{ char: "🬊", pattern: 0b001011, width: 2, height: 3 }, // 11
	{ char: "🬋", pattern: 0b001100, width: 2, height: 3 }, // 12
	{ char: "🬌", pattern: 0b001101, width: 2, height: 3 }, // 13
	{ char: "🬍", pattern: 0b001110, width: 2, height: 3 }, // 14
	{ char: "🬎", pattern: 0b001111, width: 2, height: 3 }, // 15
	{ char: "🬏", pattern: 0b010000, width: 2, height: 3 }, // 16
	{ char: "🬐", pattern: 0b010001, width: 2, height: 3 }, // 17
	{ char: "🬑", pattern: 0b010010, width: 2, height: 3 }, // 18
	{ char: "🬒", pattern: 0b010011, width: 2, height: 3 }, // 19
	{ char: "🬓", pattern: 0b010100, width: 2, height: 3 }, // 20
	{ char: "▌", pattern: 0b010101, width: 2, height: 3 }, // 21
	{ char: "🬔", pattern: 0b010110, width: 2, height: 3 }, // 22
	{ char: "🬕", pattern: 0b010111, width: 2, height: 3 }, // 23
	{ char: "🬖", pattern: 0b011000, width: 2, height: 3 }, // 24
	{ char: "🬗", pattern: 0b011001, width: 2, height: 3 }, // 25
	{ char: "🬘", pattern: 0b011010, width: 2, height: 3 }, // 26
	{ char: "🬙", pattern: 0b011011, width: 2, height: 3 }, // 27
	{ char: "🬚", pattern: 0b011100, width: 2, height: 3 }, // 28
	{ char: "🬛", pattern: 0b011101, width: 2, height: 3 }, // 29
	{ char: "🬜", pattern: 0b011110, width: 2, height: 3 }, // 30
	{ char: "🬝", pattern: 0b011111, width: 2, height: 3 }, // 31
	{ char: "🬞", pattern: 0b100000, width: 2, height: 3 }, // 32
	{ char: "🬟", pattern: 0b100001, width: 2, height: 3 }, // 33
	{ char: "🬠", pattern: 0b100010, width: 2, height: 3 }, // 34
	{ char: "🬡", pattern: 0b100011, width: 2, height: 3 }, // 35
	{ char: "🬢", pattern: 0b100100, width: 2, height: 3 }, // 36
	{ char: "🬣", pattern: 0b100101, width: 2, height: 3 }, // 37
	{ char: "🬤", pattern: 0b100110, width: 2, height: 3 }, // 38
	{ char: "🬥", pattern: 0b100111, width: 2, height: 3 }, // 39
	{ char: "🬦", pattern: 0b101000, width: 2, height: 3 }, // 40
	{ char: "🬧", pattern: 0b101001, width: 2, height: 3 }, // 41
	{ char: "▐", pattern: 0b101010, width: 2, height: 3 }, // 42
	{ char: "🬨", pattern: 0b101011, width: 2, height: 3 }, // 43
	{ char: "🬩", pattern: 0b101100, width: 2, height: 3 }, // 44
	{ char: "🬪", pattern: 0b101101, width: 2, height: 3 }, // 45
	{ char: "🬫", pattern: 0b101110, width: 2, height: 3 }, // 46
	{ char: "🬬", pattern: 0b101111, width: 2, height: 3 }, // 47
	{ char: "🬭", pattern: 0b110000, width: 2, height: 3 }, // 48
	{ char: "🬮", pattern: 0b110001, width: 2, height: 3 }, // 49
	{ char: "🬯", pattern: 0b110010, width: 2, height: 3 }, // 50
	{ char: "🬰", pattern: 0b110011, width: 2, height: 3 }, // 51
	{ char: "🬱", pattern: 0b110100, width: 2, height: 3 }, // 52
	{ char: "🬲", pattern: 0b110101, width: 2, height: 3 }, // 53
	{ char: "🬳", pattern: 0b110110, width: 2, height: 3 }, // 54
	{ char: "🬴", pattern: 0b110111, width: 2, height: 3 }, // 55
	{ char: "🬵", pattern: 0b111000, width: 2, height: 3 }, // 56
	{ char: "🬶", pattern: 0b111001, width: 2, height: 3 }, // 57
	{ char: "🬷", pattern: 0b111010, width: 2, height: 3 }, // 58
	{ char: "🬸", pattern: 0b111011, width: 2, height: 3 }, // 59
	{ char: "🬹", pattern: 0b111100, width: 2, height: 3 }, // 60
	{ char: "🬺", pattern: 0b111101, width: 2, height: 3 }, // 61
	{ char: "🬻", pattern: 0b111110, width: 2, height: 3 }, // 62
	{ char: "█", pattern: 0b111111, width: 2, height: 3 }, // 63
];

/**
 * Lookup map from SymbolSet enum to the corresponding symbol definitions
 */
const SYMBOL_SET_MAP: Record<SymbolSet, SymbolDef[]> = {
	[SymbolSet.ASCII]: ASCII_SYMBOLS,
	[SymbolSet.HALF]: HALF_BLOCK_SYMBOLS,
	[SymbolSet.QUADRANT]: QUADRANT_SYMBOLS,
	[SymbolSet.BRAILLE]: BRAILLE_SYMBOLS,
	[SymbolSet.SEXTANT]: SEXTANT_SYMBOLS,
};

/**
 * Get the appropriate symbol set
 */
export function getSymbolSet(name: SymbolSet): SymbolDef[] {
	return SYMBOL_SET_MAP[name] ?? HALF_BLOCK_SYMBOLS;
}

/**
 * Get symbol dimensions for a given symbol set.
 * Derives dimensions from the first symbol definition in the set.
 */
export function getSymbolDimensions(name: SymbolSet): {
	width: number;
	height: number;
} {
	const set = getSymbolSet(name);
	const first = set[0];
	return first ? { width: first.width, height: first.height } : { width: 1, height: 2 };
}

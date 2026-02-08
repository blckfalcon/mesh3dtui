// Main exports

// Color utilities
export {
	averageColors,
	BLACK,
	bgTruecolor,
	blendColors,
	clampByte,
	colorsEqual,
	fgTruecolor,
	getBrightness,
	hex,
	interpolateColor,
	invertColor,
	isPixelOn,
	rainbow,
	resetColors,
	rgb,
	TRANSPARENT,
	WHITE,
} from "./colors";
// Mapping utilities
export {
	findBestSymbol,
	mapBrailleRegion,
	mapPixelsToCells,
	mapRegionToPattern,
} from "./mapper";
export { AsciiRenderer } from "./renderer";
// Symbol definitions
export {
	ASCII_SYMBOLS,
	BRAILLE_BASE,
	BRAILLE_DOTS,
	BRAILLE_SYMBOLS,
	getBrailleChar,
	getSymbolDimensions,
	getSymbolSet,
	HALF_BLOCK_SYMBOLS,
	QUADRANT_SYMBOLS,
	SEXTANT_SYMBOLS,
} from "./symbols";
// Types
export type {
	Cell,
	Color,
	Grid,
	LineStyle,
	PixelBuffer,
	RenderOptions,
	SymbolDef,
} from "./types";
// Enums
export { ColorMode, DEFAULT_OPTIONS, SymbolSet } from "./types";

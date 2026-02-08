import {
	BLACK,
	bgTruecolor,
	colorsEqual,
	fgTruecolor,
	interpolateColor,
	resetColors,
} from "./colors";
import { mapPixelsToCells } from "./mapper";
import type { Cell, Color, Grid, LineStyle, PixelBuffer, RenderOptions } from "./types";
import { ColorMode, DEFAULT_OPTIONS, SymbolSet } from "./types";

/**
 * ASCII/Unicode pixel renderer
 * Renders pixel data using various Unicode symbol sets with truecolor support
 */
export class AsciiRenderer {
	private options: Required<RenderOptions>;

	constructor(options: Partial<RenderOptions> = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
	}

	/**
	 * Update render options
	 */
	setOptions(options: Partial<RenderOptions>): void {
		this.options = { ...this.options, ...options };
	}

	/**
	 * Get current options
	 */
	getOptions(): Required<RenderOptions> {
		return { ...this.options };
	}

	/**
	 * Set the symbol set for rendering
	 */
	setSymbolSet(symbolSet: SymbolSet): void {
		this.options.symbolSet = symbolSet;
	}

	/**
	 * Set the color mode for rendering
	 */
	setColorMode(colorMode: ColorMode): void {
		this.options.colorMode = colorMode;
	}

	/**
	 * Render a pixel buffer to a string
	 * @param pixels 2D array of colors representing the image
	 * @param options Optional override options for this render
	 * @returns ANSI-colored string representation
	 */
	render(pixels: PixelBuffer, options?: Partial<RenderOptions>): string {
		const opts = { ...this.options, ...options };
		const grid = mapPixelsToCells(pixels, opts.symbolSet, opts.threshold);
		return this.gridToString(grid, opts);
	}

	/**
	 * Convert a grid of cells to an ANSI string
	 */
	private gridToString(grid: Grid, options: Required<RenderOptions>): string {
		if (grid.length === 0) return "";

		const lines: string[] = [];

		for (const row of grid) {
			let line = "";
			let lastFg: Color | null = null;
			let lastBg: Color | null = null;

			for (const cell of row) {
				// Apply colors if they changed
				if (options.colorMode === ColorMode.TRUECOLOR) {
					// Check if foreground changed
					if (!lastFg || !colorsEqual(lastFg, cell.fg)) {
						line += fgTruecolor(cell.fg);
						lastFg = cell.fg;
					}

					// Check if background changed
					if (!lastBg || !colorsEqual(lastBg, cell.bg)) {
						line += bgTruecolor(cell.bg);
						lastBg = cell.bg;
					}
				}

				line += cell.char;
			}

			// Reset colors at end of line
			if (options.colorMode === ColorMode.TRUECOLOR) {
				line += resetColors();
			}

			lines.push(line);
		}

		return lines.join("\n");
	}

	/**
	 * Create an empty pixel buffer
	 * @throws {Error} If width or height are not positive
	 */
	createBuffer(width: number, height: number, fillColor?: Color): PixelBuffer {
		if (width <= 0 || height <= 0) {
			throw new Error(`Buffer dimensions must be positive: ${width}x${height}`);
		}
		const color = fillColor ?? { ...BLACK };
		return Array.from({ length: height }, () =>
			Array.from({ length: width }, () => ({ ...color })),
		);
	}

	/**
	 * Draw a pixel on the buffer
	 */
	setPixel(buffer: PixelBuffer, x: number, y: number, color: Color): void {
		if (y >= 0 && y < buffer.length) {
			const row = buffer[y];
			if (row && x >= 0 && x < row.length) {
				row[x] = color;
			}
		}
	}

	/**
	 * Get a pixel from the buffer
	 */
	getPixel(buffer: PixelBuffer, x: number, y: number): Color | null {
		if (y >= 0 && y < buffer.length) {
			const row = buffer[y];
			if (row && x >= 0 && x < row.length) {
				return row[x] ?? null;
			}
		}
		return null;
	}

	/**
	 * Draw a line using Bresenham's algorithm
	 * @returns The modified buffer (same reference)
	 */
	drawLine(
		buffer: PixelBuffer,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color: Color,
		style?: LineStyle,
	): PixelBuffer {
		// Guard against NaN/Infinity which would cause infinite loops
		if (
			!Number.isFinite(x1) ||
			!Number.isFinite(y1) ||
			!Number.isFinite(x2) ||
			!Number.isFinite(y2)
		) {
			return buffer;
		}

		const dx = Math.abs(x2 - x1);
		const dy = Math.abs(y2 - y1);
		const sx = x1 < x2 ? 1 : -1;
		const sy = y1 < y2 ? 1 : -1;
		let err = dx - dy;

		let x = x1;
		let y = y1;
		let step = 0;

		// Calculate line length for gradient
		const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

		// Determine line orientation for thickness direction
		const isSteep = dy > dx;

		while (true) {
			// Check dash pattern
			const pattern = style?.pattern;
			const shouldDraw = !pattern || pattern[step % pattern.length] === 1;

			if (shouldDraw) {
				// Calculate color with gradient if specified
				let drawColor = color;
				if (style?.startColor && style?.endColor) {
					const t = lineLength > 0 ? step / lineLength : 0;
					drawColor = interpolateColor(style.startColor, style.endColor, t);
				}

				// Draw with thickness perpendicular to line direction
				const thickness = style?.thickness ?? 1;
				if (thickness > 1) {
					// For steep lines (mostly vertical), thicken horizontally
					// For shallow lines (mostly horizontal), thicken vertically
					this.drawThickPixelPerpendicular(buffer, x, y, drawColor, thickness, isSteep);
				} else {
					this.setPixel(buffer, x, y, drawColor);
				}
			}

			if (x === x2 && y === y2) break;

			const e2 = 2 * err;
			if (e2 > -dy) {
				err -= dy;
				x += sx;
			}
			if (e2 < dx) {
				err += dx;
				y += sy;
			}
			step++;
		}

		return buffer;
	}

	/**
	 * Draw a pixel with thickness perpendicular to the line direction
	 * This ensures gaps in dashed lines are not filled by adjacent pixels
	 */
	private drawThickPixelPerpendicular(
		buffer: PixelBuffer,
		x: number,
		y: number,
		color: Color,
		thickness: number,
		isSteep: boolean,
	): void {
		if (isSteep) {
			// Line is mostly vertical, thicken horizontally (x direction)
			const start = x - Math.floor(thickness / 2);
			for (let dx = 0; dx < thickness; dx++) {
				this.setPixel(buffer, start + dx, y, color);
			}
		} else {
			// Line is mostly horizontal, thicken vertically (y direction)
			const start = y - Math.floor(thickness / 2);
			for (let dy = 0; dy < thickness; dy++) {
				this.setPixel(buffer, x, start + dy, color);
			}
		}
	}

	/**
	 * Draw a rectangle
	 */
	drawRect(
		buffer: PixelBuffer,
		x: number,
		y: number,
		width: number,
		height: number,
		color: Color,
		fill = false,
	): PixelBuffer {
		if (width <= 0 || height <= 0) return buffer;

		if (fill) {
			for (let dy = 0; dy < height; dy++) {
				for (let dx = 0; dx < width; dx++) {
					this.setPixel(buffer, x + dx, y + dy, color);
				}
			}
		} else {
			// Draw outline
			for (let dx = 0; dx < width; dx++) {
				this.setPixel(buffer, x + dx, y, color);
				this.setPixel(buffer, x + dx, y + height - 1, color);
			}
			for (let dy = 0; dy < height; dy++) {
				this.setPixel(buffer, x, y + dy, color);
				this.setPixel(buffer, x + width - 1, y + dy, color);
			}
		}
		return buffer;
	}

	/**
	 * Draw a circle using midpoint algorithm
	 */
	drawCircle(
		buffer: PixelBuffer,
		cx: number,
		cy: number,
		radius: number,
		color: Color,
		fill = false,
	): PixelBuffer {
		if (radius < 0) return buffer;

		let x = radius;
		let y = 0;
		let err = 0;

		while (x >= y) {
			if (fill) {
				// Draw horizontal lines for fill
				for (let dx = -x; dx <= x; dx++) {
					this.setPixel(buffer, cx + dx, cy + y, color);
					this.setPixel(buffer, cx + dx, cy - y, color);
				}
				for (let dx = -y; dx <= y; dx++) {
					this.setPixel(buffer, cx + dx, cy + x, color);
					this.setPixel(buffer, cx + dx, cy - x, color);
				}
			} else {
				// Draw outline points
				this.setPixel(buffer, cx + x, cy + y, color);
				this.setPixel(buffer, cx + y, cy + x, color);
				this.setPixel(buffer, cx - y, cy + x, color);
				this.setPixel(buffer, cx - x, cy + y, color);
				this.setPixel(buffer, cx - x, cy - y, color);
				this.setPixel(buffer, cx - y, cy - x, color);
				this.setPixel(buffer, cx + y, cy - x, color);
				this.setPixel(buffer, cx + x, cy - y, color);
			}

			if (err <= 0) {
				y += 1;
				err += 2 * y + 1;
			}
			if (err > 0) {
				x -= 1;
				err -= 2 * x + 1;
			}
		}

		return buffer;
	}

	/**
	 * Clear the buffer with a color
	 */
	clear(buffer: PixelBuffer, color: Color): PixelBuffer {
		for (let y = 0; y < buffer.length; y++) {
			const row = buffer[y];
			if (row) {
				for (let x = 0; x < row.length; x++) {
					row[x] = { ...color };
				}
			}
		}
		return buffer;
	}

	/**
	 * Render a line directly and return the output string
	 * Convenience method for quick line rendering
	 */
	renderLine(
		width: number,
		height: number,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color: Color,
		style?: LineStyle,
		options?: Partial<RenderOptions>,
	): string {
		const buffer = this.createBuffer(width, height);
		this.drawLine(buffer, x1, y1, x2, y2, color, style);
		return this.render(buffer, options);
	}
}

// Re-export types and enums
export { ColorMode, DEFAULT_OPTIONS, SymbolSet };
export type { Cell, Color, Grid, LineStyle, PixelBuffer, RenderOptions };

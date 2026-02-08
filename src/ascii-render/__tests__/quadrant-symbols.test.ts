/**
 * Tests for quadrant symbols (SymbolSet.QUADRANT)
 * Verifies that all 16 quadrant characters render correctly and map to correct patterns
 */

import { describe, expect, test } from "bun:test";
import { AsciiRenderer, rgb, SymbolSet } from "../index";

describe("Quadrant symbols", () => {
	const renderer = new AsciiRenderer({
		symbolSet: SymbolSet.QUADRANT,
		threshold: 128,
	});

	test("should render single pixel as top-left quadrant", () => {
		const buffer = renderer.createBuffer(2, 2, { r: 0, g: 0, b: 0, a: 255 });
		renderer.setPixel(buffer, 0, 0, { r: 255, g: 255, b: 255, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render full 2x2 block as full character", () => {
		const buffer = renderer.createBuffer(2, 2, { r: 0, g: 0, b: 0, a: 255 });
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				renderer.setPixel(buffer, x, y, { r: 255, g: 255, b: 255, a: 255 });
			}
		}

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render diagonal pattern correctly", () => {
		const buffer = renderer.createBuffer(2, 2, { r: 0, g: 0, b: 0, a: 255 });
		renderer.setPixel(buffer, 0, 0, { r: 255, g: 255, b: 255, a: 255 });
		renderer.setPixel(buffer, 1, 1, { r: 255, g: 255, b: 255, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render horizontal line with quadrant symbols", () => {
		const buffer = renderer.createBuffer(8, 2, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 0, 7, 0, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render vertical line with quadrant symbols", () => {
		const buffer = renderer.createBuffer(2, 8, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 0, 0, 7, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render rectangle with quadrant symbols", () => {
		const buffer = renderer.createBuffer(8, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawRect(buffer, 1, 1, 6, 4, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render filled rectangle with quadrant symbols", () => {
		const buffer = renderer.createBuffer(8, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawRect(buffer, 1, 1, 6, 4, rgb(255, 255, 255), true);

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render circle with quadrant symbols", () => {
		const buffer = renderer.createBuffer(12, 12, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawCircle(buffer, 6, 6, 4, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render full circle with quadrant symbols", () => {
		const buffer = renderer.createBuffer(20, 20, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawCircle(buffer, 10, 10, 5, rgb(255, 85, 85), true);

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render diagonal line with quadrant symbols", () => {
		const buffer = renderer.createBuffer(8, 8, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 0, 7, 7, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should handle empty buffer", () => {
		const buffer = renderer.createBuffer(4, 4, { r: 0, g: 0, b: 0, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});
});

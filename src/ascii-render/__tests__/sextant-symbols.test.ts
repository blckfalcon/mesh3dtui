/**
 * Tests for sextant symbols (SymbolSet.SEXTANT)
 * Verifies that sextant characters render correctly with 2x3 resolution
 */

import { describe, expect, test } from "bun:test";
import { AsciiRenderer, rgb, SymbolSet } from "../index";

describe("Sextant symbols", () => {
	const renderer = new AsciiRenderer({
		symbolSet: SymbolSet.SEXTANT,
		threshold: 128,
	});

	test("should render single pixel as top-left sextant", () => {
		const buffer = renderer.createBuffer(2, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.setPixel(buffer, 0, 0, { r: 255, g: 255, b: 255, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render full 2x3 block as full character", () => {
		const buffer = renderer.createBuffer(2, 3, { r: 0, g: 0, b: 0, a: 255 });
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 2; x++) {
				renderer.setPixel(buffer, x, y, { r: 255, g: 255, b: 255, a: 255 });
			}
		}

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render diagonal pattern correctly", () => {
		const buffer = renderer.createBuffer(2, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.setPixel(buffer, 0, 0, { r: 255, g: 255, b: 255, a: 255 });
		renderer.setPixel(buffer, 1, 1, { r: 255, g: 255, b: 255, a: 255 });
		renderer.setPixel(buffer, 0, 2, { r: 255, g: 255, b: 255, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render vertical line with sextant symbols", () => {
		const buffer = renderer.createBuffer(2, 9, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 0, 0, 8, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render horizontal line with sextant symbols", () => {
		const buffer = renderer.createBuffer(8, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 1, 7, 1, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render rectangle with sextant symbols", () => {
		const buffer = renderer.createBuffer(8, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawRect(buffer, 1, 1, 6, 4, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render filled rectangle with sextant symbols", () => {
		const buffer = renderer.createBuffer(8, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawRect(buffer, 1, 1, 6, 4, rgb(255, 255, 255), true);

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render circle with sextant symbols", () => {
		const buffer = renderer.createBuffer(12, 9, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawCircle(buffer, 6, 4, 3, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render filled circle with sextant symbols", () => {
		const buffer = renderer.createBuffer(12, 9, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawCircle(buffer, 6, 4, 3, rgb(255, 85, 85), true);

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should render diagonal line with sextant symbols", () => {
		const buffer = renderer.createBuffer(8, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 0, 7, 5, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("should handle empty buffer", () => {
		const buffer = renderer.createBuffer(4, 6, { r: 0, g: 0, b: 0, a: 255 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});
});

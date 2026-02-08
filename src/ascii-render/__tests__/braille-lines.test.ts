/**
 * Tests for braille line drawing at different y positions
 * Verifies that horizontal lines with thickness produce consistent output
 */

import { describe, expect, test } from "bun:test";
import { AsciiRenderer, rgb, SymbolSet } from "../index";

describe("Braille line drawing", () => {
	const renderer = new AsciiRenderer({
		symbolSet: SymbolSet.BRAILLE,
		threshold: 128,
	});

	test("thickness 2 line at y=1 fills rows 0 and 1", () => {
		const buffer = renderer.createBuffer(4, 4, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 1, 3, 1, rgb(255, 255, 255), { thickness: 2 });

		expect(buffer[0]?.[0]?.r).toBe(255);
		expect(buffer[1]?.[0]?.r).toBe(255);
		expect(buffer[2]?.[0]?.r).toBe(0);
		expect(buffer[3]?.[0]?.r).toBe(0);
	});

	test("thickness 2 line at y=2 fills rows 1 and 2", () => {
		const buffer = renderer.createBuffer(4, 4, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 2, 3, 2, rgb(255, 255, 255), { thickness: 2 });

		expect(buffer[0]?.[0]?.r).toBe(0);
		expect(buffer[1]?.[0]?.r).toBe(255);
		expect(buffer[2]?.[0]?.r).toBe(255);
		expect(buffer[3]?.[0]?.r).toBe(0);
	});

	test("thickness 2 line at y=4 fills rows 3 and 4", () => {
		const buffer = renderer.createBuffer(10, 6, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 0, 4, 8, 4, rgb(255, 255, 255), { thickness: 2 });

		expect(buffer[3]?.[0]?.r).toBe(255);
		expect(buffer[4]?.[0]?.r).toBe(255);
	});

	test("render output should match snapshot for various y positions", () => {
		const outputs: string[] = [];

		for (let y = 1; y <= 4; y++) {
			const buffer = renderer.createBuffer(10, 6, { r: 0, g: 0, b: 0, a: 255 });
			renderer.drawLine(buffer, 2, y, 8, y, rgb(0, 255, 100), { thickness: 2 });
			const output = renderer.render(buffer);
			outputs.push(`y=${y}:\n${output}`);
		}

		expect(outputs.join("\n\n")).toMatchSnapshot();
	});

	test("dashed lines with thickness should maintain gaps", () => {
		const buffer = renderer.createBuffer(20, 4, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 1, 17, 1, rgb(255, 255, 255), {
			pattern: [1, 1, 0, 0], // 2 on, 2 off
			thickness: 2,
		});

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("vertical lines with thickness should work correctly", () => {
		const buffer = renderer.createBuffer(4, 8, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 1, 1, 1, 6, rgb(255, 255, 255), { thickness: 2 });

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});
});

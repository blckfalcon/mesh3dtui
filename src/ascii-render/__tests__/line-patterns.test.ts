/**
 * Test for line dash patterns
 * Verifies that different dash patterns produce visually distinct outputs
 */

import { describe, expect, test } from "bun:test";
import { AsciiRenderer, rgb, SymbolSet } from "../index";

describe("Line dash patterns", () => {
	const renderer = new AsciiRenderer({
		symbolSet: SymbolSet.HALF,
		threshold: 128,
	});

	test("solid line should have no gaps", () => {
		const buffer = renderer.createBuffer(20, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 1, 17, 1, rgb(255, 255, 255));

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("dashed line should have gaps", () => {
		const buffer = renderer.createBuffer(20, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 1, 17, 1, rgb(255, 255, 255), {
			pattern: [1, 1, 1, 0, 0], // 3 on, 2 off
		});

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("dotted line should have more gaps than dashed", () => {
		const buffer = renderer.createBuffer(20, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 1, 17, 1, rgb(255, 255, 255), {
			pattern: [1, 0, 0], // 1 on, 2 off
		});

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("dash-dot line should be different from both dashed and dotted", () => {
		const buffer = renderer.createBuffer(20, 3, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 1, 17, 1, rgb(255, 255, 255), {
			pattern: [1, 1, 0, 1, 0, 0], // dash-dash-gap-dot-gap-gap
		});

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});

	test("all patterns should produce different outputs", () => {
		const patterns = [
			{ name: "solid", pattern: undefined },
			{ name: "dashed", pattern: [1, 1, 1, 0, 0] },
			{ name: "dotted", pattern: [1, 0, 0] },
			{ name: "dashDot", pattern: [1, 1, 0, 1, 0, 0] },
		];

		const outputs: string[] = [];

		for (const { pattern } of patterns) {
			const buffer = renderer.createBuffer(40, 5, { r: 0, g: 0, b: 0, a: 255 });
			renderer.drawLine(buffer, 2, 2, 37, 2, rgb(0, 255, 255), {
				pattern,
				thickness: 2,
			});
			const output = renderer.render(buffer);
			outputs.push(output);
		}

		expect(outputs).toMatchSnapshot();
	});

	test("thickness should not fill in gaps", () => {
		const buffer = renderer.createBuffer(20, 5, { r: 0, g: 0, b: 0, a: 255 });
		renderer.drawLine(buffer, 2, 2, 17, 2, rgb(255, 255, 255), {
			pattern: [1, 0, 0], // Dotted with gaps: positions 2, 5, 8... are drawn; 3, 4, 6, 7... are gaps
			thickness: 3,
		});

		const output = renderer.render(buffer);
		expect(output).toMatchSnapshot();
	});
});

import { createCliRenderer } from "@opentui/core";
import { ThreeRenderable } from "@opentui/core/3d";
import { createRoot, extend, useKeyboard, useRenderer } from "@opentui/react";
import { GhosttyTerminalRenderable } from "ghostty-opentui/terminal-buffer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AmbientLight,
	BoxGeometry,
	Color,
	DirectionalLight,
	MeshPhongMaterial,
	PerspectiveCamera,
	Mesh as ThreeMesh,
	Scene as ThreeScene,
	Vector3,
} from "three";
import { AsciiRenderer, ColorMode, hex, SymbolSet } from "./ascii-render/index";

const BUFFER_WIDTH = 80;
const BUFFER_HEIGHT = 80;
const FPS = 60;
let dz = 1;
let angle = 0;

type Point2d = {
	x: number;
	y: number;
};

type Point3d = {
	x: number;
	y: number;
	z: number;
};

const vs = [
	{ x: 0.25, y: 0.25, z: 0.25 },
	{ x: -0.25, y: 0.25, z: 0.25 },
	{ x: -0.25, y: -0.25, z: 0.25 },
	{ x: 0.25, y: -0.25, z: 0.25 },

	{ x: 0.25, y: 0.25, z: -0.25 },
	{ x: -0.25, y: 0.25, z: -0.25 },
	{ x: -0.25, y: -0.25, z: -0.25 },
	{ x: 0.25, y: -0.25, z: -0.25 },
];

const fs = [
	[0, 1, 2, 3],
	[4, 5, 6, 7],
	[0, 4],
	[1, 5],
	[2, 6],
	[3, 7],
];

const sphereRadius = 0.5;
const sphereSegments = 12;
const sphereVs: Point3d[] = [];
for (let lat = 0; lat <= sphereSegments; lat++) {
	const theta = (lat / sphereSegments) * Math.PI;
	for (let lon = 0; lon < sphereSegments; lon++) {
		const phi = (lon / sphereSegments) * 2 * Math.PI;
		const v = {
			x: sphereRadius * Math.sin(theta) * Math.cos(phi),
			y: sphereRadius * Math.cos(theta),
			z: sphereRadius * Math.sin(theta) * Math.sin(phi),
		};
		sphereVs.push(rotate_yz(v, Math.PI / 6));
	}
}
const sphereFs: Array<Array<number>> = [];
for (let lat = 0; lat < sphereSegments; lat++) {
	for (let lon = 0; lon < sphereSegments; lon++) {
		const a = lat * sphereSegments + lon;
		const b = lat * sphereSegments + ((lon + 1) % sphereSegments);
		const c = (lat + 1) * sphereSegments + lon;
		sphereFs.push([a, b]); // latitude
		sphereFs.push([a, c]); // longitude
	}
}

const rend = new AsciiRenderer({
	symbolSet: SymbolSet.BRAILLE,
	colorMode: ColorMode.TRUECOLOR,
	threshold: 128,
});
const buffer = rend.createBuffer(BUFFER_WIDTH, BUFFER_HEIGHT);

function point({ x, y }: Point2d) {
	const s = 2;
	rend.drawRect(buffer, Math.round(x - s / 2), Math.round(y - s / 2), s, s, hex("#50FF00"), true);
}

function line(p1: Point2d, p2: Point2d) {
	rend.drawLine(
		buffer,
		Math.round(p1.x),
		Math.round(p1.y),
		Math.round(p2.x),
		Math.round(p2.y),
		hex("#50FF00"),
	);
}

function screen(p: Point2d): Point2d {
	// -1..1 -> 0..2 -> 0..1 -> 0..h
	return {
		x: ((p.x + 1) / 2) * BUFFER_WIDTH,
		y: (1 - (p.y + 1) / 2) * BUFFER_HEIGHT,
	};
}

function project({ x, y, z }: Point3d): Point2d {
	return {
		x: x / z,
		y: y / z,
	};
}

function translate_z({ x, y, z }: Point3d, dz: number): Point3d {
	return { x, y, z: z + dz };
}

function rotate_yz({ x, y, z }: Point3d, angle: number) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return {
		x,
		y: y * c - z * s,
		z: y * s + z * c,
	};
}

function rotate_xz({ x, y, z }: Point3d, angle: number) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return {
		x: x * c - z * s,
		y,
		z: x * s + z * c,
	};
}

function drawCube() {
	for (const f of fs) {
		for (let i = 0; i < f.length; ++i) {
			const a = vs[f[i] as number] ?? { x: 0, y: 0, z: 0 };
			const b = vs[f[(i + 1) % f.length] as number] ?? { x: 0, y: 0, z: 0 };
			line(
				screen(project(translate_z(rotate_xz(a, angle), dz))),
				screen(project(translate_z(rotate_xz(b, angle), dz))),
			);
		}
	}
}

function drawSphere() {
	for (const f of sphereFs) {
		for (let i = 0; i < f.length; ++i) {
			const a = sphereVs[f[i] as number] ?? { x: 0, y: 0, z: 0 };
			const b = sphereVs[f[(i + 1) % f.length] as number] ?? { x: 0, y: 0, z: 0 };
			line(
				screen(project(translate_z(rotate_xz(a, angle), dz))),
				screen(project(translate_z(rotate_xz(b, angle), dz))),
			);
		}
	}
}

const sceneRoot = new ThreeScene();
sceneRoot.background = new Color().setHex(0x5a5a5a);
const ambientLight = new AmbientLight(new Color(0.3, 0.35, 0.35), 1.0);
sceneRoot.add(ambientLight);

const keyLight = new DirectionalLight(new Color(1.0, 0.95, 0.9), 1.2);
keyLight.position.set(2.5, 2.0, 3.0);
sceneRoot.add(keyLight);

const fillLight = new DirectionalLight(new Color(0.5, 0.7, 1.0), 0.6);
fillLight.position.set(-2.0, -1.5, 2.5);
sceneRoot.add(fillLight);

const cubeGeometry = new BoxGeometry(1.0, 1.0, 1.0);
const cubeMaterial = new MeshPhongMaterial({
	color: new Color(0.85, 0.85, 0.85),
	emissive: new Color(0.2, 0.2, 0.6),
	shininess: 80,
	wireframe: true,
});

const cubeMesh = new ThreeMesh(cubeGeometry, cubeMaterial);
cubeMesh.name = "cube";
sceneRoot.add(cubeMesh);

const cameraNode = new PerspectiveCamera(45, 1, 0.1, 100);
cameraNode.position.set(0, 0, 3);
cameraNode.name = "main_camera";

const rotationSpeed = new Vector3(0.0, 0.0, 0.0);

function App() {
	const renderer = useRenderer();
	const [output, setOutput] = useState("");
	const [meshNav, setMeshNav] = useState(0);
	const [threeRend, setThreeRend] = useState(false);
	const lastTimeRef = useRef(0);

	const animate = useCallback(() => {
		const dt = 1 / FPS;
		angle += Math.PI * dt;
		lastTimeRef.current = dt;

		cubeMesh.rotation.x += rotationSpeed.x * dt;
		cubeMesh.rotation.y += rotationSpeed.y * dt;
		cubeMesh.rotation.z += rotationSpeed.z * dt;

		rend.clear(buffer, hex("#1a1a1a"));

		switch (meshNav) {
			case 0:
				point(screen(project(translate_z(rotate_xz({ x: 0.5, y: 0, z: 0 }, angle), dz))));
				break;
			case 1:
				drawCube();
				break;
			case 2:
				drawSphere();
				break;
		}

		const rendered = rend.render(buffer);
		setOutput(rendered);
	}, [meshNav]);

	useEffect(() => {
		const id = setInterval(animate, 1000 / FPS);
		return () => clearInterval(id);
	}, [animate]);

	useKeyboard((e) => {
		switch (e.name) {
			case "`": {
				renderer.console.toggle();
				break;
			}
			case "left": {
				setMeshNav((nav) => (nav - 1 + 3) % 3);
				break;
			}
			case "right": {
				setMeshNav((nav) => (nav + 1) % 3);
				break;
			}
			case "w": {
				rotationSpeed.x -= 0.1;
				break;
			}
			case "a": {
				rotationSpeed.y -= 0.1;
				break;
			}
			case "s": {
				rotationSpeed.x += 0.1;
				break;
			}
			case "d": {
				rotationSpeed.y += 0.1;
				break;
			}
			case "r": {
				setThreeRend(!threeRend);
				break;
			}
			case "+": {
				dz -= 0.1;
				break;
			}
			case "-": {
				dz += 0.1;
				break;
			}
		}
	});

	// Terminal cols/rows derived from buffer + sextant symbol dimensions (2x3)
	// const termCols = Math.ceil(BUFFER_WIDTH / 2);
	// const termRows = Math.ceil(BUFFER_HEIGHT / 3);

	return (
		<box
			style={{
				flexDirection: "row",
				backgroundColor: "#000000",
				height: "100%",
			}}
		>
			{threeRend ? (
				<three style={{}} width={40} height={20} scene={sceneRoot} camera={cameraNode} />
			) : (
				<ghostty-terminal ansi={output} />
			)}
		</box>
	);
}

declare module "@opentui/react" {
	interface OpenTUIComponents {
		"ghostty-terminal": typeof GhosttyTerminalRenderable;
		three: typeof ThreeRenderable;
	}
}

extend({ "ghostty-terminal": GhosttyTerminalRenderable });
extend({ three: ThreeRenderable });

const cliRenderer = await createCliRenderer();
createRoot(cliRenderer).render(<App />);

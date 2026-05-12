/**
 * Wireframe Material
 *
 * Custom shader material for medical-grade purple wireframe visualization.
 * Renders base purple color with white grid overlay for scientific aesthetic.
 *
 * @module organisms/OBodyModel3D/materials/WireframeMaterial
 * @since EPIC-001-S15
 */

import * as THREE from 'three';

/**
 * Vertex Shader
 * Passes UV coordinates and position to fragment shader
 */
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment Shader
 * Calculates base color with grid overlay
 */
const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 gridColor;
  uniform float gridOpacity;
  uniform float gridThickness;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    // Grid calculation: 20x20 cells across UV space
    vec2 grid = abs(fract(vUv * 20.0) - 0.5);

    // Smooth line edges
    float line = min(grid.x, grid.y);
    float gridMask = 1.0 - smoothstep(gridThickness - 0.01, gridThickness + 0.01, line);

    // Mix base purple with white grid lines
    vec3 color = mix(baseColor, gridColor, gridMask * gridOpacity);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Create wireframe shader material
 *
 * Returns custom ShaderMaterial with configurable base color and white grid overlay.
 * Configurable via uniforms for theme customization.
 *
 * @param baseColor - Optional base color as hex number (default: 0x9370db - medium purple)
 * @returns Three.js ShaderMaterial
 *
 * @example
 * ```typescript
 * // Default purple
 * const material = createWireframeMaterial();
 *
 * // Custom base color
 * const material = createWireframeMaterial(0x1890ff);
 *
 * // Adjust grid visibility
 * material.uniforms.gridOpacity.value = 0.5;
 * ```
 */
export function createWireframeMaterial(baseColor: number = 0x9370db): THREE.ShaderMaterial {
	const material = new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms: {
			// Base color (customizable, defaults to medium purple)
			baseColor: { value: new THREE.Color(baseColor) },

			// Grid overlay (white)
			gridColor: { value: new THREE.Color(0xffffff) },

			// Grid visibility (0 = invisible, 1 = opaque)
			gridOpacity: { value: 0.3 },

			// Grid line thickness (adjustable)
			gridThickness: { value: 0.02 },
		},
		side: THREE.DoubleSide, // Render both sides for complete visibility
	});

	return material;
}

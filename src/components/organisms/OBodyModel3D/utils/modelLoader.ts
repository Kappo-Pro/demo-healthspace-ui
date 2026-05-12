/**
 * Model Loader Utility
 *
 * Loads pre-rigged humanoid models using GLTFLoader.
 * Extracts SkinnedMesh from GLTF scene for measurement-based body visualization.
 *
 * @module organisms/OBodyModel3D/utils/modelLoader
 * @since EPIC-001-S15
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Load pre-rigged humanoid model from GLB file
 *
 * @param url - Path to GLB file (e.g., '/models/human-female-basemesh.glb')
 * @returns Promise resolving to SkinnedMesh with skeleton
 * @throws Error if model fails to load or no SkinnedMesh found
 *
 * @example
 * ```typescript
 * const mesh = await loadPreRiggedHumanoid('/models/human-female-basemesh.glb');
 *  * ```
 */
export async function loadPreRiggedHumanoid(url: string): Promise<THREE.SkinnedMesh> {

	const loader = new GLTFLoader();

	return new Promise((resolve, reject) => {
		loader.load(
			url,
			(gltf) => {

				// Traverse scene to find SkinnedMesh
				let skinnedMesh: THREE.SkinnedMesh | null = null;

				gltf.scene.traverse((node) => {
					if (node instanceof THREE.SkinnedMesh && !skinnedMesh) {
						skinnedMesh = node;
					}
				});

				if (!skinnedMesh) {
					const error = new Error('[ModelLoader] No SkinnedMesh found in GLTF scene');
					console.error(error.message);
					reject(error);
					return;
				}

				const boneCount = skinnedMesh.skeleton?.bones?.length || 0;

				if (boneCount < 15) {
					const error = new Error(
						`[ModelLoader] Insufficient bones: expected minimum 15, found ${boneCount}`
					);
					console.error(error.message);
					reject(error);
					return;
				}

				// Check if UV coordinates exist, generate if missing
				if (!skinnedMesh.geometry.attributes.uv) {
					console.warn('[ModelLoader] No UV coordinates found - generating planar UV mapping...');

					const positions = skinnedMesh.geometry.attributes.position;
					const uvs = new Float32Array(positions.count * 2);

					// Generate simple planar UV mapping from X/Y coordinates
					for (let i = 0; i < positions.count; i++) {
						const x = positions.getX(i);
						const y = positions.getY(i);

						// Map position to 0-1 UV space
						uvs[i * 2] = (x + 1.0) * 0.5;      // U coordinate
						uvs[i * 2 + 1] = (y + 1.0) * 0.5;  // V coordinate
					}

					skinnedMesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
				}

				resolve(skinnedMesh);
			},
			(progress) => {
				const percent = (progress.loaded / progress.total) * 100;
			},
			(error) => {
				console.error('[ModelLoader] Failed to load model:', error);
				reject(error);
			}
		);
	});
}

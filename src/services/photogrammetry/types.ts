/**
 * Photogrammetry Type Definitions
 *
 * @module services/photogrammetry/types
 * @since EPIC-001-S14
 */

/**
 * Captured photo with metadata
 */
export interface CapturePhoto {
	/** Photo blob data */
	blob: Blob;
	/** Capture angle (0-360 degrees) */
	angle: number;
	/** Timestamp */
	timestamp: number;
	/** Photo index in sequence */
	index: number;
}

/**
 * Mesh data structure
 */
export interface MeshData {
	/** Vertex positions (flat array: [x,y,z, x,y,z, ...]) */
	vertices: Float32Array;
	/** Face indices (flat array: [a,b,c, a,b,c, ...]) */
	indices: Uint32Array;
	/** Vertex normals (optional) */
	normals?: Float32Array;
	/** UV coordinates (optional) */
	uvs?: Float32Array;
}

/**
 * Avatar metadata
 */
export interface AvatarMetadata {
	/** Total vertex count */
	vertexCount: number;
	/** Total face count */
	faceCount: number;
	/** Texture dimensions (if textured) */
	textureSize?: {
		width: number;
		height: number;
	};
	/** Generation timestamp */
	generatedAt: number;
	/** Processing duration (ms) */
	processingTime: number;
}

/**
 * Complete 3D avatar
 */
export interface Avatar3D {
	/** Mesh geometry */
	mesh: MeshData;
	/** Texture URL (data URL or blob URL) */
	texture?: string;
	/** Avatar metadata */
	metadata: AvatarMetadata;
}

/**
 * Processing progress callback
 */
export interface ProcessingProgress {
	/** Progress percentage (0-100) */
	progress: number;
	/** Current step message */
	message: string;
	/** Estimated time remaining (seconds) */
	estimatedTimeRemaining?: number;
}

/**
 * Avatar generation options
 */
export interface AvatarGenerationOptions {
	/** Processing mode */
	mode: 'client' | 'server';
	/** Quality preset */
	quality: 'draft' | 'standard' | 'high';
	/** Target vertex count */
	targetVertexCount?: number;
	/** Enable texture mapping */
	enableTextures?: boolean;
}

/**
 * Avatar generation result
 */
export interface AvatarGenerationResult {
	/** Generated avatar */
	avatar: Avatar3D;
	/** Processing duration (ms) */
	processingTime: number;
	/** Success status */
	success: boolean;
	/** Error message (if failed) */
	error?: string;
}

/**
 * Export format types
 */
export type ExportFormat = 'gltf' | 'glb' | 'obj';

/**
 * Export options
 */
export interface ExportOptions {
	/** Export format */
	format: ExportFormat;
	/** Include textures */
	includeTextures?: boolean;
	/** Compression mode */
	compression?: 'none' | 'draco' | 'gzip';
}

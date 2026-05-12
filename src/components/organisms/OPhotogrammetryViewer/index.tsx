/**
 * Photogrammetry 3D Viewer Component
 *
 * Displays photogrammetry-generated 3D avatar with texture mapping.
 * Builds on BodyModel3D infrastructure with high-fidelity mesh support.
 *
 * @module organisms/OPhotogrammetryViewer
 * @since EPIC-001-S14
 *
 * @example
 * ```tsx
 * import { PhotogrammetryViewer } from '@organisms/OPhotogrammetryViewer';
 *
 * <PhotogrammetryViewer
 *   avatar={generatedAvatar}
 *   onExport={(format) => handleExport(format)}
 * />
 * ```
 */

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button, Space, Dropdown, Typography, Card } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import * as THREE from 'three';
import type { Avatar3D, ExportFormat } from '../../../services/photogrammetry/types';
import { exportAvatar, downloadAvatar, getFileExtension } from '../../../services/photogrammetry/export';
import styled from 'styled-components';

const { Text } = Typography;

/**
 * Styled Components
 */
const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 600px;
	background: var(--background-primary);
`;

const ViewerContainer = styled.div`
	flex: 1;
	position: relative;
	background: var(--gray-900);
	overflow: hidden;
`;

const Controls = styled.div`
	padding: var(--spacing-4);
	background: var(--background-secondary);
	border-top: 1px solid var(--border-color);
`;

const MetadataCard = styled(Card)`
	position: absolute;
	top: var(--spacing-4);
	right: var(--spacing-4);
	width: 250px;
	opacity: 0.95;
`;

/**
 * Component Props
 */
export interface PhotogrammetryViewerProps {
	/** 3D avatar to display */
	avatar: Avatar3D;
	/** Export callback */
	onExport?: (format: ExportFormat) => void;
	/** Show metadata overlay */
	showMetadata?: boolean;
	/** Show performance stats */
	showPerformance?: boolean;
}

/**
 * Textured Mesh Component
 *
 * Renders high-fidelity mesh with texture mapping.
 */
const TexturedMesh: React.FC<{ avatar: Avatar3D }> = ({ avatar }) => {
	const meshRef = useRef<THREE.Mesh>(null);

	// Build geometry from avatar data
	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();

		geo.setAttribute('position', new THREE.BufferAttribute(avatar.mesh.vertices, 3));
		geo.setIndex(new THREE.BufferAttribute(avatar.mesh.indices, 1));

		if (avatar.mesh.normals) {
			geo.setAttribute('normal', new THREE.BufferAttribute(avatar.mesh.normals, 3));
		} else {
			geo.computeVertexNormals();
		}

		if (avatar.mesh.uvs) {
			geo.setAttribute('uv', new THREE.BufferAttribute(avatar.mesh.uvs, 2));
		}

		return geo;
	}, [avatar]);

	// Load texture
	const texture = useMemo(() => {
		if (!avatar.texture) return null;

		const loader = new THREE.TextureLoader();
		return loader.load(avatar.texture);
	}, [avatar.texture]);

	// Material
	const material = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			map: texture,
			color: texture ? 0xffffff : 0xcccccc,
			roughness: 0.8,
			metalness: 0.2,
			side: THREE.DoubleSide,
		});
	}, [texture]);

	return <mesh ref={meshRef as any} geometry={geometry} material={material} />;
};

/**
 * Scene Lighting
 */
const SceneLighting: React.FC = () => {
	return (
		<>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 5, 5]} intensity={0.8} />
			<directionalLight position={[-5, -5, -5]} intensity={0.3} />
			<directionalLight position={[0, 5, 0]} intensity={0.5} />
		</>
	);
};

/**
 * Photogrammetry Viewer Component
 *
 * Implements AC3, AC4, AC5: High-fidelity mesh display and export.
 */
export const PhotogrammetryViewer: React.FC<PhotogrammetryViewerProps> = ({
	avatar,
	onExport,
	showMetadata = true,
	showPerformance = false,
}) => {
	/**
	 * Handle export to format
	 */
	const handleExport = async (format: ExportFormat) => {
		try {
			const blob = await exportAvatar(avatar, {
				format,
				includeTextures: true,
				compression: format === 'gltf' || format === 'glb' ? 'draco' : 'none',
			});

			const filename = `avatar-${Date.now()}${getFileExtension(format)}`;
			downloadAvatar(blob, filename);

			onExport?.(format);
		} catch (error) {
			console.error('[PhotogrammetryViewer] Export error:', error);
		}
	};

	/**
	 * Export menu items
	 */
	const exportMenuItems = [
		{
			key: 'gltf',
			label: 'glTF (.gltf)',
			icon: <UntitledIcon name="download" size="small" />,
			onClick: () => handleExport('gltf'),
		},
		{
			key: 'glb',
			label: 'GLB (.glb)',
			icon: <UntitledIcon name="download" size="small" />,
			onClick: () => handleExport('glb'),
		},
		{
			key: 'obj',
			label: 'Wavefront OBJ (.obj)',
			icon: <UntitledIcon name="download" size="small" />,
			onClick: () => handleExport('obj'),
		},
	];

	return (
		<Container>
			<ViewerContainer>
				{/* Three.js Canvas */}
				<Canvas
					camera={{ position: [0, 0.9, 3], fov: 50 }}
					frameloop="demand"
					gl={{
						antialias: true,
						powerPreference: 'high-performance',
						alpha: true,
					}}
					dpr={1}
				>
					<SceneLighting />
					<TexturedMesh avatar={avatar} />
					<OrbitControls
						enableDamping={false}
						enableZoom={true}
						zoomSpeed={0.3}
						zoomToCursor={false}
						enablePan={true}
						panSpeed={0.5}
						screenSpacePanning={false}
						enableRotate={true}
						rotateSpeed={0.5}
						minDistance={2}
						maxDistance={5}
						target={[0, 0.9, 0]}
						autoRotate={false}
					/>
				</Canvas>

				{/* Metadata Overlay */}
				{showMetadata && (
					<MetadataCard title="Avatar Info" size="small">
						<Space direction="vertical" size="small" style={{ width: '100%' }}>
							<div>
								<Text type="secondary" style={{ fontSize: 12 }}>
									Vertices:
								</Text>
								<br />
								<Text strong>{avatar.metadata.vertexCount.toLocaleString()}</Text>
							</div>
							<div>
								<Text type="secondary" style={{ fontSize: 12 }}>
									Faces:
								</Text>
								<br />
								<Text strong>{avatar.metadata.faceCount.toLocaleString()}</Text>
							</div>
							{avatar.metadata.textureSize && (
								<div>
									<Text type="secondary" style={{ fontSize: 12 }}>
										Texture:
									</Text>
									<br />
									<Text strong>
										{avatar.metadata.textureSize.width} ×{' '}
										{avatar.metadata.textureSize.height}
									</Text>
								</div>
							)}
							<div>
								<Text type="secondary" style={{ fontSize: 12 }}>
									Generated:
								</Text>
								<br />
								<Text strong style={{ fontSize: 11 }}>
									{new Date(avatar.metadata.generatedAt).toLocaleString()}
								</Text>
							</div>
						</Space>
					</MetadataCard>
				)}
			</ViewerContainer>

			{/* Controls */}
			<Controls>
				<Space style={{ width: '100%', justifyContent: 'space-between' }}>
					<Space>
						<Text type="secondary">
							High-fidelity 3D avatar ({avatar.metadata.vertexCount.toLocaleString()}{' '}
							vertices)
						</Text>
					</Space>

					<Dropdown menu={{ items: exportMenuItems }} placement="topRight">
						<Button
							type="primary"
							icon={<UntitledIcon name="download" size="small" />}
						>
							Export Avatar
						</Button>
					</Dropdown>
				</Space>
			</Controls>
		</Container>
	);
};

export default PhotogrammetryViewer;

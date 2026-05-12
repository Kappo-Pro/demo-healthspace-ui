import React, { useState, useEffect } from 'react';
import { Collapse, InputNumber, Typography, Space, Empty, theme } from 'antd';
import {
	EyeOutlined,
	EyeInvisibleOutlined,
	CheckCircleTwoTone,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Panel } = Collapse;
const { Title } = Typography;

interface Landmark {
	x: number;
	y: number;
	z?: number;
	visibility?: number;
	visible?: boolean;
	index: number;
}

interface RightSideBarProps {
	landmarks: Landmark[];
	exerciseName: string;
	onUpdateLandmarkPosition: (index: number, x: number, y: number, z: number) => void;
	onToggleLandmarkVisibility: (index: number, visible: boolean) => void;
	onBatchToggleLandmarkVisibility: (indices: number[], visible: boolean) => void;
	selectedLandmark?: number;
	initialized: boolean;
	setInitialized: (initialized: boolean) => void;
}

const LANDMARK_NAMES = [
	'Nose', 'Left Eye Inner', 'Left Eye', 'Left Eye Outer', 'Right Eye Inner', 'Right Eye',
	'Right Eye Outer', 'Left Ear', 'Right Ear', 'Mouth Left', 'Mouth Right', 'Left Shoulder',
	'Right Shoulder', 'Left Elbow', 'Right Elbow', 'Left Wrist', 'Right Wrist', 'Left Pinky',
	'Right Pinky', 'Left Index', 'Right Index', 'Left Thumb', 'Right Thumb', 'Left Hip',
	'Right Hip', 'Left Knee', 'Right Knee', 'Left Ankle', 'Right Ankle', 'Left Heel',
	'Right Heel', 'Left Foot', 'Right Foot',
];

const CATEGORY_GROUPS: Record<string, number[]> = {
	Shoulders: [11, 12],
	Arms: [13, 14, 15, 16],
	Hips: [23, 24],
	Legs: [25, 26, 27, 28],
	Feet: [29, 30, 31, 32],
};

const RightSideBar: React.FC<RightSideBarProps> = ({
	landmarks,
	exerciseName,
	onUpdateLandmarkPosition,
	onToggleLandmarkVisibility,
	onBatchToggleLandmarkVisibility,
	selectedLandmark,
	initialized, setInitialized
}) => {
	const [activeCategory, setActiveCategory] = useState<string | string[]>('Shoulders');
	const {t} = useTranslation();
	const { token } = theme.useToken();

	// Reset initialization when exercise name changes
	useEffect(() => {
		setInitialized(false);
	}, [exerciseName, setInitialized]);

	useEffect(() => {
		if (!initialized && landmarks.length > 0) {
			const indicesToShow = new Set<number>();
			const indicesToHide = new Set<number>();
			const name = exerciseName.toLowerCase();

			const groups: Record<string, number[]> = {
				"right wrist": [14, 16, 18, 20, 22],
				"left wrist": [13, 15, 17, 19, 21],
				"right hip": [24, 26, 28],
				"left hip": [23, 25, 27],
				"right shoulder": [12, 14, 24],
				"left shoulder": [11, 13, 23],
			};

			// Determine which landmarks to show based on exercise name
			if (name.includes("neck")) {
				// For neck exercises, show all landmarks
				landmarks.forEach((_, i) => indicesToShow.add(i));
			}
			else if (name.includes("wrist") && !name.includes("left") && !name.includes("right")) {
				// For generic wrist exercises, show hand-related landmarks
				landmarks.forEach((_, i) => {
					if (i >= 13 && i <= 22) {
						indicesToShow.add(i);
					}
				});
			}
			else {
				if (name.includes("shoulder")) {
					if (name.includes("left")) {
						groups["left shoulder"].forEach(i => indicesToShow.add(i));
					} else if (name.includes("right")) {
						groups["right shoulder"].forEach(i => indicesToShow.add(i));
					}
				} else {
					// Check other exercise types
					for (const [key, indices] of Object.entries(groups)) {
						if (name.includes(key)) {
							indices.forEach(i => indicesToShow.add(i));
							break;
						}
					}
				}

				// For non-shoulder exercises, don't auto-show opposite side
				if (!name.includes("shoulder")) {
					if (name.includes("left")) {
						landmarks.forEach((_, i) => {
							if (LANDMARK_NAMES[i]?.toLowerCase().includes("right")) {
								indicesToShow.delete(i);
							}
						});
					} else if (name.includes("right")) {
						landmarks.forEach((_, i) => {
							if (LANDMARK_NAMES[i]?.toLowerCase().includes("left")) {
								indicesToShow.delete(i);
							}
						});
					}
				}
			}

			// Build hide list: everything that's not in show list
			landmarks.forEach((_, i) => {
				if (!indicesToShow.has(i)) {
					indicesToHide.add(i);
				}
			});

			// First show the landmarks that should be visible
			if (indicesToShow.size > 0) {
				onBatchToggleLandmarkVisibility(Array.from(indicesToShow), true);
			}

			// Then hide the landmarks that should be hidden
			if (indicesToHide.size > 0) {
				onBatchToggleLandmarkVisibility(Array.from(indicesToHide), false);
			}

			setInitialized(true);
		}
	}, [exerciseName, landmarks.length, initialized, setInitialized, onBatchToggleLandmarkVisibility]);

	const toggleCategoryVisibility = (category: string, indices: number[]) => {
		const allVisible = indices.every(i => landmarks[i]?.visible !== false);
		onBatchToggleLandmarkVisibility(indices, !allVisible);
	};

	return (
		<div style={{ padding: 4, overflowY: 'auto', height: '100%' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
				<Title level={4} style={{ color: token.colorText, margin: 0 }}>{t('Admin.data.imageAnnotation.landmarks')}</Title>
			</div>
			{landmarks.length > 0 && !exerciseName.toLowerCase().includes("neck") ? 
			<Collapse
				accordion
				activeKey={activeCategory}
				onChange={key => setActiveCategory(key as string)}
			>
				{Object.entries(CATEGORY_GROUPS).map(([category, indices]) => {
					const anyGroupVisible = indices.some(i => landmarks[i]?.visible !== false);

					return (
						<Panel
							key={category}
							showArrow={true}
							header={
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
									<span style={{ fontWeight: 'bold', color: token.colorText, userSelect: 'none' }}>{category}</span>
									<span
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											toggleCategoryVisibility(category, indices);
										}}
										style={{
											cursor: 'pointer',
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											padding: 4,
											borderRadius: 4,
											transition: 'background 0.2s',
											backgroundColor: 'transparent',
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = token.colorBgTextHover;
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'transparent';
										}}
									>
										{anyGroupVisible ? (
											<EyeOutlined style={{ fontSize: 18, color: token.colorText }} />
										) : (
											<EyeInvisibleOutlined style={{ fontSize: 18, color: token.colorTextDisabled }} />
										)}
									</span>
								</div>
							}
						>
							{indices.map(index => {
								const lm = landmarks[index];
								if (!lm) return null;

								const isVisible = lm.visible !== false;
								const isSelected = selectedLandmark === index;

								return (
									<div
										key={index}
										style={{
											border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
											borderRadius: 8,
											padding: 10,
											marginBottom: 12,
											backgroundColor: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
											position: 'relative',
										}}
									>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
											<span style={{ fontWeight: 'var(--font-weight-semibold)', color: token.colorText, flex: 1, userSelect: 'none' }}>
												{index - 10} : {LANDMARK_NAMES[index]}
											</span>
											<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
												<span
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														onToggleLandmarkVisibility(index, !isVisible);
													}}
													style={{
														cursor: 'pointer',
														display: 'inline-flex',
														alignItems: 'center',
														justifyContent: 'center',
														padding: 4,
														borderRadius: 4,
														transition: 'background 0.2s',
														backgroundColor: 'transparent',
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = token.colorBgTextHover;
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													{isVisible ? (
														<EyeOutlined style={{ fontSize: 18, color: token.colorText }} />
													) : (
														<EyeInvisibleOutlined style={{ fontSize: 18, color: token.colorTextDisabled }} />
													)}
												</span>
												{isSelected && (
													<CheckCircleTwoTone twoToneColor="var(--success-500)" style={{ fontSize: 20 }} />
												)}
											</div>
										</div>

										<Space size={8}>
											<Space>
												<span style={{ color: token.colorText }}>X:</span>
												<InputNumber
													value={lm.x}
													step={0.01}
													formatter={value => (value !== undefined ? parseFloat(value).toFixed(2) : '')}
													disabled={!isVisible}
													style={{ width: '85%' }}
													onChange={val => {
														if (typeof val === 'number') {
															onUpdateLandmarkPosition(index, val, lm.y, lm.z ?? 0);
														}
													}}
												/>
											</Space>
											<Space>
												<span style={{ color: token.colorText }}>Y:</span>
												<InputNumber
													value={lm.y}
													step={0.01}
													style={{ width: '85%' }}
													formatter={value => (value !== undefined ? parseFloat(value).toFixed(2) : '')}
													disabled={!isVisible}
													onChange={val => {
														if (typeof val === 'number') {
															onUpdateLandmarkPosition(index, lm.x, val, lm.z ?? 0);
														}
													}}
												/>
											</Space>
										</Space>
									</div>
								);
							})}
						</Panel>
					);
				})}
			</Collapse> : <Empty description={"No Landmarks Present"} style={{marginTop: 40}}/>}
		</div>
	);
};

export default RightSideBar;
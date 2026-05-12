import { ResponsiveImage } from '@atoms/ResponsiveImage';
import { CONSTANT } from '@stores/constants';
import { CustomRomSession, RomPatientResult } from '@types';
import {
	Card,
	Divider,
	Flex,
	Popover,
	Progress,
	Table,
	Tag,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	evalScore,
	jointsTemplateData,
	sittingJointsTemplateData,
} from './jointsTemplateData';

const { Title, Text } = Typography;

interface JointsDataProps {
	title?: string;
	key: string;
	joint: string;
	measures: {
		name: string;
		value: number;
		score: number;
		normal: number;
		wfl: number;
	}[];
	position: { top: number; left: number };
}

interface BodySilhouetteWithHotspotsProps {
	getColorForCategory: (score: number) => string;
	getCategoryName: (score: number) => string;
	getCategoryDesc: (score: number) => string;
	selectedRom: CustomRomSession;
	isPdf?: boolean;
}

const BodySilhouetteWithHotspots = ({
	getColorForCategory,
	getCategoryName,
	getCategoryDesc,
	selectedRom,
	isPdf,
}: BodySilhouetteWithHotspotsProps) => {
	const { t } = useTranslation();
	const [jointsData, setJointsData] = useState<JointsDataProps[]>([]);

	useEffect(() => {
		if (selectedRom) {
			const data = (
				selectedRom?.strapiOmniRomProgramId == 55 ||
				selectedRom.romProgram?.title === CONSTANT.SITTINGBASELINESCAN
					? sittingJointsTemplateData
					: jointsTemplateData
			).map(jointTemplate => {
				const matchedMeasures =
					selectedRom?.romPatientResults?.flatMap(item => {
						const title = item?.title?.toLowerCase();
						const isMatchingJoint =
							title?.includes(jointTemplate.key) ||
							title?.includes(jointTemplate.joint.toLowerCase());
						const isSpineMatch =
							title?.includes('lumbar') && jointTemplate?.key === 'spine';
						const isExcludedJoint = [
							'neck',
							'spine',
							'lumbar',
							'left wrist',
							'right wrist',
						].some(point => title?.includes(point));

						if (isMatchingJoint || isSpineMatch) {
							return (
								item.results?.map(result => ({
									...item, // Include parent fields (validatedScore, validatedScorePt, etc.)
									...result, // Result fields override
									name:
										result.romProgramExercise?.strapiOmniRomExercise
											?.movementTitle ||
										result?.strapiOmniRomExercise?.name ||
										result.romProgramExercise?.exerciseLibrary?.title ||
										item?.title,
									// Keep original explicit fields for backward compatibility
									// TODO: Consider using value ?? defaultValue or value?.property instead of value!
									value: result?.value,
									// TODO: Consider using score ?? defaultValue or score?.property instead of score!
									score: result?.score,
									// TODO: Consider using normal ?? defaultValue or normal?.property instead of normal!
									normal: result?.normal,
									// TODO: Consider using wfl ?? defaultValue or wfl?.property instead of wfl!
									wfl: result?.wfl,
									bodySideTitle:
										result.romProgramExercise?.strapiOmniRomExercise
											?.bodySideTitle || t('Patient.data.vitalscan-rom.noTitle'),
								})) ?? []
							);
						}

						return (
							item.results
								?.filter(result => {
									if (isExcludedJoint) return false;

									let currentKey = result?.mobilityMapper;

									if (
										result?.mobilityMapper === 'rightShoulder' &&
										title?.includes('(left)')
									) {
										currentKey = 'leftShoulder';
									}

									return (
										currentKey === jointTemplate.key ||
										result.romProgramExercise?.strapiOmniRomExercise
											?.bodySideTitle == jointTemplate.joint
									);
								})
								.map(result => ({
									name:
										result.romProgramExercise?.strapiOmniRomExercise
											?.movementTitle ||
										result?.strapiOmniRomExercise?.name ||
										result.romProgramExercise?.exerciseLibrary?.title ||
										item?.title,
									// TODO: Consider using value ?? defaultValue or value?.property instead of value!
									value: result?.value,
									// TODO: Consider using score ?? defaultValue or score?.property instead of score!
									score: result?.score,
									// TODO: Consider using normal ?? defaultValue or normal?.property instead of normal!
									normal: result?.normal,
									// TODO: Consider using wfl ?? defaultValue or wfl?.property instead of wfl!
									wfl: result?.wfl,
									bodySideTitle:
										result.romProgramExercise?.strapiOmniRomExercise
											?.bodySideTitle || t('Patient.data.vitalscan-rom.noTitle'),
								})) ?? []
						);
					}) || [];

				return {
					...jointTemplate,
					title: matchedMeasures[0]?.bodySideTitle,
					measures: matchedMeasures,
				};
			});

			setJointsData(data);
		}
	}, [selectedRom, t]);

	const columns = [
		{
			title: t('Patient.data.vitalscan-rom.normal'),
			dataIndex: 'normal',
			key: 'normal',
			width: 80,
		},
		{
			title: t('Patient.data.vitalscan-rom.wfl'),
			dataIndex: 'wfl',
			key: 'wfl',
			width: 80,
		},
		{
			title: t('Patient.data.vitalscan-rom.value'),
			dataIndex: 'value',
			key: 'value',
			render: (value: number, record: RomPatientResult) => {
				const evaluatedScore = evalScore(record);
				return (
					<span
						style={{
							color: getColorForCategory(evaluatedScore || 0),
							fontWeight: 'bold',
						}}>
						{value}
					</span>
				);
			},
			width: 80,
		},
		{
			title: t('Patient.data.vitalscan-rom.score'),
			dataIndex: 'score',
			key: 'score',
			render: (_: number, record: RomPatientResult) => {
				const evaluatedScore = evalScore(record);
				return (
					<Tag
						color={getColorForCategory(evaluatedScore)}
						style={{ width: '100%', textAlign: 'center' }}>
						{Math.round(evaluatedScore)}
					</Tag>
				);
			},
			width: 80,
		},
	];

	const isSitting =
		selectedRom.strapiOmniRomProgramId == 55 ||
		selectedRom.romProgram?.title === CONSTANT.SITTINGBASELINESCAN;

	return (
		<Card
			className={`body-hotspots card-hotspots ${isSitting ? 'sitting' : 'standing'}`}
			style={{ border: 'none', width: '33.4%', minWidth: 'fit-content' }}>
			<div
				className="body-hotspots inline-block"
				style={{ width: isSitting ? 280 : 150, position: 'relative' }}>
				{isSitting ? (
					<ResponsiveImage
						src="/images/rom/sitting.webp"
						style={{ width: 280 }}
						alt={t('Patient.data.vitalscan-rom.scanResult.sittingPositionAlt')}
						loading="eager"
					/>
				) : (
					<ResponsiveImage
						src="/images/rom/front.webp"
						style={{ width: 150 }}
						alt={t('Patient.data.vitalscan-rom.scanResult.bodyFrameAlt')}
						loading="eager"
					/>
				)}
				{/* <FrontBody /> */}
				{jointsData?.length > 0 &&
					jointsData.map((joint, index) => {
						// evalScore already returns normalized score (0-100), no need to divide by normal again
						const scores = joint?.measures?.map(j => Number(evalScore(j)));

						const total = scores?.reduce((sum, score) => sum + score, 0);
						const average = total / scores?.length;

						const avgScore = parseFloat(average?.toFixed(2));
						const color = getColorForCategory(avgScore);
						const jointInitials = joint?.joint
							.split(' ')
							.map(word => word[0])
							.join('');
						return joint?.measures?.length > 0 ? (
							<Popover
								key={index}
								placement="right"
								trigger={['hover']}
								content={
									<div
										style={{
											width: 320,
											maxHeight: '500px',
											overflow: 'auto',
											userSelect: 'none',
										}}>
										<Flex justify="space-between" align="flex-start">
											<Title level={5} style={{ marginBottom: 16, flex: 1 }}>
												{joint.title}
											</Title>
											<Progress
												style={{ '--my-color': color }}
												className="progress-score"
												strokeColor={color}
												percent={Math.round(avgScore)}
												steps={6}
												format={percent => `${percent}`}
											/>
										</Flex>
										{joint.measures.map((measure, idx) => {
											return (
												<div key={idx}>
													<Text
														style={{
															fontWeight: 'bold',
															marginTop: idx > 0 ? 20 : 0,
														}}>
														{measure.name}
													</Text>
													<Table
														dataSource={[measure]}
														columns={columns}
														pagination={false}
														bordered
														size="small"
														style={{ marginBottom: 20 }}
													/>
												</div>
											);
										})}

										<Divider style={{ margin: '16px 0' }} />

										<div
											style={{
												backgroundColor: color,
												padding: '10px 16px',
												borderRadius: '4px 4px 0 0',
												color: 'var(--text-on-brand)',
												textAlign: 'center',
												fontWeight: 'bold',
											}}>
											{getCategoryName(avgScore)}
										</div>
										<div
											style={{
												padding: 'var(--spacing-2-5)',
												backgroundColor: 'var(--surface-tertiary)',
												borderRadius: '0 0 4px 4px',
											}}>
											<Text>{getCategoryDesc(avgScore)}</Text>
										</div>
									</div>
								}
								trigger="hover">
								<Flex
									align="center"
									justify="center"
									style={{
										position: 'absolute',
										top: joint.position.top,
										left: joint.position.left,
										width: 24,
										height: 24,
										borderRadius: 'var(--radius-full)',
										backgroundColor: color,
										color: 'var(--text-on-brand)',
										fontWeight: 'bold',
										fontSize: 12,
										cursor: 'pointer',
										boxShadow: 'var(--shadow-sm)',
										transform: 'translate(-50%, -50%)',
									}}>
									<p className={isPdf ? 'pdf-margin' : ''}>{jointInitials}</p>
								</Flex>
							</Popover>
						) : (
							<Flex
								align="center"
								justify="center"
								style={{
									position: 'absolute',
									top: joint.position.top,
									left: joint.position.left,
									width: 24,
									height: 24,
									borderRadius: 'var(--radius-full)',
									backgroundColor: 'var(--color-gray-300)',
									color: 'var(--text-on-brand)',
									fontWeight: 'bold',
									fontSize: 12,
									cursor: 'pointer',
									transform: 'translate(-50%, -50%)',
								}}
							/>
						);
					})}
			</div>
		</Card>
	);
};

export default BodySilhouetteWithHotspots;

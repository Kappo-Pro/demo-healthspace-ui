import { UntitledIcon } from '@atoms/Icon';
import { InfoCircle } from '@vitalflow-icons/general/infoCircle';
import { useTypedSelector } from '@stores/index';
import {
	CustomRomBodyPoints,
	CustomRomExercise,
	CustomRomSessionExercise,
} from '@types';
import {
	Card,
	Empty,
	Flex,
	Image,
	Input,
	List,
	Progress,
	Tooltip,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

const { Title } = Typography;

import './style.css';
interface ICustomSummaryContent {
	item: CustomRomSessionExercise[];
}

const CustomSummaryContentResult = (props: ICustomSummaryContent) => {
	const { item } = props;
	const { t } = useTranslation();
	const { user } = useTypedSelector(state => ({
		user: state.user,
	}));

	const [editedPostures, setEditedPostures] = useState<{
		[key: string]: CustomRomBodyPoints;
	}>({});
	const [labels, setLabels] = useState<string[]>([]);
	const [itemData, setItemData] = useState<unknown>(item);

	useEffect(() => {
		const uniqueItems = new Map();
		item.forEach(exercise => {
			const title = exercise?.title || 'Unknown';
			if (
				!uniqueItems.has(title) ||
				new Date(exercise.updatedAt) >
					new Date(uniqueItems.get(title).updatedAt)
			) {
				uniqueItems.set(title, exercise);
			}
		});
		setItemData(Array.from(uniqueItems.values()));
	}, [item]);

	const handleInputChange = (
		postureId: string,
		field: string,
		value: number,
	) => {
		setEditedPostures(prevState => ({
			...prevState,
			[postureId]: {
				...prevState[postureId],
				[field]: value,
			},
		}));
	};

	const calculateScore = (
		normal: number,
		value: number,
		id: number,
	): number => {
		if (id !== 21 && id !== 17 && id !== 4 && id !== 11) {
			if (value === 0) {
				return 0;
			}
			const score = Math.round((value / normal) * 100);
			return isFinite(score) ? score : 0;
		} else {
			if (value === 0) {
				return 100;
			}
			const score = Math.round(100 - (value / 100) * 100);
			return isFinite(score) ? score : 0;
		}
	};

	const handleRender = (scrnshot: string) => {
		return (
			<Image
				width={64}
				height={53}
				src={scrnshot}
				preview={{
					src: scrnshot,
					mask: <UntitledIcon name="eye" size={18} />,
					width: 'auto',
					height: 'auto',
				}}
				style={{ borderRadius: 'var(--radius-lg)' }}
				onError={e => {
					const target = e.target as HTMLImageElement;
					target.src = '/images/white-image.png';
				}}
			/>
		);
	};

	const calculateRanking = (score: number): number => {
		if (score >= 91) return 10;
		if (score >= 81) return 9;
		if (score >= 71) return 8;
		if (score >= 61) return 7;
		if (score >= 51) return 6;
		if (score >= 41) return 5;
		if (score >= 31) return 4;
		if (score >= 21) return 3;
		if (score >= 11) return 2;
		if (score >= 1) return 1;
		return 0;
	};

	const rankingColor = (ranking: number) => {
		if (ranking >= 1 && ranking <= 6) return 'var(--color-error-500)';
		if (ranking >= 7 && ranking <= 9) return 'var(--color-warning-400)';
		if (ranking === 10) return 'var(--color-success)';
		return 'var(--color-gray-500)';
	};

	// Helper to safely render values that might be objects with left/right
	const renderValue = (value: unknown): string => {
		if (value === null || value === undefined) return '0';
		if (typeof value === 'number') return String(value);
		if (typeof value === 'object' && value !== null) {
			const obj = value as { left?: number; right?: number };
			if ('left' in obj || 'right' in obj) {
				const parts: string[] = [];
				if (obj.left !== undefined) parts.push(`L: ${Math.round(obj.left)}`);
				if (obj.right !== undefined) parts.push(`R: ${Math.round(obj.right)}`);
				return parts.join(' / ');
			}
		}
		return String(value);
	};

	useEffect(() => {
		setLabels(['normal', 'wfl', 'value']);
	}, [user]);

	const formatDisplayValue = (value: unknown) => {
		// Case 1: number → round if decimal
		if (typeof value === 'number') {
			return Number.isInteger(value) ? value : Math.round(value);
		}

		// Case 2: left/right object
		if (
			typeof value === 'object' &&
			value !== null &&
			'left' in value &&
			'right' in value
		) {
			const v = value as { left: number; right: number };
			return `L: ${Math.round(v.left)} / R: ${Math.round(v.right)}`;
		}

		// Case 3: string or anything else
		return String(value ?? '');
	};

	return (
		<div className="rom-card-container p-0">
			{itemData?.map((exercise: CustomRomExercise, _idx: number) => (
				<>
					{exercise?.results?.length > 0 ? (
						<Card
							key={exercise.id}
							className="MCardResults posture-card-section"
							size="small"
							title={
								<div className="posture-title-container">
									<Flex className="posture-title" align="center" gap={10}>
										{exercise?.results?.length > 1 &&
											handleRender(exercise?.screenshot)}
										<Paragraph>
											{(
												exercise?.title ||
												exercise?.strapiOmniRomExercise?.name ||
												exercise?.exerciseLibrary?.title ||
												exercise?.romProgramExercise?.strapiOmniRomExercise
													?.name ||
												exercise?.romProgramExercise?.exerciseLibrary?.title ||
												exercise?.results[0]?.romProgramExercise
													?.exerciseLibrary?.title ||
												exercise?.romProgramExercise?.exerciseLibrary?.title ||
												exercise?.results[0]?.romProgramExercise
													?.strapiOmniRomExercise?.name ||
												exercise?.results[0]?.strapiOmniRomExercise?.name ||
												'No Title'
											).toUpperCase()}
										</Paragraph>
									</Flex>
									<div
										className="posture-label-container"
										style={{
											width: '258px',
											paddingLeft: '5px',
										}}>
										{labels.map(label => (
											<div key={label} className="posture-label">
												<Flex
													className="posture-label-text"
													align="center"
													justify="center">
													{label === 'wfl'
														? label.toUpperCase()
														: label.charAt(0).toUpperCase() +
															label.slice(1).toLowerCase()}
													{(label === 'wfl' || label === 'normal') && (
														<Tooltip
															placement="topLeft"
															title={
																<span className="text-gray-700 font-semibold !p-2">
																	{label === 'wfl'
																		? t(
																				'Patient.data.myProgress.omniRom.wflToolTip',
																			)
																		: t(
																				'Patient.data.myProgress.omniRom.normalToolTip',
																			)}
																</span>
															}
															color="var(--surface-elevated)"
															className="text-gray-700 font-semibold">
															<div className="ml-1">
																<InfoCircle
																	width={16}
																	height={16}
																	color="stroke-gray-600"
																/>
															</div>
														</Tooltip>
													)}
												</Flex>
											</div>
										))}
									</div>
								</div>
							}>
							<List>
								{exercise.results?.map((posture: CustomRomBodyPoints) => {
									const score = calculateScore(
										posture.normal || posture.romProgramExercise.normal,
										posture.value,
										posture.romProgramExercise.strapiOmniRomExerciseId,
									);
									const ranking = calculateRanking(score);

									return (
										<div key={posture.id} className="posture-sides-container">
											<div className="posture-sides-section">
												{exercise?.results.length <= 1 ? (
													handleRender(exercise?.screenshot)
												) : (
													<Paragraph className="posture-sides-title">
														{posture?.strapiOmniRomExercise?.name ||
															posture?.romProgramExercise?.strapiOmniRomExercise
																?.name ||
															posture?.romProgramExercise?.exerciseLibrary
																?.title ||
															posture?.strapiOmniRomExercise?.name ||
															posture?.exerciseLibrary?.title ||
															'Standard Motion'}
													</Paragraph>
												)}
											</div>
											<div className="posture-side-labels-container">
												{labels.map(label => {
													const scoreColor = () => {
														if (score >= 90) return 'var(--color-success-400)';
														if (score >= 60 && score < 90)
															return 'var(--color-warning-400)';
														if (score >= 0 && score < 60)
															return 'var(--color-error-500)';
														return 'var(--color-gray-500)';
													};
													return (
														<div
															key={label}
															className="posture-side-labels-section">
															{editedPostures[posture.id] ? (
																label === 'score' || label === 'ranking' ? (
																	<p>
																		{label === 'score' ? (
																			<Progress
																				type="circle"
																				percent={score || 0}
																				strokeColor={scoreColor()}
																				width={50}
																				format={percent => (
																					<span
																						style={{
																							color: scoreColor(),
																							fontWeight: 'bold',
																						}}>
																						{percent}%
																					</span>
																				)}
																			/>
																		) : label === 'ranking' ? (
																			<span
																				style={{
																					color: rankingColor(ranking),
																				}}>
																				{ranking}
																			</span>
																		) : label === 'value' ? (
																			<span style={{ color: scoreColor() }}>
																				{renderValue((posture as unknown as Record<string, unknown>)[label])}
																			</span>
																		) : (
																			renderValue((posture as unknown as Record<string, unknown>)[label])
																		)}
																	</p>
																) : (
																	<Input
																		value={
																			editedPostures[posture.id]?.[label] || 0
																		}
																		type="number"
																		style={{ width: '70px' }}
																		onChange={e =>
																			handleInputChange(
																				posture.id,
																				label,
																				Number(e.target.value),
																			)
																		}
																	/>
																)
															) : (
																<p>
																	{label === 'score' ? (
																		<Progress
																			type="circle"
																			percent={score || 0}
																			strokeColor={scoreColor()}
																			width={50}
																			format={percent => (
																				<span
																					style={{
																						color: scoreColor(),
																						fontWeight: 'bold',
																					}}>
																					{percent}%
																				</span>
																			)}
																		/>
																	) : label === 'ranking' ? (
																		<span
																			style={{ color: rankingColor(ranking) }}>
																			{ranking}
																		</span>
																			) : label === 'value' ? (
																				<span style={{ color: scoreColor() }}>
																					{formatDisplayValue(
																						(posture as unknown as Record<string, unknown>)[label]
																					)}
																				</span>
																			) : (
																		renderValue((posture as unknown as Record<string, unknown>)[label])
																	)}
																</p>
															)}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</List>
						</Card>
					) : (
						<>
							<Empty />
						</>
					)}
				</>
			))}
		</div>
	);
};

export default CustomSummaryContentResult;

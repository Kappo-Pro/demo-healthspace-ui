import { UntitledIcon } from '@atoms/Icon';
import { UserListSkeleton } from '@atoms/Skeletons';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { fetchExercises } from '@stores/clinical/rom/romTemplates';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	RomProgramExercise,
	StrapiOmniRomExercises,
	StrapiPagination,
} from '@types';
import {
	Card,
	Col,
	Empty,
	Flex,
	Input,
	Pagination,
	Row,
	Tag,
	Typography,
} from 'antd';
import { KeyboardEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface ExerciseProps {
	setSelectedExercises: (selectedExercises: RomProgramExercise[]) => void;
	selectedExercises: RomProgramExercise[];
	isGrid: boolean;
	setGrid: (isGrid: boolean) => void;
}

export const CarespaceLibraryData = (props: ExerciseProps) => {
	const { selectedExercises, setSelectedExercises, isGrid, setGrid } = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const exerciseLoad = useTypedSelector(
		state => state.rom.romTemplates.exerciseLoad,
	);
	const [searchValue, setSearchValue] = useState<string>('');
	const vitalflowLibraryExercises = useTypedSelector(
		state => state.rom.romTemplates.vitalflowLibraryExercises,
	);
	const [suggestedExercisesData, setSuggestedExercisesData] = useState<
		StrapiOmniRomExercises[]
	>(vitalflowLibraryExercises?.data);
	const [suggestedExercisesPagination, setSuggestedExercisesPagination] =
		useState<StrapiPagination>(vitalflowLibraryExercises?.meta.pagination);
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);

	useEffect(() => {
		onPageChange(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setSuggestedExercisesData(vitalflowLibraryExercises?.data);
		setSuggestedExercisesPagination(
			vitalflowLibraryExercises?.meta?.pagination,
		);
	}, [vitalflowLibraryExercises]);

	const onPageChange = async (pageNumber: number) => {
		setSuggestedExercisesData([]);
		await dispatch(fetchExercises({ page: pageNumber, search: searchValue }));
	};

	const handleDivClick = (item: StrapiOmniRomExercises) => {
		if (
			selectedExercises?.find(exercise =>
				exercise?.strapiOmniRomExercise
					? exercise?.strapiOmniRomExercise?.id.toString() ===
						item?.id.toString()
					: exercise?.OmniRomExerciseId
						? exercise?.OmniRomExerciseId?.id.toString() === item?.id.toString()
						: exercise?.id.toString() === item?.id.toString(),
			)
		) {
			setSelectedExercises(
				selectedExercises?.filter(exercise =>
					exercise?.strapiOmniRomExercise
						? exercise?.strapiOmniRomExercise?.id.toString() !=
							item?.id.toString()
						: exercise?.OmniRomExerciseId
							? exercise?.OmniRomExerciseId?.id.toString() !=
								item?.id.toString()
							: exercise?.id.toString() != item?.id.toString(),
				),
			);
		} else {
			const kinematicsArray = [
				'Flexion',
				'Extension',
				'Abduction',
				'External Rotation',
				'Internal Rotation',
			];
			const exercise = {
				id: item?.id,
				strapiOmniRomExerciseId: item?.vitalflowId,
				name: item?.name,
				transitionTime: item?.transitionTime || 3,
				description: item?.description,
				image: item?.image?.url,
				video: item?.video?.url,
				bodypoint: [
					{
						name: item?.reference?.name,
						kinematics: kinematicsArray.find(kinematic =>
							item?.name?.includes(kinematic),
						),
						normal: item?.reference?.normal,
						wfl: item?.reference?.wfl,
						min: item?.reference?.min,
						function: item?.function,
						pointsToCalculateAngle: item?.pointsToCalculateAngle,
						pointsToValidatePosition: item?.pointsToValidatePosition,
						max: item?.reference?.max
							? item?.reference?.max
							: item?.reference?.normal,
					},
				],
			};
			setSelectedExercises([...selectedExercises, exercise]);
		}
	};

	const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			await dispatch(fetchExercises({ page: 1, search: searchValue }));
		}
	};

	return (
		<div>
			<Input
				className="library-search-input"
				placeholder={t(
					'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
				)}
				value={searchValue}
				onKeyDown={e => handleKeyDown(e)}
				onChange={e => setSearchValue(e.target.value)}
				suffix={<UntitledIcon name="search" />}
			/>
			{!exerciseLoad &&
				suggestedExercisesData &&
				suggestedExercisesData &&
				suggestedExercisesData.length > 0 && (
					<>
						<Flex
							gap={8}
							align="center"
							justify="flex-end"
							className="library-view-controls">
							{selectedExercises.length != 0 && (
								<Tag className="library-selected-count">
									{selectedExercises.length}
								</Tag>
							)}
							<Flex justify="flex-end">
								<span
									onClick={() => setGrid(false)}
									className={`library-view-btn library-view-btn-list ${!isGrid ? 'library-view-btn-active' : 'library-view-btn-inactive'}`}>
									<UntitledIcon name="list" size={20} />
								</span>
								<span
									onClick={() => setGrid(true)}
									className={`library-view-btn library-view-btn-grid ${isGrid ? 'library-view-btn-active' : 'library-view-btn-inactive'}`}>
									<UntitledIcon name="dashboard" size={20} />
								</span>
							</Flex>
						</Flex>
					</>
				)}
			<div className="library-exercises-container">
				{exerciseLoad ? (
					<UserListSkeleton count={6} />
				) : suggestedExercisesData &&
				  suggestedExercisesData &&
				  suggestedExercisesData.length > 0 ? (
					<>
						{!isGrid ? (
							suggestedExercisesData?.map(
								(item: StrapiOmniRomExercises, index: number) => {
									const isSelected = selectedExercises?.find(exercise =>
										exercise?.strapiOmniRomExercise
											? exercise?.strapiOmniRomExercise?.id.toString() ===
												item?.id.toString()
											: exercise?.id.toString() === item?.id.toString() ||
												exercise?.OmniRomExerciseId?.id.toString() ===
													item?.id.toString(),
									);
									return (
										<Card
											key={index}
											className={`library-exercise-card-item ${isSelected ? 'library-exercise-card-selected' : ''}`}
											hoverable
											onClick={() => handleDivClick(item)}>
											<Flex gap={16} align="center">
												<div
													onClick={e => {
														e.stopPropagation();
														setSelectedExercise({
															video: item?.video?.url,
															name: item?.name,
															description: item?.description,
														});
														setVideoModalOpen(true);
													}}>
													<div className="libary-side-video-div image-wrapper">
														<img
															src={item?.image?.url}
															className="img-css-side-video"
														/>
														<div className="play-button-css extra-top">
															<UntitledIcon name="playCircle" />
														</div>
													</div>
												</div>
												<div className="library-side-div">
													<Paragraph style={{margin: 0}} className="library-video-label">
														{item?.name}
													</Paragraph>
													<Paragraph className="my-library-time-label" style={{margin: 0}}>
													{t('Patient.data.vitalscan-rom.transistionTime')} :{' '}
													{item?.transitionTime ? item?.transitionTime : '3'}
												</Paragraph>
													<Paragraph className="library-video-sub-label">
														{item?.description
															? item.description
															: t('Patient.data.vitalscan-rom.noDescription')}
													</Paragraph>
													
												</div>
											</Flex>
										</Card>
									);
								},
							)
						) : (
							<>
								<Row gutter={[16, 16]}>
									{suggestedExercisesData?.map(item => {
										const isSelected = selectedExercises?.find(exercise =>
											exercise?.strapiOmniRomExercise
												? exercise?.strapiOmniRomExercise?.id.toString() ===
													item?.id.toString()
												: exercise?.id.toString() === item?.id.toString() ||
													exercise?.OmniRomExerciseId?.id.toString() ===
														item?.id.toString(),
										);
										return (
											<Col
												xs={12}
												sm={12}
												md={12}
												lg={12}
												xl={12}
												key={item.id}>
												<Card
													style={{ width: '100%', height: '100%' }}
													className={`library-exercise-card-item ${isSelected ? 'library-exercise-card-selected' : ''}`}
													hoverable
													onClick={() => handleDivClick(item)}>
													<Flex gap={16} align="center">
														<div
															onClick={e => {
																e.stopPropagation();
																setSelectedExercise({
																	video: item?.video?.url,
																	name: item?.name,
																	description: item?.description,
																});
																setVideoModalOpen(true);
															}}>
															<div className="row-libary-side-video-div image-wrapper">
																<img
																	src={item?.image?.url}
																	className="img-css-side-video"
																/>
																<div className="play-button-css extra-top">
																	<UntitledIcon name="playCircle" />
																</div>
															</div>
														</div>
														<div className="library-side-div">
															<Paragraph style={{margin: 0}} className="library-video-label">
																{item?.name}
															</Paragraph>
															<Paragraph style={{margin: 0}} className="my-library-time-label">
													{t('Patient.data.vitalscan-rom.transistionTime')} :{' '}
													{item?.transitionTime ? item?.transitionTime : '3'}
												</Paragraph>
															<Paragraph className="library-video-sub-label">
																{item?.description
																	? item.description
																	: t('Patient.data.vitalscan-rom.noDescription')}
															</Paragraph>
															
														</div>
													</Flex>
												</Card>
											</Col>
										);
									})}
								</Row>
							</>
						)}
					</>
				) : (
					<Empty
						description={t('Patient.data.vitalscan-rom.noExercisesFound')}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				)}
			</div>
			{!exerciseLoad && (
				<Flex justify="center" className="createProgramModalPagination">
					<Pagination
						current={suggestedExercisesPagination?.page}
						onChange={onPageChange}
						total={suggestedExercisesPagination?.total}
						showSizeChanger={false}
					/>
				</Flex>
			)}
			{selectedExercise && (
				<ExerciseVideoModal
					open={videoModalOpen}
					onClose={() => {
						setVideoModalOpen(false);
						setSelectedExercise(null);
					}}
					name={selectedExercise.name}
					description={selectedExercise.description}
					video={selectedExercise.video}
				/>
			)}
		</div>
	);
};

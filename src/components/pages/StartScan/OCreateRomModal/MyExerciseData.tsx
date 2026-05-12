import { UntitledIcon } from '@atoms/Icon';
import { UserListSkeleton } from '@atoms/Skeletons';
import OmniRomAddExercise from '@organisms/RehabFlow/RecordUploadExercises/OmniRomAddExercise';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { emptySelectedExercises } from '@stores/clinical/rehab/library';
import {
	resetAll,
	setIsOmniRomRecordModal,
	setOmniromRecord,
	setOmniromUpload,
} from '@stores/clinical/rehab/main';
import { getMyLibraryList } from '@stores/clinical/rom/romTemplates';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RomExerciseLibrary, RomProgramExercise } from '@types';
import {
	Button,
	Card,
	Col,
	Empty,
	Flex,
	Input,
	Modal,
	Pagination,
	Row,
	Tag,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Paragraph } = Typography;

interface ExerciseProps {
	setSelectedExercises: (selectedExercises: RomProgramExercise[]) => void;
	selectedExercises: RomProgramExercise[];
	isGrid: boolean;
	setGrid: (isGrid: boolean) => void;
}

export const MyExerciseData = (props: ExerciseProps) => {
	const { selectedExercises, setSelectedExercises, isGrid, setGrid } = props;
	const { t } = useTranslation();
	const romExerciseLibrary = useTypedSelector(
		state => state.rom.romTemplates.romExerciseLibrary,
	);
	const [searchValue, setSearchValue] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [libraryData, setLibraryData] = useState(romExerciseLibrary);
	const id = useTypedSelector(state => state.user.id);
	const [perpage, setPerPage] = useState(10);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const { isOmniRomRecordModal } = useTypedSelector(state => state.rehab.main);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);

	const onPageChange = (pageNumber: number, pageSize: number) => {
		setLibraryData([]);
		setPerPage(pageSize);
		fetchData(id, pageNumber);
	};

	useEffect(() => {
		setLibraryData(romExerciseLibrary);
	}, [romExerciseLibrary]);

	useEffect(() => {
		fetchData(id, 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchData = async (userId: string, page: number) => {
		setIsLoading(true);
		const payload = {
			userId: userId,
			search: searchValue,
			page: page,
		};
		dispatch(emptySelectedExercises());
		await dispatch(getMyLibraryList(payload));
		setIsLoading(false);
	};

	const handleDivClick = (item: RomExerciseLibrary) => {
		if (
			selectedExercises?.find(exercise =>
				exercise?.exerciseLibrary
					? exercise?.exerciseLibrary?.id.toString() === item?.id.toString()
					: exercise?.id.toString() === item?.id.toString(),
			)
		) {
			setSelectedExercises(
				selectedExercises?.filter(exercise =>
					exercise?.exerciseLibrary
						? exercise?.exerciseLibrary?.id.toString() != item?.id.toString()
						: exercise?.id.toString() != item?.id.toString(),
				),
			);
		} else {
			const exercise = {
				id: item?.id,
				exerciseLibraryId: item?.id,
				name: item?.title,
				description: item?.description,
				transitionTime: item?.transitionTime || 3,
				video: item?.video,
				bodypoint: item?.exercises,
			};
			setSelectedExercises([...selectedExercises, exercise]);
		}
	};

	const addExercise = () => {
		dispatch(resetAll());
		dispatch(setOmniromRecord(true));
		dispatch(setOmniromUpload(false));
		dispatch(setIsOmniRomRecordModal(true));
	};

	const uploadExercise = () => {
		dispatch(resetAll());
		dispatch(setOmniromUpload(true));
		dispatch(setOmniromRecord(false));
		dispatch(setIsOmniRomRecordModal(true));
	};

	const handleKeyDown = (e: { key: string }) => {
		if (e.key === 'Enter') {
			fetchData(id, 1);
		}
	};

	const handleCloseModal = () => {
		dispatch(setIsOmniRomRecordModal(false));
		dispatch(resetAll());
	};

	return (
		<div>
			<Flex align="center" gap={8} justify="space-between">
				<Input
					className="my-library-search-input"
					placeholder={t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
					)}
					value={searchValue}
					onKeyDown={handleKeyDown}
					onChange={e => setSearchValue(e.target.value)}
					suffix={<UntitledIcon name="search" />}
				/>
				<Button
					type="primary"
					icon={<UntitledIcon name="video" size={20} />}
					onClick={addExercise}
					className="ant-record-button">
					{t('Patient.data.vitalscan-rom.record')}
				</Button>
				<Button
					type="primary"
					style={{
						backgroundColor: 'var(--color-success-500)',
					}}
					icon={<UntitledIcon name="plus" size={20} />}
					onClick={uploadExercise}
					className="ant-record-button">
					{t('Patient.data.vitalscan-rom.upload')}
				</Button>
			</Flex>
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
			<div className="library-exercises-container">
				{isLoading ? (
					<UserListSkeleton count={6} />
				) : libraryData && libraryData.data && libraryData.data.length > 0 ? (
					!isGrid ? (
						libraryData?.data?.map(
							(item: RomExerciseLibrary, index: number) => {
								const isSelected = selectedExercises?.find(exercise =>
									exercise?.exerciseLibrary
										? exercise?.exerciseLibrary?.id.toString() ===
											item?.id.toString()
										: exercise?.id.toString() === item?.id.toString(),
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
														video: item?.video,
														name: item?.title,
														description: item?.description,
													});
													setVideoModalOpen(true);
												}}>
												<div className="libary-side-video-div image-wrapper">
													<video
														src={item?.video}
														controls={false}
														className="img-css-side-video"
													/>
													<div className="play-button-css extra-top">
														<UntitledIcon name="playCircle" />
													</div>
												</div>
											</div>
											<div className="library-side-div">
												<Typography className="library-video-label">
													{item?.title}
												</Typography>
												<Typography className="my-library-time-label">
													{t('Patient.data.vitalscan-rom.transistionTime')} :{' '}
													{item?.transitionTime ? item?.transitionTime : '3'}
												</Typography>
												<Typography className="library-video-sub-label">
													{item?.description}
												</Typography>
											</div>
										</Flex>
									</Card>
								);
							},
						)
					) : (
						<Row gutter={[16, 16]}>
							{libraryData?.data?.map((item: RomExerciseLibrary) => {
								const isSelected = selectedExercises?.find(exercise =>
									exercise?.exerciseLibrary
										? exercise?.exerciseLibrary?.id.toString() ===
											item?.id.toString()
										: exercise?.id.toString() === item?.id.toString(),
								);
								return (
									<Col xs={12} sm={12} md={12} lg={12} xl={12} key={item.id}>
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
															video: item?.video,
															name: item?.title,
															description: item?.description,
														});
														setVideoModalOpen(true);
													}}>
													<div className="row-libary-side-video-div image-wrapper">
														<video
															src={item?.video}
															controls={false}
															className="img-css-side-video"
														/>
														<div className="play-button-css extra-top">
															<UntitledIcon name="playCircle" />
														</div>
													</div>
												</div>
												<div className="library-side-div">
													<Paragraph className="library-video-label">
														{item?.title}
													</Paragraph>
													<Paragraph>
														<p>{item?.description}</p>
													</Paragraph>
												</div>
											</Flex>
										</Card>
									</Col>
								);
							})}
						</Row>
					)
				) : (
					<Empty
						description={t('Patient.data.vitalscan-rom.noExercisesFound')}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				)}
			</div>
			{!isLoading &&
				libraryData &&
				libraryData.data &&
				libraryData.data.length > 0 && (
					<Flex justify="center" className="createProgramModalPagination">
						<Pagination
							current={libraryData?.pagination?.currentPage}
							onChange={onPageChange}
							total={libraryData?.pagination?.totalCount}
							showSizeChanger={false}
							pageSize={perpage}
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
			<Modal
				open={isOmniRomRecordModal}
				onCancel={handleCloseModal}
				footer={null}
				width="90%"
				centered
				destroyOnClose
				className="vitalscan-rom-modal"
				styles={{
					body: {
						height: 'auto',
						objectFit: 'contain',
						padding: 0,
					},
				}}>
				<OmniRomAddExercise />
			</Modal>
		</div>
	);
};

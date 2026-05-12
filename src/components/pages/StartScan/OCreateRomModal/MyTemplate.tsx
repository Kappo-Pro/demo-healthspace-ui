import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { getRomTemplates } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRomTemplate, IPaginationPluginDefaultResponse } from '@types';
import {
	Card,
	Collapse,
	Empty,
	Flex,
	Input,
	Pagination,
	Typography,
} from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IRomMyTemplate {
	extra: (data: CustomRomTemplate) => ReactNode;
	refresh: boolean;
}

interface IMyTemplateRom {
	data: CustomRomTemplate[];
	pagination: IPaginationPluginDefaultResponse;
}

const MyTemplate = (props: IRomMyTemplate) => {
	const { extra, refresh } = props;

	const [myTemplateRom, setMyTemplateRom] = useState<IMyTemplateRom>();

	const { t } = useTranslation();
	const [searchValue, setSearchValue] = useState<string>('');
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const dispatch = useTypedDispatch();
	const [isLoading, setLoading] = useState(false);
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);

	useEffect(() => {
		getTemplate(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, selectedUser, searchValue, refresh]); // getTemplate intentionally excluded - function redefined on every render

	const getTemplate = async (page: number) => {
		setLoading(true);
		const data = await dispatch(
			getRomTemplates({ page: page, search: searchValue }),
		);
		setMyTemplateRom(data?.payload);
		setLoading(false);
	};

	const onPageChange = (pageNumber: number) => {
		getTemplate(pageNumber);
	};

	return (
		<>
			<Input
				className="library-search-input"
				placeholder={t(
					'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
				)}
				value={searchValue}
				onChange={e => setSearchValue(e.target.value)}
				suffix={<UntitledIcon name="search" />}
			/>
			{isLoading ? (
				<ActivityFeedSkeleton count={6} />
			) : (
				<>
					{myTemplateRom === undefined || myTemplateRom?.data.length === 0 ? (
						<Empty
							className="bg-gray-50 p-10 m-0"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span className="text-gray-300">
									{t(
										'Admin.data.menu.patientDetail.aiAssistantPrograms.noProgram',
									)}
								</span>
							}
						/>
					) : (
						<div className="library-exercises-container">
							<Flex vertical gap={8}>
								<Collapse bordered={false}>
									{myTemplateRom?.data?.map((data: CustomRomTemplate) => {
										const sortedExercises = [...(data?.exercises || [])].sort(
											(a, b) => a.order - b.order,
										);
										return (
											<Collapse.Panel
												key={data?.title}
												header={
													<Typography className="my-library-time-label">
														{data?.title}
													</Typography>
												}
												extra={extra(data)}>
												{sortedExercises?.map(item => {
													const image = item?.strapiOmniRomExercise?.image?.url;
													const video = item?.strapiOmniRomExercise
														? item?.strapiOmniRomExercise?.video?.url
														: item?.exerciseLibrary
															? item?.exerciseLibrary?.video
															: item?.video;
													const name = item?.strapiOmniRomExercise
														? item?.strapiOmniRomExercise?.name
														: item?.exerciseLibrary
															? item?.exerciseLibrary?.title
															: item?.name;
													const description = item?.strapiOmniRomExercise
														? item?.strapiOmniRomExercise?.description
														: item?.exerciseLibrary
															? item?.exerciseLibrary?.description
															: item?.description;
													return (
														<Card
															key={item?.name}
															className="template-card-item">
															<Flex align="center" gap={16} key={item?.name}>
																<div
																	onClick={e => {
																		e.stopPropagation();
																		setSelectedExercise({
																			video: video,
																			name: name,
																			description: description,
																		});
																		setVideoModalOpen(true);
																	}}>
																	<div className="libary-side-video-div image-wrapper">
																		{image ? (
																			<img
																				src={image}
																				className="img-css-side-video"
																			/>
																		) : (
																			<video
																				preload="metadata"
																				src={video}
																				className="img-css-side-video"
																			/>
																		)}
																		<div className="play-button-css extra-top">
																			<UntitledIcon name="playCircle" />
																		</div>
																	</div>
																</div>
																<div className="library-side-div">
																	<Typography className="library-video-label">
																		{name}
																	</Typography>
																	<Typography className="my-library-time-label">
																		{t('Patient.data.vitalscan-rom.transitionTime')} :{' '}
																		{item?.transitionTime}
																	</Typography>
																	<Typography className="library-video-sub-label">
																		{description}
																	</Typography>
																</div>
															</Flex>
														</Card>
													);
												})}
											</Collapse.Panel>
										);
									})}
								</Collapse>
							</Flex>
						</div>
					)}
					{!isLoading && (
						<Flex justify="center" className="createProgramModalPagination">
							<Pagination
								current={myTemplateRom?.pagination?.currentPage}
								showSizeChanger={false}
								onChange={onPageChange}
								total={myTemplateRom?.pagination?.totalCount}
							/>
						</Flex>
					)}
				</>
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
		</>
	);
};

export default MyTemplate;

import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { fetchSystemTemplateExercises } from '@stores/clinical/rom/romTemplates';
import { useTypedDispatch } from '@stores/index';
import { StrapiPagination, TemplateExerciseProgram } from '@types';
import { Card, Collapse, Empty, Flex, Typography } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IRomMyTemplate {
	extra: (data: TemplateExerciseProgram) => ReactNode;
}

interface dataItem {
	data: TemplateExerciseProgram[];
	meta: {
		pagination: StrapiPagination;
	};
}

const SystemTemplate = (props: IRomMyTemplate) => {
	const { extra } = props;
	const { t } = useTranslation();
	const [isLoading, setLoading] = useState(false);
	const [suggestedRomData, setSuggestedRomData] = useState<dataItem>();
	const dispatch = useTypedDispatch();
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);

	const fetchTemplateExercises = async (page: number) => {
		setLoading(true);
		const data = await dispatch(fetchSystemTemplateExercises({ page: page }));
		setSuggestedRomData(data?.payload);
		setLoading(false);
	};

	useEffect(() => {
		fetchTemplateExercises(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only effect - initial template fetch

	return (
		<>
			{isLoading ? (
				<ActivityFeedSkeleton count={6} />
			) : (
				<>
					{suggestedRomData?.data?.length === 0 || undefined ? (
						<Empty
							className="bg-gray-50 p-10 m-0"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span className="text-gray-300">
									{t('Admin.data.addToReports.noData')}
								</span>
							}
						/>
					) : (
						<div className="library-exercises-container">
							<Flex vertical gap={8}>
								<Collapse bordered={false}>
									{suggestedRomData?.data?.map(
										(data: TemplateExerciseProgram) => {
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
														return (
															<Card
																key={item?.name}
																className="template-card-item">
																<Flex align="center" gap={16} key={item?.name}>
																	<div
																		onClick={e => {
																			e.stopPropagation();
																			setSelectedExercise({
																				video: item?.OmniRomExerciseId?.video
																					? item?.OmniRomExerciseId?.video?.url
																					: item?.video,
																				name: item?.OmniRomExerciseId?.name
																					? item?.OmniRomExerciseId?.name
																					: item?.name,
																				description: item?.OmniRomExerciseId
																					?.description
																					? item?.OmniRomExerciseId?.description
																					: item?.description,
																			});
																			setVideoModalOpen(true);
																		}}>
																		<div className="libary-side-video-div image-wrapper">
																			{item?.OmniRomExerciseId?.image ? (
																				<img
																					src={
																						item?.OmniRomExerciseId?.image?.url
																					}
																					alt=""
																					className="img-css-side-video"
																				/>
																			) : (
																				<video
																					src={
																						item?.OmniRomExerciseId?.video?.url
																					}
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
																			{item?.OmniRomExerciseId?.name}
																		</Typography>
																		<Typography className="my-library-time-label">
																			{t('Patient.data.vitalscan-rom.transitionTime')}{' '}
																			: {item?.transitionTime || 3}
																		</Typography>
																		<Typography className="library-video-sub-label">
																			{item?.OmniRomExerciseId?.description
																				? item?.OmniRomExerciseId?.description
																				: item?.description}
																		</Typography>
																	</div>
																</Flex>
															</Card>
														);
													})}
												</Collapse.Panel>
											);
										},
									)}
								</Collapse>
							</Flex>
						</div>
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

export default SystemTemplate;

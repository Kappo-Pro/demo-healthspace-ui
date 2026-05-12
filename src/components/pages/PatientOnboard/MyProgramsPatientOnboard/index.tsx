import { useBlockNavigation } from '@atoms/BlockNavigation';
import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { useDebounce } from '@hooks/useDebounce';
import SelectedProgram from '@pages/PatientDashboard/SelectedProgram';
import { router } from '@routers/routers';
import { getUserById, saveState } from '@stores/activity/contacts/contacts';
import { INTAKE_STEPS, PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveTab,
	setProgramStateId,
	setStateId,
} from '@stores/shared/patientDetail/patientDetail';
import {
	selectExercise,
	selectProgram,
	setIsProgramPaused,
} from '@stores/shared/patientDetail/program';
import { ProgramItem, ProgramPatient } from '@types';
import { Button, Modal, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MyProgramUnavailableScreen from './MyProgramUnavailableScreen';
import './style.css';

const { Paragraph } = Typography;

export default function MyProgramsPatientOnboard(props: ProgramPatient) {
	const { programData, fetchHomeData, pagination } = props;
	const [activeImage, setActiveImage] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [arrowShow] = useState(false);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const navigate = useNavigate();
	const { clearNavigation } = useBlockNavigation();
	const dispatch = useTypedDispatch();
	const updatedUser = user?.isPhysioterapist ? selectedUser : user
	const isProgramPaused = useTypedSelector(
		state => state.patientDetail.program.isProgramPaused,
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isVirtualPt = planType === PLANS?.VIRTUALPT;
	const [suggestedProgramModal, setSuggestedProgramModal] = useState(false);
	const [selectedProgramModalData, setSelectedProgramModalData] =
		useState(null);
	useEffect(() => {
		fetchHomeData(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, selectedUser]);

	const handleNextPage = () => {
		pagination.pageCount != currentPage && setCurrentPage(prev => prev + 1);
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1);
		}
	};

	const handleOpenSuggestedProgram = item => {
		setSelectedProgramModalData({
			selectedProgram: item,
			domain: INTAKE_STEPS.SUGGESTED,
		});
		setSuggestedProgramModal(true);
	};

	const scrollLeft = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition - 400;
			scrollToPosition(targetPosition, 300);
		}
		if (scrollRef.current?.scrollLeft === 0) {
			handlePreviousPage();
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition + 400;
			scrollToPosition(targetPosition, 300);
		}
		if (
			scrollRef.current &&
			scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
				scrollRef.current.scrollWidth
		) {
			handleNextPage();
		}
	};

	const scrollToPosition = (targetPosition: number, duration: number) => {
		const startTime = performance.now();
		const start = scrollRef.current?.scrollLeft;
		const scroll = (timestamp: number) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			if (scrollRef.current && start !== undefined) {
				scrollRef.current.scrollLeft =
					start + (targetPosition - start) * progress;
			}
			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		};
		requestAnimationFrame(scroll);
	};

	const handleImageClick = (index: number) => {
		setActiveImage(index);
	};

	// EPIC-006-S2: Debounce action buttons to prevent double-tap submissions
	const handleViewHistoryCallback = async (item: { id: string }) => {
		const id = user?.isPhysioterapist ? selectedUser?.id : user?.id;
		clearNavigation();
		dispatch(
			saveState({
				activeTab: "Let's Move",
				userId: id,
			}),
		);
		navigate(`/${id}${router.AIASSISTANT_LIST_SESSIONS}`);
		dispatch(setActiveTab('listSessions'));
		await dispatch(getUserById(id));
		dispatch(setStateId(item?.id));
		dispatch(setProgramStateId(item?.id));
	};

	const startProgramSessionCallback = (item: ProgramItem) => {
		dispatch(selectProgram(item));
		dispatch(selectExercise(item?.exercises));
		clearNavigation();
		navigate(
			`/${user.isPhysioterapist ? selectedUser.id : user.id}${router.AIASSISTANT_PROGRAM_START}`,
		);
		dispatch(setActiveTab(''));
	};

	useEffect(() => {
		if (isVirtualPt) {
			if (updatedUser?.profile?.isWellnessCheck) {
				dispatch(setIsProgramPaused(true));
			}
		} else {
			dispatch(setIsProgramPaused(false));
		}
	}, [updatedUser]);

	const browseProgramsCallback = () => {
		const element = document.getElementById('suggested-programs');
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const {
		debouncedCallback: handleViewHistory,
		isDebouncing: isViewHistoryLoading,
	} = useDebounce(handleViewHistoryCallback, 300);
	const {
		debouncedCallback: startProgramSession,
		isDebouncing: isStartSessionLoading,
	} = useDebounce(startProgramSessionCallback, 300);
	const {
		debouncedCallback: browsePrograms,
		isDebouncing: isBrowseProgramsLoading,
	} = useDebounce(browseProgramsCallback, 300);

	return (
		<>
			<div
				className={`${programData?.length > 0 ? 'true-to-form-container' : 'program-main-container-without-data'}`}>
				<Typography
					className="program-inner-container-css"
					style={{ color: 'var(--text-color-root)' }}>
					<span>{t('patient.dashboard.new.myProgram')}</span>
					<span
						className="program-title-tips"
						style={{ color: 'var(--gray-800)' }}>
						{t('patient.dashboard.new.myProgramTips')}
					</span>
				</Typography>
				{programData?.length > 0 ? (
					<div className="image-navigation-container">
						<div
							className="horizontal-scroll-container horizontal-scroll-container-wrapper"
							ref={scrollRef}>
							{programData?.map((item: ProgramItem, index) => {
								return (
									<div
										key={index}
										className={`custom-image-container-form ${activeImage === index ? 'w-h-330' : 'w-h-300'}`}
										onMouseOver={() => !arrowShow && handleImageClick(index)}
										onMouseLeave={() => setActiveImage(null)}
										onClick={e => {
											e.stopPropagation();
											handleOpenSuggestedProgram(item);
										}}>
										<div className="image-wrapper-form">
											{item?.thumbnail || item?.exercises[0]?.image ? (
												<img
													src={
														item?.thumbnail
															? item?.thumbnail
															: item?.exercises[0] && item?.exercises[0]?.image
													}
													alt={item?.exercises[0]?.image}
													className="image-thumbnail-program saturate-image"
												/>
											) : (
												<video
													preload="metadata"
													src={item?.exercises[0]?.exerciseLibrary?.videoUrl}
													className="video-thumbnail-program saturate-image"
												/>
											)}
											<div className="overlay-content-css">
												<p
													className={`program-text-container-custom-class  ${activeImage === index ? 'mb-2' : ''}`}>
													{item?.name}
												</p>
												{activeImage != null && (
													<div className="hover-details extra-details-div">
														<Button
															icon={<UntitledIcon name="link" size={14} />}
															style={{ marginBottom: 10 }}
															loading={isViewHistoryLoading}
															onClick={e => {
																e.stopPropagation();
																handleViewHistory(item);
															}}>
															{t('patient.dashboard.new.viewHistory')}
														</Button>
													</div>
												)}
												<Button
													style={{ border: '0px' }}
													loading={isStartSessionLoading}
													onClick={e => {
														e.stopPropagation();
														startProgramSession(item);
													}}>
													{t('patient.progress.rehab.startSession')}
												</Button>
												<div className="hover-details">
													{item?.exercises && (
														<>
															<div className="exercise-count">
																{item?.exercises.length}{' '}
																{item?.exercises.length === 1
																	? t('Patient.data.newDashboard.exercise')
																	: t('Patient.data.newDashboard.exercises')}
															</div>
															<div className="exercise-count-duration">
																<UntitledIcon name="calendar" size={14} />{' '}
																{item?.duration}{' '}
																{item?.durationType
																	? (item?.duration ?? 0) > 1
																		? item.durationType
																				.charAt(0)
																				.toUpperCase() +
																			item.durationType.slice(1)
																		: item.durationType
																				.charAt(0)
																				.toUpperCase() +
																			item.durationType
																				.slice(1)
																				.replace(/s$/, '')
																	: ''}
															</div>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
						<div className="navigation-buttons" style={{ top: '40%' }}>
							{pagination?.totalCount > 4 && (
								<>
									<span
										className="nav-button left"
										onClick={scrollLeft}
										role="button"
										aria-label={t('Patient.data.onboard.previousSlide')}
										tabIndex={0}>
										<UntitledIcon
											name="leftOutlined"
											size={16}
											style={{ color: 'var(--stroke-default-white)' }}
										/>
									</span>
									<span
										className="nav-button right"
										onClick={scrollRight}
										role="button"
										aria-label={t('Patient.data.onboard.nextSlide')}
										tabIndex={0}>
										<UntitledIcon
											name="rightOutlined"
											size={16}
											style={{ color: 'var(--stroke-default-white)' }}
										/>
									</span>
								</>
							)}
						</div>
					</div>
				) : (
					<div
						style={{
							padding: 'var(--spacing-5)',
							borderRadius: 'var(--radius-xl)',
							backgroundColor: 'var(--sidebar-subnav-bg)',
						}}>
						<div className="empty-program-onboard-container-css">
							<img
								src="/images/dashboard/suggested-program-empty.svg"
								alt="program-empty"
							/>
							<div className="empty-program-inner-onboard-text-css empty-program-text">
								<Typography>
									{t('patient.dashboard.new.programEmptyTitle')}
								</Typography>
								<Typography>
									{t('patient.dashboard.new.programEmptyDescription')}
								</Typography>
							</div>
						</div>
					</div>
				)}
				{isProgramPaused && <MyProgramUnavailableScreen />}
				{suggestedProgramModal && (
					<Modal
						open={suggestedProgramModal}
						onCancel={() => setSuggestedProgramModal(false)}
						footer={null}
						width={MODAL_SIZES.XXLARGE}
						centered
						destroyOnHidden>
						<div style={{ padding: 'var(--spacing-4)' }}>
							<SelectedProgram state={{ state: selectedProgramModalData }} />
						</div>
					</Modal>
				)}
			</div>
		</>
	);
}

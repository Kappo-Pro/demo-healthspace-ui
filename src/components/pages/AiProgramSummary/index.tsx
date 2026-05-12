import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getExerciseByProgram,
	getProgramByIdList,
	getProgramSummaryList,
} from '@stores/shared/patientDetail/program';
import { IProgram, ProgramSummaryProps } from '@types';
import { Collapse, Empty, Flex, Pagination } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AiProgramSummaryContent from './AiProgramSummaryContent';
import { SessionExerciseChart } from './SessionExerciseChart';
import './style.css';

export default function AiProgramSummary(props: ProgramSummaryProps) {
	const { antIcon, CustomModalInfo } = props;
	const { t } = useTranslation();
	const perPage = useTypedSelector(
		state => state.patientDetail.patientDetail.perpage,
	);
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	const [programSummaryData, setProgramSummaryData] = useState([]);
	const [programSessionData, setProgramSessionData] = useState([]);
	const [exerciseProgramData, setExerciseProgramData] = useState([]);
	const [programTutorialVideo, setProgramuTutorialVideo] = useState('');
	const [programDescription, setProgramDescription] = useState('');
	const [exerciseTitle, setExerciseTitle] = useState<string | undefined>();
	const [rehabExerciseToPatientId, setRehabExerciseToPatientId] = useState<
		string | undefined
	>();
	const isSessionClicked = useTypedSelector(
		state => state.patientDetail.program.isSessionClicked,
	);

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPage, setTotalPage] = useState<number>(10);
	const [isLoading, setIsLoading] = useState(true);
	const [sessionLoading, setSessionLoading] = useState(true);
	const [programIdData, setProgramIdData] = useState('');
	const [currentCount, setCurrentCount] = useState<number>(1);
	const [totalCount, setTotalCount] = useState<number>(10);
	const [activePanelKey, setActivePanelKey] = useState<string | undefined>();

	const programStateId = useTypedSelector(
		state => state.patientDetail.patientDetail.programStateId,
	);
	const stateId = useTypedSelector(
		state => state.patientDetail.patientDetail.stateId,
	);

	// collapse toggle
	const handlePanelChange = (key: string | string[]) => {
		const newKey = Array.isArray(key) ? key[0] : key;

		if (newKey === activePanelKey) {
			setActivePanelKey(undefined);
			setProgramIdData('');
		} else {
			setActivePanelKey(newKey);
			setProgramIdData(newKey);
			setSessionLoading(true);
			fetchSessionData(newKey, 1);
		}
	};

	// fetch summary list
	const fetchData = useCallback(
		async (page: number) => {
			setIsLoading(true);
			try {
				const payload = {
					userId: user.isPhysioterapist ? selectedUser.id : user.id,
					limit: perPage === 0 ? 10 : perPage,
					page: page,
					sessions: true,
				};
				const response = await dispatch(getProgramSummaryList(payload));

				if (response?.payload) {
					setProgramSummaryData(response.payload.data || []);
					setCurrentPage(response.payload.pagination?.currentPage || 0);
					setTotalPage(response.payload.pagination?.totalCount || 0);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[selectedUser, user, perPage, dispatch],
	);

	useEffect(() => {
		fetchData(1);
	}, [fetchData]);

	const [activeInnerKey, setActiveInnerKey] = useState<string | undefined>();

	// Auto-expand collapse based on stateId
	useEffect(() => {
		if (stateId && programSummaryData.length > 0) {
			const matchingProgram = programSummaryData.find(
				(program: IProgram) => program.id === stateId,
			);

			if (matchingProgram) {
				setActivePanelKey(stateId);
				setProgramIdData(stateId);
				setSessionLoading(true);
				fetchSessionData(stateId, 1);
			}
		}
	}, [stateId, programSummaryData]);

	// Auto-open first inner collapse when Auto-expand collapse based on stateId is done
	useEffect(() => {
		if (
			programIdData &&
			programSessionData.length > 0 &&
			!rehabExerciseToPatientId
		) {
			const firstSession = programSessionData[0];
			if (firstSession?.id) {
				setRehabExerciseToPatientId(firstSession.id);
				setActiveInnerKey(firstSession.id);
			}
		}
	}, [stateId, programIdData, programSessionData, rehabExerciseToPatientId]);

	const onPageChange = (page: number) => {
		setCurrentPage(page);
		fetchData(page);
	};

	const fetchProgramByIdList = async (programId: string, page: number) => {
		const payload = { programId, limit: 10, page };
		const res = await dispatch(getProgramByIdList(payload));
		setProgramSessionData(res?.payload?.data || []);
		setCurrentCount(res?.payload?.pagination?.currentPage || 0);
		setTotalCount(res?.payload?.pagination?.totalCount || 0);
	};

	const fetchSessionData = useCallback(
		async (programId: string, page: number) => {
			setSessionLoading(true);
			const payload = {
				programId,
				limit: perPage === 0 ? 10 : perPage,
				page,
			};
			if (programId) {
				const res = await dispatch(getProgramByIdList(payload));
				setProgramSessionData(res?.payload?.data);
				setCurrentCount(res?.payload?.pagination?.currentPage || 0);
				setTotalCount(res?.payload?.pagination?.totalCount || 0);
			}
			setSessionLoading(false);
		},
		[dispatch, perPage],
	);

	const fetchProgramSessionData = useCallback(
		async (programId: string, page: number, exerciseId: string) => {
			const payload = {
				programId,
				exerciseId,
				limit: perPage === 0 ? 10 : perPage,
				page,
			};
			const res = await dispatch(getExerciseByProgram(payload));
			setExerciseProgramData(res?.payload?.data);
			setIsLoading(false);
		},
		[dispatch, perPage],
	);

	useEffect(() => {
		if (programIdData && rehabExerciseToPatientId) {
			fetchProgramSessionData(programIdData, 1, rehabExerciseToPatientId);
		}
	}, [programIdData, rehabExerciseToPatientId, fetchProgramSessionData]);

	const pageHandle = (page: number) => {
		setCurrentCount(page);
		fetchSessionData(programIdData, page);
	};

	return (
		<div className="ai-program-summary">
			{isLoading ? (
				<Flex
					align="center"
					justify="center"
					style={{ padding: 'var(--spacing-2)' }}>
					<ActivityFeedSkeleton />
				</Flex>
			) : (
				<>
					{programSummaryData.length === 0 ? (
						<Empty
							description={t(
								'Admin.data.managePatient.rehab.captures.noCapturesFound',
							)}
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					) : (
						<>
							{!isSessionClicked && (
								<div className="collapse-wrapper">
									{programSummaryData.map((item: IProgram) => (
										<Collapse
											key={item.id}
											bordered={false}
											className="select-none posture-collapse"
											style={{
												marginTop: 'var(--spacing-2)',
												marginBottom: 'var(--spacing-2)',
											}}
											activeKey={activePanelKey === item.id ? [item.id] : []}
											onChange={keys => handlePanelChange(keys)}>
											<Collapse.Panel
												className="header-panel bg-gray-50 !border !border-gray-200 !rounded-lg"
												style={{ padding: 'var(--spacing-2)' }}
												key={item.id}
												header={item.name}>
												{sessionLoading && activePanelKey === item.id ? (
													<Flex
														align="center"
														justify="center"
														style={{ padding: 'var(--spacing-2)' }}>
														<ActivityFeedSkeleton />
													</Flex>
												) : (
													<AiProgramSummaryContent
													activeInnerKey={activeInnerKey!}
													setActiveInnerKey={setActiveInnerKey!}
														fetchProgramByIdList={fetchProgramByIdList}
														currentCount={currentCount}
														programIdData={programIdData}
														programSessionData={programSessionData}
														isLoading={sessionLoading}
														antIcon={antIcon}
														CustomModalInfo={CustomModalInfo}
														setRehabExerciseToPatientId={
															setRehabExerciseToPatientId
														}
														setProgramuTutorialVideo={setProgramuTutorialVideo}
														setProgramDescription={setProgramDescription}
														setExerciseTitle={setExerciseTitle}
													/>
												)}

												{totalCount > 9 && !perPage && (
													<Pagination
														current={currentCount}
														onChange={pageHandle}
														total={totalCount}
														showSizeChanger={false}
													/>
												)}
											</Collapse.Panel>
										</Collapse>
									))}
								</div>
							)}

							{isSessionClicked &&
								exerciseTitle &&
								programDescription &&
								programTutorialVideo && (
									<SessionExerciseChart
										exerciseTitle={exerciseTitle}
										programDescription={programDescription}
										programTutorialVideo={programTutorialVideo}
										perPage={perPage}
										exerciseProgramData={exerciseProgramData}
									/>
								)}

							{totalPage > 1 && !perPage && !isSessionClicked && (
								<Pagination
									current={currentPage}
									onChange={onPageChange}
									total={totalPage}
								/>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}

import { ExerciseDataItem } from '@atoms/ExerciseDataItem';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { CreateProgramModal } from '@organisms/CreateProgramModal';
import { PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setProgramModal } from '@stores/shared/patientDetail/patientDetail';
import {
	getProgramList,
	getProgramTemplate,
} from '@stores/shared/patientDetail/program';
import { IProgramData } from '@types';
import { Empty, Flex, Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './style.css';

export const Programs = () => {
	const { t } = useTranslation();
	const [openProgramModal, setOpenProgramModal] = useState(false);
	const [searchValue, setSearchValue] = useState<string>('');
	const [isLoading, setLoading] = useState<boolean>(true);
	const [session, setSession] = useState<boolean>();
	const [refresh, setRefresh] = useState(false);
	const program = useTypedSelector(
		state => state.patientDetail.program.program,
	);
	const [programData, setProgramData] = useState<IProgramData[]>(
		program?.data || [],
	);
	const dispatch = useTypedDispatch();
	const { state } = useLocation();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { programModal } = useTypedSelector(
		state => state.patientDetail.patientDetail,
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isScreeningOrIntervention =
		planType === PLANS.SCREENING || planType === PLANS.EARLYINTERVENTION;

		const location = useLocation();
	const isGenerateProgramRoute =
		location.pathname.includes('/program/generate');

	useEffect(() => {
		setOpenProgramModal(isGenerateProgramRoute);
	}, [isGenerateProgramRoute]);

	useEffect(() => setProgramData(program?.data || []), [program, refresh]);

	useEffect(() => {
		fetchHomeData(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, selectedUser, refresh]);

	const fetchHomeData = async (pageNumber: number) => {
		setLoading(true)
		const payload = {
			userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
			limit: 10,
			page: pageNumber,
			searchValue: searchValue,
		};
		await dispatch(getProgramList(payload)).then(() => setLoading(false));
	};

	const fetchData = (pageNumber: number) => {
		const payload = {
			limit: 10,
			page: pageNumber,
			searchValue: searchValue,
		};
		dispatch(getProgramTemplate(payload)).then(() => setLoading(false));
	};

	return (
		<div>
			{user.isPhysioterapist &&
				isGenerateProgramRoute && (
					<Flex
						justify="center"
						align="center"
						className="create-upload-button"
						onClick={() => setOpenProgramModal(true)}>
						{t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.createProgram',
						)}
					</Flex>
				)}
			<CreateProgramModal
				isVisible={openProgramModal}
				onCancel={() => {
					setOpenProgramModal(false);
					dispatch(setProgramModal(false));
				}}
				fetchData={fetchData}
				refresh={refresh}
				setRefresh={setRefresh}
				setSearchValue={setSearchValue}
				searchValue={searchValue}
			/>
			{isLoading ? (
				<Flex justify="center" align="center" className="p-2">
					<ActivityFeedSkeleton />
				</Flex>
			) : (
				<>
					{program.data?.length == 0 ? (
						<Empty
							className="bg-gray-50 p-10 m-0"
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description={
								<span className="text-gray-300">
									{t('Patient.data.vitalscan-rom.noProgramsFound')}
								</span>
							}
						/>
					) : (
						<div className="collapse-wrapper">
							{programData?.map((program, index) => (
								<ExerciseDataItem
									index={index}
									isLoading={isLoading}
									setLoading={setLoading}
									refresh={refresh}
									program={program}
									programExercises={program?.exercises}
									setRefresh={setRefresh}
									session={session ?? false}
									setSession={setSession}
								/>
							))}
						</div>
					)}
					{program?.data?.length != 0 && (
						<div>
							<Pagination
								current={program?.pagination?.currentPage}
								showSizeChanger={false}
								onChange={fetchHomeData}
								total={program?.pagination?.totalCount}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
};

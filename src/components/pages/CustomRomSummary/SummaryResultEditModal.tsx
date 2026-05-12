import { PictureOutlined } from '@ant-design/icons';
import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { InfoCircle } from '@vitalflow-icons/general/infoCircle';
import { useAuthenticatedImage } from '@hooks/useAuthenticatedImage';
import { evalScore } from '@pages/CustomRomScanResult/jointsTemplateData';
import {
	getProgramByID,
	getRomActivityStreamById,
	resetAll,
	selectExercise,
	setSession,
	updateSessionTitle,
} from '@stores/clinical/rom/main';
import { setSelectedRom } from '@stores/clinical/rom/customRom';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRomSession, RomPatientResult } from '@types';
import {
	Button,
	Checkbox,
	Flex,
	Input,
	Modal,
	Popover,
	Table,
	message,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Build full image URL from relative or absolute path
 * Screenshots can be:
 * 1. Base64 data URLs (start with "data:image") - use as-is
 * 2. Full URLs (start with "http") - use as-is
 * 3. Relative paths from API (e.g., "rom/xxx.png") - prepend base URL
 */
const getScreenshotUrl = (screenshot?: string): string => {
	if (!screenshot) return '';
	// Already a data URL or full URL
	if (screenshot.startsWith('data:') || screenshot.startsWith('http')) {
		return screenshot;
	}
	// Relative path - prepend base URL
	const baseUrl = process.env.REACT_APP_ADMIN_HOST || '';
	return `${baseUrl}${screenshot.startsWith('/') ? '' : '/'}${screenshot}`;
};

interface SendResultByEditModalProps {
	modalOpen: boolean;
	setModalOpen: (val: boolean) => void;
	closable: boolean;
	selectedRom: CustomRomSession;
	completedStatus: boolean;
	fetchSessionData?:
	| ((sessionId: string, page: number, completed: boolean) => void)
	| ((sessionId: string) => void);
}

export const SummaryResultEditModal = (props: SendResultByEditModalProps) => {
	const {
		completedStatus,
		modalOpen,
		setModalOpen,
		closable,
		selectedRom,
		fetchSessionData,
	} = props;
	const user = useTypedSelector(state => state.user);
	const navigate = useNavigate();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { t } = useTranslation();
	const [sectionName, setSectionName] = useState<string>();
	const [sessionData, setSessionData] = useState<{
		exercises?: { id: string }[];
		id?: string;
	}>({ exercises: [], id: '' });
	const [resultsList, setResultsList] = useState<RomPatientResult[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const dispatch = useTypedDispatch();
	const [missingExercisesLength, setMissingExercisesLength] = useState(0);
	const [isUpdating, setIsUpdating] = useState<boolean>(false);
	const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const savedRom = useTypedSelector(state => state.rom.customRom.selectedRom);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		const data = await dispatch(getRomActivityStreamById({ romId: selectedRom.id }));
		await dispatch(setSelectedRom(data?.payload));
	};

	// Fetch authenticated image for preview modal
	const {
		blobUrl: authenticatedImageUrl,
		loading: imageLoading,
		error: imageError,
	} = useAuthenticatedImage(selectedImageUrl);

	useEffect(() => {
		const fetchData = async (id: string) => {
			const data = await dispatch(getProgramByID(id));
			const programData = (
				data.payload as {
					data: {
						exercises?: {
							id: string;
							name?: string;
							normal: number;
							wfl: number;
							strapiOmniRomExercise?: { name?: string };
							exerciseLibrary?: { title?: string };
						}[];
						id?: string;
					};
				}
			).data;

			setSessionData(programData);

			// Create a map of exercise IDs to full exercise objects WITH NAMES from API
			const apiExerciseMap = new Map();
			(programData.exercises ?? []).forEach(ex => {
				apiExerciseMap.set(ex.id, ex);
			});

			// Get all results and merge with API exercise data to add names
			const initialResults =
				savedRom?.romPatientResults
					?.flatMap(r =>
						(r?.results ?? []).map(result => {
							const apiExercise = apiExerciseMap.get(
								result.romProgramExercise?.id,
							);
							const scoreValue = evalScore(result);
							return {
								...result,
								screenshot: getScreenshotUrl(r.screenshot),
								score: Math.ceil(Number(scoreValue) || 0),
								romProgramExercise: apiExercise || result.romProgramExercise,
							};
						}),
					)
					?.sort((a, b) => b.score - a.score) || [];

			const existingExerciseIds = new Set(
				initialResults.map(r => r.romProgramExerciseId),
			);

			// For missing exercises, use API exercise data directly
			const missingExercises = (programData.exercises ?? [])
				.filter(ex => !existingExerciseIds.has(ex.id))
				.map(ex => ({
					romProgramExerciseId: ex.id,
					normal: ex.normal,
					wfl: ex.wfl,
					value: -1,
					ranking: 0,
					romProgramExercise: ex,
					score: 0,
					screenshot: '/images/empty-image.png',
				}));
			!completedStatus &&
				setSelectedRowKeys(
					missingExercises.map(item => item.romProgramExerciseId),
				);
			setResultsList([...initialResults, ...missingExercises]);
			setMissingExercisesLength(missingExercises.length);
			setSectionName(savedRom?.title || '');
		};

		if (savedRom?.romProgramId) {
			fetchData(savedRom.romProgramId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedRom]); // completedStatus and dispatch are stable

	const getColorForScore = (score: number) => {
		if (score >= 90) return 'var(--color-success-600)';
		if (score >= 75 && score <= 89) return 'var(--color-success-400)';
		if (score >= 60 && score <= 74) return 'var(--color-warning-600)';
		if (score >= 40 && score <= 59) return 'var(--color-warning-500)';
		if (score >= 20 && score <= 39) return 'var(--color-error-500)';
		return 'var(--color-error-600)';
	};

	const onSelectAllChange = useCallback(
		(checked: boolean) => {
			if (checked) {
				const selectableIds = resultsList
					.filter(item =>
						sessionData?.exercises?.some(
							ex => ex.id === item.romProgramExercise.id,
						),
					)
					.map(item => item.romProgramExercise.id);

				setSelectedRowKeys([...new Set(selectableIds)]);
			} else {
				setSelectedRowKeys([]);
			}
		},
		[resultsList, sessionData?.exercises],
	);

	const handleCheckboxChange = useCallback((id: string) => {
		setSelectedRowKeys(prev =>
			prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id],
		);
	}, []);

	const columns = useMemo(
		() => [
			{
				title: '',
				key: 'image',
				align: 'center' as const,
				render: (record: RomPatientResult) =>
					record?.screenshot ? (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								cursor: 'pointer',
							}}
							onClick={e => {
								e.stopPropagation();
								setSelectedImageUrl(record.screenshot);
								setImagePreviewOpen(true);
							}}>
							<UntitledIcon
								name="camera"
								size={22}
								color="var(--text-secondary)"
							/>
						</div>
					) : (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<UntitledIcon
								name="camera"
								size={22}
								color="var(--text-tertiary)"
								style={{ cursor: 'not-allowed' }}
							/>
						</div>
					),
			},
			{
				title: t('Admin.data.retryScreen.measure'),
				key: 'title',
				render: (record: RomPatientResult) => {
					const name =
						record?.romProgramExercise?.name ||
						record?.romProgramExercise?.strapiOmniRomExercise?.name ||
						record?.romProgramExercise?.exerciseLibrary?.title ||
						'-';
					return name;
				},
			},

			{
				title: (
					<Popover
						content={t('Patient.data.vitalscan-rom.normalInfo')}
						title={t('Patient.data.vitalscan-rom.normal')}>
						<Flex align="space-between" gap="small" justify="center">
							<span>{t('Patient.data.vitalscan-rom.normal')}</span>
							<span className="cursor-pointer">
								<InfoCircle width={16} height={16} color="stroke-gray-500" />
							</span>
						</Flex>
					</Popover>
				),
				key: 'normal',
				align: 'center' as const,
				render: (record: RomPatientResult) => {
					const value = record.normal as
						| number
						| { left?: number; right?: number }
						| undefined;
					if (typeof value === 'object' && value !== null) {
						return (
							<div style={{ textAlign: 'center' }}>
								<div>
									Left:{' '}
									{value.left !== undefined ? Math.round(value.left) : '-'}
								</div>
								<div>
									Right:{' '}
									{value.right !== undefined ? Math.round(value.right) : '-'}
								</div>
							</div>
						);
					}
					return value !== undefined ? Math.round(value) : '-';
				},
			},
			{
				title: (
					<Popover
						content={t('Patient.data.vitalscan-rom.wflInfo')}
						title={t('Patient.data.vitalscan-rom.wfl')}>
						<Flex align="space-between" gap="small" justify="center">
							<span>{t('Patient.data.vitalscan-rom.wfl')}</span>
							<span className="cursor-pointer">
								<InfoCircle width={16} height={16} color="stroke-gray-500" />
							</span>
						</Flex>
					</Popover>
				),
				key: 'wfl',
				align: 'center' as const,
				render: (record: RomPatientResult) => {
					const value = record.wfl as
						| number
						| { left?: number; right?: number }
						| undefined;
					if (typeof value === 'object' && value !== null) {
						return (
							<div style={{ textAlign: 'center' }}>
								<div>
									Left:{' '}
									{value.left !== undefined ? Math.round(value.left) : '-'}
								</div>
								<div>
									Right:{' '}
									{value.right !== undefined ? Math.round(value.right) : '-'}
								</div>
							</div>
						);
					}
					return value !== undefined ? Math.round(value) : '-';
				},
			},
			{
				title: t('Admin.data.retryScreen.value'),
				dataIndex: 'value',
				render: (value: number, record: RomPatientResult) => {
					const scoreValue = evalScore(record);
					return (
						<span
							style={{
								color: getColorForScore(Number(scoreValue) || 0),
								fontWeight: 'bold',
							}}>
							{typeof value === 'object' && value !== null ? (
								<div style={{ textAlign: 'center' }}>
									<div>
										Left:{' '}
										{(value as { left?: number; right?: number }).left !==
											undefined
											? Math.round(
												(value as { left?: number; right?: number }).left!,
											)
											: '-'}
									</div>
									<div>
										Right:{' '}
										{(value as { left?: number; right?: number }).right !==
											undefined
											? Math.round(
												(value as { left?: number; right?: number }).right!,
											)
											: '-'}
									</div>
								</div>
							) : value === -1 ? (
								0
							) : (
								Math.round(value as number)
							)}
						</span>
					);
				},
				align: 'center' as const,
			},
			...(completedStatus || missingExercisesLength == 0
				? [
					{
						title: (
							<Checkbox
								onChange={e => onSelectAllChange(e.target.checked)}
								className="report-checkbox"
								checked={
									selectedRowKeys.length > 0 &&
									selectedRowKeys.length ===
									resultsList.filter(item =>
										sessionData?.exercises?.some(
											ex => ex.id === item.romProgramExercise.id,
										),
									).length
								}
								indeterminate={
									selectedRowKeys.length > 0 &&
									selectedRowKeys.length <
									resultsList.filter(item =>
										sessionData?.exercises?.some(
											ex => ex.id === item.romProgramExercise.id,
										),
									).length
								}
							/>
						),
						dataIndex: 'select',
						render: (_: string, record: RomPatientResult) => (
							<Checkbox
								checked={selectedRowKeys.includes(
									record.romProgramExercise.id,
								)}
								onChange={() =>
									handleCheckboxChange(record.romProgramExercise.id)
								}
								className="report-checkbox"
								disabled={
									!sessionData?.exercises?.some(
										ex => ex.id === record.romProgramExercise.id,
									)
								}
							/>
						),
						align: 'center' as const,
					},
				]
				: []),
		],
		[
			completedStatus,
			missingExercisesLength,
			onSelectAllChange,
			resultsList,
			sessionData?.exercises,
			selectedRowKeys,
			handleCheckboxChange,
			t,
		],
	);

	const handleUpdateTitle = async () => {
		setIsUpdating(true);
		const payload = {
			id: selectedRom?.id,
			payload: {
				title: sectionName,
				userId: selectedRom?.userId,
				romProgramId: selectedRom?.romProgramId,
				strapiOmniRomProgramId: selectedRom?.strapiOmniRomProgramId,
			},
		};
		await dispatch(updateSessionTitle(payload));
		message.success(t('Admin.data.retryScreen.editedSuccess'));
		const isScanResult = window.location.pathname.includes('/scan-result');
		if (fetchSessionData) {
			if (isScanResult) {
				(fetchSessionData as (sessionId: string) => void)(selectedRom?.id);
			} else {
				(
					fetchSessionData as (
						sessionId: string,
						page: number,
						completed: boolean,
					) => void
				)(sessionData?.id || '', 1, completedStatus);
			}
		}
		setIsUpdating(false);
	};

	return (
		<>
			<Modal
				open={modalOpen}
				centered
				footer={null}
				destroyOnHidden
				closable={closable}
				maskClosable={false}
				width={MODAL_SIZES.LARGE}
				className="select-none"
				onCancel={() => setModalOpen(false)}
				title={
					<h2 style={{ textAlign: 'center', margin: 0 }}>
						{t('Admin.data.retryScreen.selectTitle')}
					</h2>
				}>
				<p className="text-center">
					{t('Admin.data.retryScreen.descr1')} <br />{' '}
					{t('Admin.data.retryScreen.descr2')}
				</p>
				<Flex align="center" gap={10}>
					<Input
						placeholder={t('Admin.data.retryScreen.addName')}
						value={sectionName}
						onChange={e => setSectionName(e.target.value)}
					/>
					<Button
						type="primary"
						loading={isUpdating}
						onClick={() => {
							handleUpdateTitle();
						}}
						disabled={!sectionName?.trim()}>
						{t('Admin.data.survey.save')}
					</Button>
				</Flex>
				{resultsList?.length >= 1 ? (
					<div style={{ marginTop: 'var(--spacing-4)' }}>
						<Table
							bordered
							size="small"
							dataSource={resultsList}
							columns={columns}
							pagination={false}
							rowClassName={(record: RomPatientResult) =>
								typeof record.value === 'number' && record.value === -1
									? 'bg-gray-300'
									: ''
							}
						/>
						<Flex
							gap={10}
							justify="center"
							align="center"
							style={{ marginTop: 'var(--spacing-4)' }}>
							<Button
								type="primary"
								onClick={() => {
									dispatch(resetAll());
									const selectedExercises = sessionData?.exercises?.filter(
										(item: { id: string }) => selectedRowKeys.includes(item.id),
									);
									dispatch(selectExercise(selectedExercises));
									dispatch(
										setSession({
											session: selectedRom,
											exercises: selectedExercises,
										}),
									);
									// Close this modal
									setModalOpen(false);
									// Navigate to ROM scan page with userId
									const userId = user?.isPhysioterapist
										? selectedUser?.id
										: user?.id;
									navigate(`/${userId}/rom/scan`, {
										state: {
											isEdit: true,
											sessionId: selectedRom?.id,
											skipSplash: true,
										},
									});
								}}
								className="shadow-none"
								disabled={selectedRowKeys.length === 0}>
								{completedStatus || missingExercisesLength == 0 ? (
									<>{t('Admin.data.retryScreen.scanSelected')}</>
								) : (
									<>{t('Admin.data.retryScreen.pendingScans')}</>
								)}
								{selectedRowKeys.length > 0 && (
									<span>({selectedRowKeys.length})</span>
								)}
							</Button>
							<Button
								type="default"
								onClick={() => setModalOpen(false)}
								className="shadow-none">
								{t('Admin.data.retryScreen.cancel')}
							</Button>
						</Flex>
					</div>
				) : (
					<ModalContentSkeleton />
				)}
			</Modal>

			{/* Image Preview Modal */}
			<Modal
				open={imagePreviewOpen}
				onCancel={() => {
					setImagePreviewOpen(false);
					setSelectedImageUrl(null);
				}}
				footer={null}
				centered
				width="auto"
				styles={{
					body: {
						padding: 0,
						maxHeight: '80vh',
						overflow: 'auto',
					},
				}}>
				{imageLoading ? (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: '200px',
							color: 'var(--text-secondary)',
						}}>
						Loading image...
					</div>
				) : imageError ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: '200px',
							color: 'var(--text-secondary)',
						}}>
						<PictureOutlined
							style={{
								fontSize: 64,
								color: 'var(--error-500)',
								marginBottom: 16,
							}}
						/>
						<div style={{ fontSize: 18, marginBottom: 8 }}>
							Failed to load image
						</div>
						<div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
							{imageError}
						</div>
					</div>
				) : authenticatedImageUrl ? (
					<img
						src={authenticatedImageUrl}
						alt="Screenshot preview"
						style={{
							width: '100%',
							height: 'auto',
							display: 'block',
						}}
					/>
				) : null}
			</Modal>
		</>
	);
};

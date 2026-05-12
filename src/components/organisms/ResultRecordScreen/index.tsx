import {
	resetAll,
	setIsOmniRomRecordModal,
	setOmniromRecord,
	setOmniromUpload,
} from '@stores/clinical/rehab/main';
import { getMyLibraryList } from '@stores/clinical/rom/romTemplates';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Button, Flex, Space, Typography } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useTranslation } from 'react-i18next';
import './style.css';

function ResultRecordScreen() {
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const { isOmniRomRecord, isOmniRomUpload } = useTypedSelector(
		state => state.rehab.main,
	);
	const id = useTypedSelector(state => state.user.id);

	const fetchData = async (page: number) => {
		const payload = {
			userId: id,
			search: '',
			page: page,
		};
		await dispatch(getMyLibraryList(payload));
	};

	const handleReturnAdmin = async () => {
		dispatch(setIsOmniRomRecordModal(false));
		dispatch(resetAll());
		fetchData(1);
	};

	const handleRecordNew = () => {
		dispatch(resetAll());
		dispatch(setOmniromRecord(true));
		dispatch(setOmniromUpload(false));
		dispatch(setIsOmniRomRecordModal(true));
	};

	const handleUploadNew = () => {
		dispatch(resetAll());
		dispatch(setOmniromUpload(true));
		dispatch(setOmniromRecord(false));
		dispatch(setIsOmniRomRecordModal(true));
	};

	return (
		<Content className="result-record-screen">
			<Flex align="center" justify="center" className="h-full">
				<div>
					<Typography.Title level={3}>
						{t('Admin.data.rehab.addExercise.whatWouldYouLikeToDo')}
					</Typography.Title>
					<Space>
						<Button onClick={handleReturnAdmin}>
							{t('Admin.data.rehab.addExercise.returnToAdminConsole')}
						</Button>
						<Button onClick={handleRecordNew}>
							{t('Admin.data.rehab.addExercise.recordAnotherExercise')}
						</Button>
						{(isOmniRomRecord || isOmniRomUpload) && (
							<Button onClick={handleUploadNew}>
								{t('Admin.data.rehab.addExercise.uploadNewExercise')}
							</Button>
						)}
					</Space>
				</div>
			</Flex>
		</Content>
	);
}
export default ResultRecordScreen;

import { UntitledIcon } from '@atoms/Icon';
import { clearReports } from '@stores/content/report/reports';
import { useTypedDispatch } from '@stores/index';
import { setIsReportModal } from '@stores/shared/patientDetail/patientDetail';
import { AddButtonItemsProps } from '@types';
import { Button, Popover } from 'antd';
import { useTranslation } from 'react-i18next';

interface IAddmoreResults {
	setActiveComponent: (value: AddButtonItemsProps) => void;
	setIsVisible: (val: boolean) => void;
}

export default function AddMoreResults(props: IAddmoreResults) {
	const { setActiveComponent, setIsVisible } = props;
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();

	const handleClick = (item: AddButtonItemsProps) => {
		setIsVisible(true);
		setActiveComponent(item);
		dispatch(setIsReportModal(true));
		dispatch(clearReports());
	};

	const addButtonItems: AddButtonItemsProps[] = [
		{
			key: 'listEvaluation',
			label: t('Admin.data.addNotes.listEvaluation'),
			icon: <UntitledIcon name="fileShield" size={15} />,
		},
		{
			key: 'romSummary',
			label: t('Admin.data.addNotes.romSummary'),
			icon: <UntitledIcon name="image" size={15} />,
		},
		// {
		//   key: 'captures',
		//   label: t("Admin.data.addNotes.captures"),
		//   icon: <Image01 width={15} height={15} color="stroke-gray-600"/>
		// },
		{
			key: 'postureSummary',
			label: t('Patient.data.postures.postureSummary'),
			icon: <UntitledIcon name="image" size={15} />,
		},
		{
			key: 'listSessions',
			label: t('Admin.data.addNotes.listSessions'),
			icon: <UntitledIcon name="playSquare" size={15} />,
		},
		{
			key: 'surveySummary',
			label: t('Admin.data.addNotes.surveySummary'),
			icon: <UntitledIcon name="list" size={15} />,
		},
	];

	return (
		<div className="add-more-results-container">
			<Popover
				placement="bottomRight"
				content={
					<div>
						{addButtonItems.map((item: AddButtonItemsProps) => {
							return (
								<div
									className="add-button-css"
									onClick={() => handleClick(item)}>
									<span style={{ marginTop: 'var(--spacing-1)' }}>
										{item.icon}
									</span>
									<span className="add-button-label">{item.label}</span>
								</div>
							);
						})}
					</div>
				}>
				<Button>
					{t('Admin.data.addNotes.add')}
					<UntitledIcon name="plus" />
				</Button>
			</Popover>
		</div>
	);
}

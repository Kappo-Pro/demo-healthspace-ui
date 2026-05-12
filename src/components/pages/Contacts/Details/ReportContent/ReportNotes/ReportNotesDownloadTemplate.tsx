import { ReportNotes } from '@types';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

interface IReportNotesTemplate {
	isEditMode: boolean;
	index: number;
	note: ReportNotes;
}

const ReportNotesDownloadTemplate = (props: IReportNotesTemplate) => {
	const { isEditMode, index, note } = props;
	const { t } = useTranslation();
	return (
		<>
			<p className="font-semibold text-gray-600 mt-3">
				{t('Admin.data.addToReports.dateLabel')}{' '}
				<span className="font-regular">
					{moment(note?.createdAt).local().format('LLL')}
				</span>
			</p>
			<ul
				contentEditable={isEditMode}
				style={{ backgroundColor: 'var(--color-gray-50)' }}>
				<div key={index}>
					<li
						key={index}
						style={{ listStyle: 'none', padding: 'var(--spacing-2)' }}>
						<p>
							<a href={note?.image} target="_blank">
								{note?.image}
							</a>
						</p>
						<p>
							<a href={note?.video} target="_blank">
								{note?.video}
							</a>
						</p>
						<p>{note?.notes}</p>
					</li>
				</div>
			</ul>
		</>
	);
};

export default ReportNotesDownloadTemplate;

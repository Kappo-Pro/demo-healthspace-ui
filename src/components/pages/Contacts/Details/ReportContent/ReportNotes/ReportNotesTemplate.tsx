import { UntitledIcon } from '@atoms/Icon';
import { ReportNotes } from '@types';
import { Col, Flex, Image } from 'antd';
import moment from 'moment';

import { useTranslation } from 'react-i18next';

interface IReportNotesTemplate {
	isEditMode: boolean;
	index: number;
	note: ReportNotes;
}
const ReportNotesTemplate = (props: IReportNotesTemplate) => {
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
				<div>
					<li
						key={index}
						style={{ listStyle: 'none', padding: 'var(--spacing-2)' }}>
						{!note?.image && !note?.video ? (
							<Flex gap={16} align="center">
								<Col span={24}>
									<span
										className="font-regular custom-padding"
										style={{ color: 'var(--evaluation-title-color)' }}>
										{note.notes}
									</span>
								</Col>
							</Flex>
						) : (
							<div key={index} className="custom-padding">
								{note?.image && (
									<Flex gap={16} align="center">
										<Col span={6}>
											<Image
												src={note?.image}
												className="custom-image"
												height={140}
												preview={{
													src: note?.image,
													mask: <UntitledIcon name="eye" size={18} />,
												}}
											/>
										</Col>
										<Col span={18} className="popup-message-head">
											<p
												className="popup-message"
												style={{ color: 'var(--evaluation-title-color)' }}>
												{note?.notes}
											</p>
										</Col>
									</Flex>
								)}
								{note?.video && (
									<Flex gap={16} align="center">
										<Col span={6}>
											<video
												src={note?.video}
												controls
												className="custom-image"
												preload="metadata"
												width={250}
												height={140}
											/>
										</Col>
										<Col span={18} className="popup-message-head">
											<p
												className="popup-message"
												style={{ color: 'var(--evaluation-title-color)' }}>
												{note?.notes}
											</p>
										</Col>
									</Flex>
								)}
							</div>
						)}
					</li>
				</div>
			</ul>
		</>
	);
};

export default ReportNotesTemplate;

import { UntitledIcon } from '@atoms/Icon';
import { CustomModalProps } from '@types';
import { Modal, Typography, Flex } from 'antd';
import { ReactNode } from 'react';
import {_useTranslation } from 'react-i18next';
import { AddToReports } from '@atoms/AddToReports';
import AiProgramSummary from '@pages/AiProgramSummary';
import { useTypedSelector } from '@stores/index';

const antIcon: ReactNode = (
	<UntitledIcon
		name="loading"
		size={52}
		style={{ color: 'var(--brand-primary)' }}
	/>
);

export const LetsMoveSessions = () => {
	const isReportModal = useTypedSelector(
		state => state.patientDetail.patientDetail.isReportModal,
	);

	const CustomModalInfo = (props: CustomModalProps) => {
		const { name, description, video } = props;

		const modalContent = (
			<div
				className="select-none"
				style={{ textAlign: 'center', marginTop: '10%' }}>
				<video
					controls
					className="video"
					preload="metadata"
					src={video}
					type="video/mp4"
					width="100%"
					height="100%"
				/>
				<div className="select-none mt-6">
					<Typography.Title level={5}>{name}</Typography.Title>
					<Typography.Text>{description}</Typography.Text>
				</div>
			</div>
		);
		Modal.info({
			title: null,
			content: modalContent,
			maskClosable: true,
			icon: null,
			okButtonProps: { style: { display: 'none' } },
			closable: true,
		});
	};

	return (
		<div className={'pl-5 pr-5'}>
			<div>
				{isReportModal ? null : (
					<Flex justify="flex-end" gap={2} className="mt-1">
						<AddToReports />
					</Flex>
				)}
			</div>
			<AiProgramSummary antIcon={antIcon} CustomModalInfo={CustomModalInfo} />
		</div>
	);
};

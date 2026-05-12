import { IPosture, PostureAnalyticsItem } from '@stores/interfaces';
import { Empty, Image, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { MdOutlineRemoveRedEye } from 'react-icons/md';

interface TsummaryType {
	item: IPosture;
}

const CoachPostureSummary = (props: TsummaryType) => {
	const { item } = props;
	const { t } = useTranslation();

	const labels = ['head', 'ear', 'shoulder', 'elbow', 'hip', 'knee', 'ankle'];
	const sides = ['front', 'back', 'left', 'right'];

	const isLies = (value: number) => {
		return value === 0 ? 'var(--color-success-500)' : 'var(--color-error-500)';
	};

	const columns = labels.map(label => ({
		title: (
			<div className="posture-heading-title-css">
				{label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
			</div>
		),
		dataIndex: label,
		key: label,
		align: 'center',
		render: (value: unknown) => (
			<p
				style={{
					color: value != null ? isLies(value) : '',
					textAlign: 'center',
				}}>
				{value != null ? value : '-'}
			</p>
		),
	}));

	const dataSource = sides.map(side => {
		const posture = item.postureAnalytics.find(
			(p: PostureAnalyticsItem) => p.view === side,
		);
		return {
			key: side,
			side: (
				<div className="posture-sides-section">
					<Image
						width={64}
						height={53}
						src={posture?.screenshot || '/images/white-image.png'}
						preview={{
							src: posture?.screenshot,
							mask: <MdOutlineRemoveRedEye size={18} />,
							width: 'auto',
							height: 'auto',
						}}
						style={{ borderRadius: '0.5rem' }}
						onError={e => {
							const target = e.target as HTMLImageElement;
							target.src = '/images/white-image.png';
						}}
					/>
					<p className="posture-heading-title-css">{side.toUpperCase()}</p>
				</div>
			),
			...labels.reduce((acc, label) => {
				acc[label] = posture?.[label] ?? '-';
				return acc;
			}, {}),
		};
	});

	if (!item.postureAnalytics || item.postureAnalytics.length === 0) {
		return (
			<Empty
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				description={<span>{t('Admin.data.addToReports.noData')}</span>}
			/>
		);
	}

	return (
		<div
			className="posture-card-container"
			style={{
				backgroundColor: 'var(--collapse-bg-color)',
				padding: 'var(--spacing-4)',
				borderRadius: 'var(--spacing-2)',
			}}>
			<Table
				columns={[
					{
						title: (
							<p
								className="posture-heading-title-css"
								style={{ textAlign: 'left' }}>
								{t('Patient.data.postures.postureMeasure')}
							</p>
						),
						dataIndex: 'side',
						key: 'side',
						align: 'center',
					},
					...columns,
				]}
				dataSource={dataSource}
				pagination={false}
				scroll={{ x: 'max-content' }}
				bordered
				className="custom-posture-table"
			/>
		</div>
	);
};

export default CoachPostureSummary;

import { getDiagnosisCode } from '@stores/config/diagnosisCode';
import { updateReport } from '@stores/content/report/reports';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { DiagnosisCode } from '@types';
import { Button, Select, Table, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ReportDiagnosisCodes.css';

const { Paragraph } = Typography;

interface ReportCodesProps {
	isDownload?: boolean;
}

const ReportDiagnosisCodes = (props: ReportCodesProps) => {
	const { isDownload } = props;
	const buttonStyle = {
		color: 'var(-text-color-root)',
		border: 'inherit',
		marginTop: '-5px',
	};
	const report = useTypedSelector(state => state.reports.report);
	const [diagnosisData, setDiagnosisData] = useState<DiagnosisCode[]>([]);
	const [diagnosisCode, setDiagnosisCode] = useState<number[]>(
		report?.diagnosisCode || [],
	);
	const { Option } = Select;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	const columns = [
		{
			title: 'Code',
			dataIndex: 'code',
			key: 'code',
			width: '30%',
			render: (text: string) => (
				<span className="input-label input-label-container">{text}</span>
			),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			width: '70%',
			render: (text: string) => (
				<span className="input-label input-right-label-container">{text}</span>
			),
		},
	];

	const dataSource =
		report?.diagnosisCode
			?.map(code => {
				const diagnosis = diagnosisData?.find(data => data.id === code);
				if (!diagnosis) return null;

				return {
					key: code,
					code: diagnosis.code,
					description: diagnosis.description,
				};
			})
			.filter(Boolean) || [];

	const handleChange = (value: number[]) => {
		setDiagnosisCode(value);
	};

	const fetchData = async () => {
		const data = await dispatch(getDiagnosisCode());
		setDiagnosisData(data.payload.data);
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Mount-only - fetchData and dispatch are stable

	useEffect(() => {
		if (report?.diagnosisCode) {
			setDiagnosisCode(report.diagnosisCode);
		}
	}, [report]);

	const handleSave = async () => {
		const reportId = report?.id || '';
		const payload = {
			diagnosisCode: diagnosisCode,
		};
		await dispatch(updateReport({ payload, reportId }));
		message.success(t('Admin.data.addToReports.saveText'));
	};

	return (
		<>
			{!isDownload ? (
				// Modal View
				<>
					<Paragraph className="code-label">
						{t('Patient.data.diagnosisCode.label')}
					</Paragraph>
					<div className="input-container">
						<Select
							placeholder={t('Patient.data.diagnosisCode.placeHolder')}
							mode="multiple"
							className="theme-select-dropdown"
							onChange={handleChange}
							allowClear
							style={{ width: '90%' }}
							value={diagnosisCode}
							showSearch
							dropdownClassName="report-option-class"
							filterOption={(input, option) => {
								const optionText =
									option?.children?.toString().toLowerCase() || '';
								const optionValue = option?.value?.toString().toLowerCase() || '';
								return (
									optionText.includes(input.toLowerCase()) ||
									optionValue.includes(input.toLowerCase())
								);
							}}>
							{diagnosisData?.map(option => (
								<Option key={option?.id} value={option?.id}>
									{option.code} - {option.description}
								</Option>
							))}
						</Select>
						&nbsp;
						<Button onClick={handleSave}>
							+ {t('Patient.data.diagnosisCode.addCodes')}
						</Button>
					</div>
					<Table
						columns={columns}
						dataSource={dataSource}
						pagination={false}
						showHeader={false}
						bordered={false}
					/>
				</>
			) : (
				// PDF Download View - Inline styles
				<>
					{dataSource && dataSource.length > 0 && (
						<div style={{ marginBottom: '12px' }}>
							<p
								style={{
									fontWeight: 700,
									fontSize: '14px',
									color: '#475467',
									textAlign: 'center',
									marginBottom: '8px',
								}}>
								{t('Patient.data.diagnosisCode.label')}
							</p>
							<div
								style={{
									border: '1px solid #e5e7eb',
									borderRadius: '8px',
									overflow: 'hidden',
								}}>
								{dataSource.map((item, idx) => (
									<div
										key={item?.key}
										style={{
											display: 'flex',
											alignItems: 'center',
											padding: '8px 12px',
											borderBottom:
												idx < dataSource.length - 1
													? '1px solid #e5e7eb'
													: 'none',
											backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
										}}>
										<span
											style={{
												fontWeight: 700,
												fontSize: '12px',
												color: '#475467',
												width: '80px',
												flexShrink: 0,
											}}>
											{item?.code}
										</span>
										<span
											style={{
												fontSize: '12px',
												color: '#667085',
												flex: 1,
											}}>
											{item?.description}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default ReportDiagnosisCodes;

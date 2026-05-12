import {
	ClearOutlined,
	DeleteOutlined,
	DownloadOutlined,
	RedoOutlined,
	UndoOutlined,
} from '@ant-design/icons';
import { Button, Divider, Space, Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BsStars } from 'react-icons/bs';

interface AToolbarProps {
	onExport: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onClear: () => void;
	aiMediapipeAnalysis: () => void;
	onClearLandMarks: () => void;
	canUndo: boolean;
	canRedo: boolean;
	saving: boolean;
	analyzing: boolean;
	title?: string;
	isValidatedMode?: boolean;
	viewMode?: 'current' | 'validated' | 'pt-verified';
}

const AToolbar: React.FC<AToolbarProps> = ({
	title,
	onExport,
	aiMediapipeAnalysis,
	onClearLandMarks,
	onUndo,
	onRedo,
	onClear,
	canUndo,
	canRedo,
	analyzing,
	saving,
	isValidatedMode = false,
	viewMode = 'current',
}) => {
	const { t } = useTranslation();
	const isPTVerifiedMode = viewMode === 'pt-verified';

	return (
		<div className="poc-annotation-toolbar-overlay">
			<Space size={8}>
				<Tooltip title={t('Admin.data.imageAnnotation.undo')}>
					<Button
						type="default"
						shape="circle"
						icon={<UndoOutlined />}
						onClick={onUndo}
						disabled={!isPTVerifiedMode || !canUndo}
						size="middle"
						style={{ padding: 'var(--spacing-5)' }}
					/>
				</Tooltip>

				<Tooltip title={t('Admin.data.imageAnnotation.redo')}>
					<Button
						type="default"
						shape="circle"
						icon={<RedoOutlined />}
						onClick={onRedo}
						disabled={!isPTVerifiedMode || !canRedo}
						size="middle"
						style={{ padding: 'var(--spacing-5)' }}
					/>
				</Tooltip>

				<Tooltip title={t('Admin.data.imageAnnotation.clearAnnotations')}>
					<Button
						type="default"
						shape="circle"
						icon={<ClearOutlined />}
						onClick={onClear}
						size="middle"
						disabled={!isPTVerifiedMode}
						style={{ padding: 'var(--spacing-5)' }}
					/>
				</Tooltip>

				<Tooltip title={t('Admin.data.imageAnnotation.clearLandmarks')}>
					<Button
						type="default"
						shape="circle"
						icon={<DeleteOutlined />}
						onClick={onClearLandMarks}
						size="middle"
						disabled={!isPTVerifiedMode}
						style={{ padding: 'var(--spacing-5)' }}
					/>
				</Tooltip>

				<Divider />
				<Tooltip title={t('Admin.data.imageAnnotation.export')}>
					<Button
						type="primary"
						shape="circle"
						icon={<DownloadOutlined />}
						onClick={onExport}
						size="middle"
						style={{ padding: 'var(--spacing-5)' }}
					/>
				</Tooltip>

				<Tooltip title={t('Admin.data.imageAnnotation.aiAnalysis')}>
					<Button
						type="primary"
						shape="circle"
						disabled={title?.toLowerCase().includes('neck') || isValidatedMode}
						icon={<BsStars />}
						onClick={aiMediapipeAnalysis}
						size="middle"
						style={{ padding: 'var(--spacing-5)' }}
						loading={analyzing}
					/>
				</Tooltip>
			</Space>
		</div>
	);
};

export default AToolbar;

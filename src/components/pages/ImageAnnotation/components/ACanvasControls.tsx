import React from 'react';
import { Switch, Slider, Tooltip, Space } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ACanvasControlsProps {
  showGrid: boolean;
  gridSize: number;
  onShowGridChange: (show: boolean) => void;
  onGridSizeChange: (size: number) => void;
}

const ACanvasControls: React.FC<ACanvasControlsProps> = ({
  showGrid,
  gridSize,
  onShowGridChange,
  onGridSizeChange,
}) => {
  const { t } = useTranslation();

  return (
		<div className="canvas-controls-overlay">
			<Space direction="horizontal" size={16}>
        <div className="control-group">
					<Tooltip title={t('Admin.data.imageAnnotation.toggleGrid')}>
						<Switch
							checked={showGrid}
							onChange={onShowGridChange}
							checkedChildren={<TableOutlined />}
							unCheckedChildren={<TableOutlined />}
						/>
					</Tooltip>

					{showGrid && (
						<Slider
							min={10}
							max={100}
							step={10}
							value={gridSize}
							onChange={onGridSizeChange}
							tooltip={{ formatter: value => `${value}px` }}
							style={{ width: 100 }}
						/>
					)}
				</div>
			</Space>
		</div>
	);
};

export default ACanvasControls;

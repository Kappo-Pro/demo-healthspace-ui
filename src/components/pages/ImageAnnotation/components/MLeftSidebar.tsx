import React, { useState, useMemo } from 'react';
import { Menu, ColorPicker, Tooltip, Slider, theme } from 'antd';
import {
  BsArrowsMove,
  BsFillPencilFill,
  BsSlashLg,
  BsCircle,
  BsArrowUpRight,
  BsCardText,
  BsBorderWidth,
  BsRulers,
  BsPencilSquare,
} from 'react-icons/bs';
import { FontSizeOutlined } from '@ant-design/icons';
import type { MenuProps, ColorPickerProps } from 'antd';
import type { Color } from 'antd/es/color-picker';
import TextInputModal from './TextInputModa';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

interface Annotation {
  id: string;
  type: string;
  text?: string;
  fontSize?: number;
}

interface CanvasState {
  annotations: Annotation[];
  selectedAnnotationId?: string;
}

interface MLeftSidebarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  currentThickness: number;
  onThicknessChange: (thickness: number) => void;
  canvasState: CanvasState;
  onStateChange: (updates: Partial<CanvasState>) => void;
}

const TOOLS = (t: TFunction) => [
  { id: 'select', name: t('Admin.data.imageAnnotation.select'), icon: BsArrowsMove },
  { id: 'freehand', name: t('Admin.data.imageAnnotation.freehand'), icon: BsFillPencilFill },
  { id: 'line', name: t('Admin.data.imageAnnotation.line'), icon: BsSlashLg },
  { id: 'circle', name: t('Admin.data.imageAnnotation.circle'), icon: BsCircle },
  { id: 'arrow', name: t('Admin.data.imageAnnotation.arrow'), icon: BsArrowUpRight },
  { id: 'text', name: t('Admin.data.imageAnnotation.text'), icon: BsCardText },
  { id: 'angle', name: t('Admin.data.imageAnnotation.angle'), icon: BsRulers },
  { id: 'edit-text', name: t('Admin.data.imageAnnotation.editText'), icon: BsPencilSquare },
  {
    id: 'font+',
    name: t('Admin.data.imageAnnotation.fontIncrease'),
    icon: () => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-0-5)' }}>
        <FontSizeOutlined />
        <strong style={{ fontSize: 'var(--font-size-xs)' }}>+</strong>
      </span>
    ),
  },
  {
    id: 'font-',
    name: t('Admin.data.imageAnnotation.fontDecrease'),
    icon: () => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-0-5)' }}>
        <FontSizeOutlined />
        <strong style={{ fontSize: 'var(--font-size-xs)' }}>-</strong>
      </span>
    ),
  },
];

const MLeftSidebar: React.FC<MLeftSidebarProps> = ({
  selectedTool,
  onToolSelect,
  currentColor,
  onColorChange,
  currentThickness,
  onThicknessChange,
  canvasState,
  onStateChange,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const tools = TOOLS(t);

  // Use theme-aware color presets
  const COLOR_PRESETS = useMemo(() => [
    { name: 'Red', value: token.colorError },
    { name: 'Orange', value: token.colorWarning },
    { name: 'Yellow', value: token.colorWarningBg },
    { name: 'Green', value: token.colorSuccess },
    { name: 'Cyan', value: token.colorInfo },
    { name: 'Blue', value: token.colorPrimary },
    { name: 'Purple', value: token.colorPrimaryActive },
    { name: 'Magenta', value: token.colorErrorBg },
    { name: 'Black', value: token.colorText },
    { name: 'Gray', value: token.colorTextSecondary },
  ], [token]);

  const handleColorChange: ColorPickerProps['onChange'] = (color: Color) => {
    onColorChange(color.toHexString());
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editDefaultText, setEditDefaultText] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const menuItems: MenuProps['items'] = [
    ...tools.filter(tool => {
      if (
        (tool.id === 'font+' || tool.id === 'font-' || tool.id === 'edit-text') &&
        canvasState?.annotations.find(
          an => an.id === canvasState.selectedAnnotationId,
        )?.type !== 'text'
      ) {
        return false;
      }
      return true;
    }).map(tool => ({
      key: tool.id,
      label: (
        <Tooltip title={tool.name} placement="right">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {React.createElement(tool.icon)}
          </div>
        </Tooltip>
      ),
      style: { cursor: 'default' },
      onClick: () => {
        if (tool.id === 'font+' || tool.id === 'font-') {
          const currentAnnotationIndex = canvasState.annotations.findIndex(
            an => an.id === canvasState.selectedAnnotationId,
          );

          if (currentAnnotationIndex > -1) {
            const currentAnnotation = canvasState.annotations[currentAnnotationIndex];

            if (
              currentAnnotation.type === 'text' &&
              typeof currentAnnotation.fontSize === 'number'
            ) {
              const updatedAnnotation = {
                ...currentAnnotation,
                fontSize:
                  tool.id === 'font+'
                    ? currentAnnotation.fontSize + 1
                    : currentAnnotation.fontSize - 1,
              };

              const updatedAnnotations = [...canvasState.annotations];
              updatedAnnotations[currentAnnotationIndex] = updatedAnnotation;

              onStateChange({
                annotations: updatedAnnotations,
              });
            }
          }
        } else if (tool.id === 'edit-text') {
          const currentAnnotationIndex = canvasState.annotations.findIndex(
            an => an.id === canvasState.selectedAnnotationId,
          );

          if (currentAnnotationIndex > -1) {
            const currentAnnotation = canvasState.annotations[currentAnnotationIndex];
            setEditDefaultText(currentAnnotation.text || '');
            setEditIndex(currentAnnotationIndex);
            setShowEditModal(true);
          }
        } else {
          onToolSelect(tool.id);
        }
      },
    })),
    { type: 'divider' as const },
    {
      key: 'color-picker',
      label: (
        <Tooltip title="Color" placement="right">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <ColorPicker
              value={currentColor}
              onChange={handleColorChange}
              size="small"
              presets={[
                {
                  label: 'Recommended',
                  colors: COLOR_PRESETS.map(p => p.value),
                },
              ]}
            />
          </div>
        </Tooltip>
      ),
      disabled: true,
      style: { cursor: 'default' },
    },
    { type: 'divider' as const },
    {
      key: 'thickness',
      label: (
        <Tooltip
          title={
            <div style={{ padding: '8px 4px' }}>
              <div style={{ marginBottom: 8, textAlign: 'center', fontSize: 'var(--font-size-xs)' }}>
                {t('Admin.data.imageAnnotation.thickness')} ({currentThickness}px)
              </div>
              <Slider
                min={1}
                max={10}
                value={currentThickness}
                onChange={onThicknessChange}
                style={{ width: 120, margin: 0 }}
                tooltip={{ formatter: value => `${value}px` }}
              />
            </div>
          }
          placement="right"
          trigger="hover"
          overlayStyle={{ zIndex: 1050 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <BsBorderWidth />
          </div>
        </Tooltip>
      ),
      disabled: true,
      style: { cursor: 'default' },
    },
  ];

  return (
    <div className="poc-annotation-left-sidebar-menu">
      <Menu
        mode="inline"
        selectedKeys={[selectedTool]}
        items={menuItems}
        className="poc-sidebar-menu"
        style={{userSelect:'none'}}
        inlineCollapsed={true}
      />

      <TextInputModal
        visible={showEditModal}
        defaultValue={editDefaultText}
        onOk={(newText) => {
          if (editIndex !== null) {
            const updatedAnnotations = [...canvasState.annotations];
            updatedAnnotations[editIndex] = {
              ...updatedAnnotations[editIndex],
              text: newText,
            };
            onStateChange({ annotations: updatedAnnotations });
          }
          setShowEditModal(false);
        }}
        onCancel={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default MLeftSidebar;
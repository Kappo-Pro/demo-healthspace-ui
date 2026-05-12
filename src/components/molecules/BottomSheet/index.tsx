import React from 'react';
import { Drawer } from 'antd';
import './styles.css';

export interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when the bottom sheet is closed */
  onClose: () => void;
  /** Title of the bottom sheet */
  title?: string;
  /** Content to display */
  children: React.ReactNode;
  /** Height of the bottom sheet (default: 80vh) */
  height?: string | number;
  /** Whether to show close button */
  closable?: boolean;
  /** Class name for custom styling */
  className?: string;
}

/**
 * BottomSheet - Mobile-optimized modal drawer
 *
 * Features:
 * - Slides up from bottom on mobile devices
 * - Touch-friendly with swipe-down to close
 * - Customizable height
 * - Follows design system
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  height = '80vh',
  closable = true,
  className = '',
}) => {
  return (
    <Drawer
      placement="bottom"
      onClose={onClose}
      open={visible}
      height={height}
      className={`mobile-bottom-sheet ${className}`}
      title={title}
      closable={closable}
      styles={{
        body: {
          padding: 'var(--spacing-4)',
        },
      }}
      // Mobile-optimized props
      maskClosable={true}
      keyboard={true}
    >
      {children}
    </Drawer>
  );
};

export default BottomSheet;

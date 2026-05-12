/* eslint-disable react-refresh/only-export-components */
/**
 * ANTD-046 Task 4: Modal Component Variants
 *
 * Reusable modal components with standardized configurations.
 * All variants are built on Ant Design's Modal with consistent sizing and behavior.
 */

import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';
import { MODAL_CONFIGS, MODAL_BODY_STYLES } from './modalConfig';
import './BottomSheetModal.css';
import './FullscreenModal.css';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ModalProps extends AntModalProps {
	/** Optional body style override */
	bodyStyle?: React.CSSProperties;
}

// ============================================================================
// STANDARD MODAL
// ============================================================================

/**
 * Standard Modal with default configuration
 * - Small width (520px)
 * - Centered
 * - Standard OK/Cancel footer
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <Modal
 *   title={t('examples.modal.standard.title')}
 *   open={isOpen}
 *   onOk={handleOk}
 *   onCancel={handleCancel}
 * >
 *   <p>{t('examples.modal.standard.content')}</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.default.width,
	centered = MODAL_CONFIGS.default.centered,
	destroyOnHidden = MODAL_CONFIGS.default.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.default.maskClosable,
	keyboard = MODAL_CONFIGS.default.keyboard,
	bodyStyle = MODAL_BODY_STYLES.default,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

// ============================================================================
// FORM MODALS
// ============================================================================

/**
 * Form Modal
 * - Medium width (640px)
 * - Cannot be closed by clicking mask
 * - Destroys content on close
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <FormModal
 *   title={t('examples.modal.form.title')}
 *   open={isOpen}
 *   onOk={handleSubmit}
 *   onCancel={handleCancel}
 * >
 *   <Form>...</Form>
 * </FormModal>
 * ```
 */
export const FormModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.form.width,
	centered = MODAL_CONFIGS.form.centered,
	destroyOnHidden = MODAL_CONFIGS.form.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.form.maskClosable,
	keyboard = MODAL_CONFIGS.form.keyboard,
	bodyStyle = MODAL_BODY_STYLES.form,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Large Form Modal
 * - Large width (800px)
 * - For multi-section forms
 * - Cannot be closed by mask
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <LargeFormModal
 *   title={t('examples.modal.largeForm.title')}
 *   open={isOpen}
 *   onOk={handleSubmit}
 *   onCancel={handleCancel}
 * >
 *   <Form layout="vertical">...</Form>
 * </LargeFormModal>
 * ```
 */
export const LargeFormModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.largeForm.width,
	centered = MODAL_CONFIGS.largeForm.centered,
	destroyOnHidden = MODAL_CONFIGS.largeForm.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.largeForm.maskClosable,
	keyboard = MODAL_CONFIGS.largeForm.keyboard,
	bodyStyle = MODAL_BODY_STYLES.form,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Extra Large Form Modal
 * - Extra large width (974px)
 * - For complex forms with sidebars
 * - Cannot be closed by mask
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <XLargeFormModal
 *   title={t('examples.modal.xlargeForm.title')}
 *   open={isOpen}
 *   onOk={handleSubmit}
 *   onCancel={handleCancel}
 * >
 *   <ComplexForm />
 * </XLargeFormModal>
 * ```
 */
export const XLargeFormModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.xlargeForm.width,
	centered = MODAL_CONFIGS.xlargeForm.centered,
	destroyOnHidden = MODAL_CONFIGS.xlargeForm.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.xlargeForm.maskClosable,
	keyboard = MODAL_CONFIGS.xlargeForm.keyboard,
	bodyStyle = MODAL_BODY_STYLES.form,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

// ============================================================================
// CONFIRMATION MODALS
// ============================================================================

/**
 * Confirmation Modal
 * - Extra small width (420px)
 * - For yes/no questions
 * - Can be closed by mask
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <ConfirmModal
 *   title={t('examples.modal.confirm.title')}
 *   open={isOpen}
 *   onOk={handleConfirm}
 *   onCancel={handleCancel}
 * >
 *   <p>{t('examples.modal.confirm.content')}</p>
 * </ConfirmModal>
 * ```
 */
export const ConfirmModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.confirm.width,
	centered = MODAL_CONFIGS.confirm.centered,
	destroyOnHidden = MODAL_CONFIGS.confirm.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.confirm.maskClosable,
	keyboard = MODAL_CONFIGS.confirm.keyboard,
	bodyStyle = MODAL_BODY_STYLES.compact,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Alert Modal
 * - Extra small width (420px)
 * - No footer (custom single button)
 * - Can be closed by mask
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <AlertModal
 *   title={t('examples.modal.alert.title')}
 *   open={isOpen}
 *   footer={<Button onClick={handleClose}>OK</Button>}
 * >
 *   <p>{t('examples.modal.alert.content')}</p>
 * </AlertModal>
 * ```
 */
export const AlertModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.alert.width,
	centered = MODAL_CONFIGS.alert.centered,
	destroyOnHidden = MODAL_CONFIGS.alert.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.alert.maskClosable,
	keyboard = MODAL_CONFIGS.alert.keyboard,
	footer = MODAL_CONFIGS.alert.footer,
	bodyStyle = MODAL_BODY_STYLES.compact,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			footer={footer}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

// ============================================================================
// DISPLAY MODALS
// ============================================================================

/**
 * Details Modal (read-only)
 * - Large width (800px)
 * - Can be closed by mask
 * - For viewing information
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <DetailsModal
 *   title={t('examples.modal.details.title')}
 *   open={isOpen}
 *   onCancel={handleClose}
 *   footer={null}
 * >
 *   <UserDetailsView />
 * </DetailsModal>
 * ```
 */
export const DetailsModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.details.width,
	centered = MODAL_CONFIGS.details.centered,
	destroyOnHidden = MODAL_CONFIGS.details.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.details.maskClosable,
	keyboard = MODAL_CONFIGS.details.keyboard,
	bodyStyle = MODAL_BODY_STYLES.scrollable,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Table Modal
 * - Extra extra large width (1200px)
 * - For data tables
 * - Can be closed by mask
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <TableModal
 *   title={t('examples.modal.table.title')}
 *   open={isOpen}
 *   onCancel={handleClose}
 *   footer={null}
 * >
 *   <Table dataSource={data} columns={columns} />
 * </TableModal>
 * ```
 */
export const TableModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.table.width,
	centered = MODAL_CONFIGS.table.centered,
	destroyOnHidden = MODAL_CONFIGS.table.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.table.maskClosable,
	keyboard = MODAL_CONFIGS.table.keyboard,
	bodyStyle = MODAL_BODY_STYLES.noPadding,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Full Width Modal
 * - 90vw width (responsive)
 * - For dashboards or complex layouts
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <FullWidthModal
 *   title={t('examples.modal.fullWidth.title')}
 *   open={isOpen}
 *   onCancel={handleClose}
 *   footer={null}
 * >
 *   <DashboardLayout />
 * </FullWidthModal>
 * ```
 */
export const FullWidthModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.fullWidth.width,
	centered = MODAL_CONFIGS.fullWidth.centered,
	destroyOnHidden = MODAL_CONFIGS.fullWidth.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.fullWidth.maskClosable,
	keyboard = MODAL_CONFIGS.fullWidth.keyboard,
	bodyStyle = MODAL_BODY_STYLES.scrollable,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

// ============================================================================
// SPECIAL PURPOSE MODALS
// ============================================================================

/**
 * Loading Modal
 * - Cannot be closed by user
 * - No footer
 * - Shows loading state
 *
 * @example
 * ```tsx
 * const { t } = useTypedTranslation();
 *
 * <LoadingModal
 *   title={t('examples.modal.loading.title')}
 *   open={isLoading}
 * >
 *   <Spin />
 *   <p>{t('examples.modal.loading.content')}</p>
 * </LoadingModal>
 * ```
 */
export const LoadingModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.loading.width,
	centered = MODAL_CONFIGS.loading.centered,
	destroyOnHidden = MODAL_CONFIGS.loading.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.loading.maskClosable,
	keyboard = MODAL_CONFIGS.loading.keyboard,
	footer = MODAL_CONFIGS.loading.footer,
	closable = MODAL_CONFIGS.loading.closable,
	bodyStyle = MODAL_BODY_STYLES.default,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			footer={footer}
			closable={closable}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

/**
 * Wizard Modal (multi-step)
 * - Extra large width (974px)
 * - Custom footer for navigation
 * - Cannot be closed by mask
 *
 * @example
 * ```tsx
 * <WizardModal
 *   title={`Step ${currentStep + 1} of ${totalSteps}`}
 *   open={isOpen}
 *   footer={customWizardFooter}
 * >
 *   {renderStepContent(currentStep)}
 * </WizardModal>
 * ```
 */
export const WizardModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.wizard.width,
	centered = MODAL_CONFIGS.wizard.centered,
	destroyOnHidden = MODAL_CONFIGS.wizard.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.wizard.maskClosable,
	keyboard = MODAL_CONFIGS.wizard.keyboard,
	footer = MODAL_CONFIGS.wizard.footer,
	bodyStyle = MODAL_BODY_STYLES.spacious,
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			footer={footer}
			bodyStyle={bodyStyle}
			{...props}
		/>
	);
};

// ============================================================================
// BOTTOM SHEET MODAL (Apple-style slide-up with sticky scroll)
// ============================================================================

/**
 * Bottom Sheet Modal
 * - Apple-style sticky scroll behavior
 * - Modal starts at bottom, scrolls up with page
 * - Bottom border-radius revealed when reaching end of content
 * - Max width 1100px
 * - Glow effect always on
 * - Large rounded corners (all corners)
 * - Circular close button
 *
 * @example
 * ```tsx
 * <BottomSheetModal
 *   title="Performance"
 *   open={isOpen}
 *   onCancel={handleClose}
 *   footer={null}
 * >
 *   <h1>Happily ever faster.</h1>
 *   <p>Content here...</p>
 * </BottomSheetModal>
 * ```
 */
export const BottomSheetModal: React.FC<ModalProps> = ({
	width = MODAL_CONFIGS.bottomSheet.width,
	centered = false,
	destroyOnHidden = MODAL_CONFIGS.bottomSheet.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.bottomSheet.maskClosable,
	keyboard = MODAL_CONFIGS.bottomSheet.keyboard,
	footer = MODAL_CONFIGS.bottomSheet.footer,
	className,
	wrapClassName,
	styles,
	onCancel,
	open,
	...props
}) => {
	// Handle click on the wrapper (backdrop area) to close modal
	const handleWrapperClick = React.useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			// Only close if clicking directly on the wrapper (not modal content)
			if (maskClosable && e.target === e.currentTarget && onCancel) {
				onCancel(e as unknown as React.MouseEvent<HTMLButtonElement>);
			}
		},
		[maskClosable, onCancel],
	);

	// Scroll to end when modal opens (so modal appears at bottom of viewport)
	React.useEffect(() => {
		if (open) {
			const wrapper = document.querySelector('.bottom-sheet-modal-wrap');
			if (wrapper) {
				// Wait for content to render, then scroll to end
				// This positions the modal at the bottom of the viewport initially
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						wrapper.scrollTop = wrapper.scrollHeight - wrapper.clientHeight;
					});
				});
			}
		}
	}, [open]);

	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={false} // We handle this manually
			keyboard={keyboard}
			footer={footer}
			open={open}
			onCancel={onCancel}
			className={`bottom-sheet-modal ${className || ''}`}
			wrapClassName={`bottom-sheet-modal-wrap ${wrapClassName || ''}`}
			wrapProps={{
				onClick: handleWrapperClick,
			}}
			styles={{
				mask: { background: 'var(--modal-overlay)' },
				...styles,
			}}
			transitionName=""
			maskTransitionName="fade"
			{...props}
		/>
	);
};

// ============================================================================
// FULLSCREEN MODAL (Immersive)
// ============================================================================

export interface FullscreenModalProps extends AntModalProps {
	/** Optional height override (default: 90vh) */
	height?: string;
}

/**
 * Fullscreen Modal
 * - 98% width, 90vh height
 * - No header/title
 * - Floating circular close button in top-right corner
 * - No padding - content takes full space
 * - For ROM/Posture scans, video players, immersive experiences
 *
 * @example
 * ```tsx
 * <FullscreenModal
 *   open={isOpen}
 *   onCancel={handleClose}
 * >
 *   <RomFlow />
 * </FullscreenModal>
 * ```
 */
export const FullscreenModal: React.FC<FullscreenModalProps> = ({
	width = MODAL_CONFIGS.fullscreen.width,
	centered = MODAL_CONFIGS.fullscreen.centered,
	destroyOnHidden = MODAL_CONFIGS.fullscreen.destroyOnHidden,
	maskClosable = MODAL_CONFIGS.fullscreen.maskClosable,
	keyboard = MODAL_CONFIGS.fullscreen.keyboard,
	footer = MODAL_CONFIGS.fullscreen.footer,
	closable = MODAL_CONFIGS.fullscreen.closable,
	height = '90vh',
	className,
	styles,
	title, // Explicitly capture to prevent passing to AntModal
	...props
}) => {
	return (
		<AntModal
			width={width}
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			footer={footer}
			closable={closable}
			title={null}
			className={`fullscreen-modal ${className || ''}`}
			styles={{
				body: {
					...MODAL_BODY_STYLES.fullscreen,
					height,
				},
				mask: { background: 'var(--modal-overlay)' },
				...styles,
			}}
			{...props}
		/>
	);
};

// ============================================================================
// ASPECT RATIO MODAL (16:9 Cinema-style)
// ============================================================================

export interface AspectRatioModalProps extends AntModalProps {
	/** Aspect ratio (default: 16/9) */
	aspectRatio?: number;
}

/**
 * Aspect Ratio Modal (16:9)
 * - Full viewport height
 * - Width calculated from 16:9 aspect ratio
 * - No header/title
 * - Floating circular close button
 * - For ROM/Posture scans, video players
 *
 * @example
 * ```tsx
 * <AspectRatioModal
 *   open={isOpen}
 *   onCancel={handleClose}
 * >
 *   <RomFlow />
 * </AspectRatioModal>
 * ```
 */
export const AspectRatioModal: React.FC<AspectRatioModalProps> = ({
	centered = true,
	destroyOnHidden = true,
	maskClosable = false,
	keyboard = true,
	footer = null,
	closable = true,
	className,
	wrapClassName,
	styles,
	title,
	...props
}) => {
	return (
		<AntModal
			width="auto"
			centered={centered}
			destroyOnHidden={destroyOnHidden}
			maskClosable={maskClosable}
			keyboard={keyboard}
			footer={footer}
			closable={closable}
			title={null}
			className={`fullscreen-modal ${className || ''}`}
			wrapClassName={`aspect-ratio-modal ${wrapClassName || ''}`}
			styles={{
				mask: { background: 'var(--modal-overlay)' },
				...styles,
			}}
			{...props}
		/>
	);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Modal;

// Re-export Modal static methods
export const { confirm, info, success, error, warning } = AntModal;

// Re-export types, configurations, and utilities for convenience
export type { ModalProps as AntModalProps } from 'antd';
export {
	MODAL_SIZES,
	MODAL_CONFIGS,
	MODAL_BODY_STYLES,
	MODAL_TRANSITIONS,
	CONFIRM_MODAL_CONFIGS,
	getModalWidthForContent,
	getResponsiveModalWidth,
	shouldUseFullWidth,
	createAccessibleModal,
	isModalTooWide,
	getOptimalModalWidth,
} from './modalConfig';

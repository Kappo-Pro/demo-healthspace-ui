/**
 * Bulk Operation Undo Toast
 *
 * Displays toast notification with undo button for bulk operations.
 * Auto-expires after 10 seconds.
 *
 * Story 3.3: Bulk Operations for Workflow Efficiency (FR13)
 * @module components/organisms/OAdminTriageDashboard/BulkOperationUndoToast
 */

import React, { useEffect, useState } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

const { Text } = Typography;

interface BulkOperationUndoToastProps {
	visible: boolean;
	description: string;
	onUndo: () => void;
	onCancel: () => void;
	duration?: number; // in seconds
}

export const BulkOperationUndoToast: React.FC<BulkOperationUndoToastProps> = ({
	visible,
	description,
	onUndo,
	onCancel,
	duration = 10,
}) => {
	const { t } = useTypedTranslation();
	const [timeRemaining, setTimeRemaining] = useState(duration);
	const [messageKey, setMessageKey] = useState<string | null>(null);

	useEffect(() => {
		if (visible) {
			setTimeRemaining(duration);

			// Show message with custom content
			const key = `undo-${Date.now()}`;
			setMessageKey(key);

			message.open({
				key,
				duration: 0, // Don't auto-dismiss
				content: (
					<Space
						direction="vertical"
						style={{ width: '100%' }}
						size="small"
						role="alert"
						aria-live="polite">
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text strong>{description}</Text>
							<Button
								type="text"
								size="small"
								icon={<UntitledIcon name="close" size={14} />}
								onClick={handleCancel}
								aria-label={t('Admin.data.triage.bulkOperations.undo.dismissNotification')}
								style={{ minWidth: 'auto' }}
							/>
						</Space>
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text type="secondary">
								{t('Admin.data.triage.bulkOperations.undo.undoAvailable', {
									seconds: timeRemaining,
								})}
							</Text>
							<Button
								type="primary"
								size="small"
								icon={<UntitledIcon name="undo" size={14} />}
								onClick={handleUndo}
								aria-label={t('Admin.data.triage.bulkOperations.undo.undoBulkOperation')}>
								{t('Admin.data.triage.bulkOperations.undo.undoButton')}
							</Button>
						</Space>
					</Space>
				),
			});

			// Countdown timer
			const interval = setInterval(() => {
				setTimeRemaining(prev => {
					if (prev <= 1) {
						handleExpire();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => {
				clearInterval(interval);
			};
		} else if (messageKey) {
			message.destroy(messageKey);
			setMessageKey(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible]);

	// Update countdown display
	useEffect(() => {
		if (visible && messageKey && timeRemaining > 0) {
			message.open({
				key: messageKey,
				duration: 0,
				content: (
					<Space
						direction="vertical"
						style={{ width: '100%' }}
						size="small"
						role="alert"
						aria-live="polite">
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text strong>{description}</Text>
							<Button
								type="text"
								size="small"
								icon={<UntitledIcon name="close" size={14} />}
								onClick={handleCancel}
								aria-label={t('Admin.data.triage.bulkOperations.undo.dismissNotification')}
								style={{ minWidth: 'auto' }}
							/>
						</Space>
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text type="secondary">
								{t('Admin.data.triage.bulkOperations.undo.undoAvailable', {
									seconds: timeRemaining,
								})}
							</Text>
							<Button
								type="primary"
								size="small"
								icon={<UntitledIcon name="undo" size={14} />}
								onClick={handleUndo}
								aria-label={t('Admin.data.triage.bulkOperations.undo.undoBulkOperation')}>
								{t('Admin.data.triage.bulkOperations.undo.undoButton')}
							</Button>
						</Space>
					</Space>
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeRemaining]);

	const handleUndo = () => {
		if (messageKey) {
			message.destroy(messageKey);
			setMessageKey(null);
		}
		onUndo();
	};

	const handleCancel = () => {
		if (messageKey) {
			message.destroy(messageKey);
			setMessageKey(null);
		}
		onCancel();
	};

	const handleExpire = () => {
		if (messageKey) {
			message.destroy(messageKey);
			setMessageKey(null);
		}
		onCancel();
	};

	return null;
};

BulkOperationUndoToast.displayName = 'BulkOperationUndoToast';

export default BulkOperationUndoToast;

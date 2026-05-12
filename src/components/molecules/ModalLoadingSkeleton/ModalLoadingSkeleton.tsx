/**
 * ModalLoadingSkeleton Component
 *
 * Loading skeleton displayed while EvaluationResultsModal lazy loads
 *
 * @component
 * @version 1.0.0
 * @story Story 3.1 - Code Splitting
 */

import React from 'react';
import { Modal, Skeleton } from 'antd';
import styled from 'styled-components';

/**
 * ModalLoadingSkeleton - Skeleton UI for modal lazy loading
 *
 * Provides a visually consistent loading state that matches the modal dimensions
 * and prevents layout shift when actual content loads.
 *
 * Features:
 * - Modal shell with header and body skeleton
 * - Pulsing animation (Ant Design default)
 * - Responsive dimensions matching actual modal
 * - No layout shift on content load
 *
 * @example
 * ```tsx
 * <Suspense fallback={<ModalLoadingSkeleton />}>
 *   <EvaluationResultsModal {...props} />
 * </Suspense>
 * ```
 */
export const ModalLoadingSkeleton: React.FC = () => {
  return (
    <StyledModal
      open={true}
      footer={null}
      closable={false}
      maskClosable={false}
      width="min(90vw, 1200px)"
      centered
      data-testid="modal-loading-skeleton"
    >
      <SkeletonHeader>
        <Skeleton.Input active style={{ width: 300, height: 28 }} />
      </SkeletonHeader>
      <SkeletonBody>
        <Skeleton active paragraph={{ rows: 5 }} />
      </SkeletonBody>
    </StyledModal>
  );
};

/**
 * Styled Modal with consistent dimensions
 * Matches EvaluationResultsModal styling to prevent layout shift
 */
const StyledModal = styled(Modal)`
  .ant-modal-content {
    min-height: 400px;
    background: var(--surface-primary);
  }

  .ant-modal-body {
    padding: var(--spacing-lg, 24px);
  }
`;

/**
 * Skeleton header section
 * Mimics modal header with title skeleton
 */
const SkeletonHeader = styled.div`
  padding-bottom: var(--spacing-md, 16px);
  border-bottom: 1px solid var(--border-default);
  margin-bottom: var(--spacing-lg, 24px);
`;

/**
 * Skeleton body section
 * Contains paragraph skeleton for content preview
 */
const SkeletonBody = styled.div`
  padding: var(--spacing-md, 16px) 0;

  .ant-skeleton {
    .ant-skeleton-content {
      .ant-skeleton-title {
        margin-top: 0;
      }
    }
  }
`;

/**
 * Skeleton Loading Components
 *
 * Reusable skeleton placeholders for consistent loading states across the application.
 * Provides better perceived performance and reduces content layout shift (CLS).
 */

import { Card, Col, Flex, Row, Skeleton, Space } from 'antd';
import React from 'react';

/**
 * User List Skeleton
 *
 * Displays skeleton for user/patient list items with avatar and text.
 * Use for: User lists, patient lists, contact lists
 */
export const UserListSkeleton: React.FC<{ count?: number }> = ({
	count = 8,
}) => (
	<Space direction="vertical" style={{ width: '100%' }} size="middle">
		{Array(count)
			.fill(0)
			.map((_, i) => (
				<Card key={i} style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
					<Skeleton avatar active paragraph={{ rows: 2 }} />
				</Card>
			))}
	</Space>
);

/**
 * Table Skeleton
 *
 * Displays skeleton for table layouts with search bar and rows.
 * Use for: Data tables, patient tables, admin tables
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
	<Card>
		<Space direction="vertical" style={{ width: '100%' }} size="middle">
			{/* Search/Filter bar */}
			<Flex justify="space-between" align="center">
				<Skeleton.Input active style={{ width: 200, height: 32 }} />
				<Skeleton.Button active size="default" />
			</Flex>

			{/* Table rows */}
			<Skeleton active paragraph={{ rows }} />
		</Space>
	</Card>
);

/**
 * Form Skeleton
 *
 * Displays skeleton for form layouts with input fields and buttons.
 * Use for: Patient onboarding forms, settings forms, create/edit modals
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
	<Space direction="vertical" style={{ width: '100%' }} size="large">
		{Array(fields)
			.fill(0)
			.map((_, i) => (
				<Skeleton.Input key={i} active block size="large" />
			))}
		<Space>
			<Skeleton.Button active size="large" />
			<Skeleton.Button active size="large" />
		</Space>
	</Space>
);

/**
 * Dashboard Skeleton
 *
 * Displays skeleton for dashboard layouts with stat cards and charts.
 * Use for: Admin dashboard, patient dashboard, analytics pages
 */
export const DashboardSkeleton: React.FC = () => (
	<Space direction="vertical" style={{ width: '100%' }} size="large">
		{/* Stat cards */}
		<Row gutter={[16, 16]}>
			{Array(4)
				.fill(0)
				.map((_, i) => (
					<Col span={6} key={i}>
						<Card>
							<Skeleton active paragraph={{ rows: 2 }} />
						</Card>
					</Col>
				))}
		</Row>

		{/* Main content area */}
		<Row gutter={16}>
			<Col span={16}>
				<Card>
					<Skeleton.Image active style={{ width: '100%', height: 400 }} />
				</Card>
			</Col>
			<Col span={8}>
				<Card>
					<Skeleton active paragraph={{ rows: 6 }} />
				</Card>
			</Col>
		</Row>
	</Space>
);

/**
 * Chart Skeleton
 *
 * Displays skeleton for chart/visualization areas.
 * Use for: Analytics charts, progress charts, data visualizations
 */
export const ChartSkeleton: React.FC<{ height?: number }> = ({
	height = 300,
}) => (
	<Card>
		<Space direction="vertical" style={{ width: '100%' }} size="small">
			<Skeleton.Input active style={{ width: 200 }} />
			<Skeleton.Image active style={{ width: '100%', height }} />
		</Space>
	</Card>
);

/**
 * Modal Content Skeleton
 *
 * Displays skeleton for modal content.
 * Use for: User details modal, settings modal, any loading modal content
 */
export const ModalContentSkeleton: React.FC = () => (
	<Space direction="vertical" style={{ width: '100%' }} size="large">
		<Skeleton.Input active block size="small" />
		<Skeleton active paragraph={{ rows: 4 }} />
		<Skeleton.Input active block size="large" />
	</Space>
);

/**
 * Card Grid Skeleton
 *
 * Displays skeleton for card grid layouts.
 * Use for: Program cards, exercise cards, feature cards
 */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({
	count = 6,
}) => (
	<Row gutter={[16, 16]}>
		{Array(count)
			.fill(0)
			.map((_, i) => (
				<Col span={8} key={i}>
					<Card>
						<Skeleton.Image active style={{ width: '100%', height: 200 }} />
						<Skeleton
							active
							paragraph={{ rows: 2 }}
							style={{ marginTop: 16 }}
						/>
					</Card>
				</Col>
			))}
	</Row>
);

/**
 * Activity Feed Skeleton
 *
 * Displays skeleton for activity feed/timeline layouts.
 * Use for: Activity stream, notifications, timeline
 */
export const ActivityFeedSkeleton: React.FC<{ count?: number }> = ({
	count = 10,
}) => (
	<Space direction="vertical" style={{ width: '100%' }} size="middle">
		{Array(count)
			.fill(0)
			.map((_, i) => (
				<Flex key={i} gap={12}>
					<Skeleton.Avatar active size="default" />
					<Skeleton active paragraph={{ rows: 1 }} style={{ flex: 1 }} />
				</Flex>
			))}
	</Space>
);

/**
 * Triage Table Skeleton
 *
 * Displays skeleton that matches the admin table structure used in triage pages.
 * Matches exact column widths, row heights, and styling of actual admin tables.
 * Use for: PendingReview pages (Evaluation, OmniRom, Rehab, Survey)
 */
export const TriageTableSkeleton: React.FC<{ rows?: number }> = ({
	rows = 8,
}) => {
	// Skeleton bar matching actual text heights
	// Uses gray-200/gray-300 for visibility on white container
	const skeletonBar = (width: number, height: number): React.CSSProperties => ({
		width,
		height,
		borderRadius: 4,
		background: 'var(--color-gray-200)',
		animation: 'triage-skeleton-pulse 1.5s ease-in-out infinite',
	});

	const skeletonCircle = (size: number): React.CSSProperties => ({
		width: size,
		height: size,
		borderRadius: '50%',
		background: 'var(--color-gray-200)',
		animation: 'triage-skeleton-pulse 1.5s ease-in-out infinite',
		flexShrink: 0,
	});

	return (
		<>
			<style>
				{`
					@keyframes triage-skeleton-pulse {
						0%, 100% { opacity: 1; }
						50% { opacity: 0.4; }
					}
				`}
			</style>
			<div className="admin-table-container admin-table-container-normal">
				{/* Header */}
				<Flex
					style={{
						padding: 'var(--spacing-2) var(--spacing-4)',
						height: 44,
						backgroundColor: 'var(--surface-tertiary)',
					}}
					align="center"
				>
					<span style={{ width: '50%', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xs)', color: 'var(--table-header-text)' }}>Name</span>
					<span style={{ width: '35%', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xs)', color: 'var(--table-header-text)' }}>Session Date</span>
					<span style={{ width: '15%', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-xs)', color: 'var(--table-header-text)', textAlign: 'right' }}>Actions</span>
				</Flex>
				{/* Rows - height matches actual table: avatar 35px + padding 16px = 51px */}
				{Array.from({ length: rows }, (_, i) => (
					<Flex
						key={i}
						align="center"
						style={{
							padding: 'var(--spacing-2) var(--spacing-4)',
							borderBottom: '1px solid var(--border-default)',
						}}
					>
						{/* Name column: avatar + name/email */}
						<Flex align="center" gap={12} style={{ width: '50%' }}>
							<div style={skeletonCircle(35)} />
							<Flex vertical gap={2}>
								<div style={skeletonBar(140, 14)} />
								<div style={skeletonBar(180, 13)} />
							</Flex>
						</Flex>
						{/* Session Date column */}
						<Flex align="center" style={{ width: '35%' }}>
							<div style={skeletonBar(180, 13)} />
						</Flex>
						{/* Actions column - empty on skeleton */}
						<div style={{ width: '15%' }} />
					</Flex>
				))}
			</div>
		</>
	);
};

/**
 * Settings Skeleton
 *
 * Displays skeleton for settings page layouts.
 * Use for: Settings pages, preferences, configuration screens
 */
export const SettingsSkeleton: React.FC = () => (
	<Space direction="vertical" style={{ width: '100%' }} size="large">
		{Array(3)
			.fill(0)
			.map((_, i) => (
				<Card key={i}>
					<Skeleton.Input active style={{ width: 200, marginBottom: 16 }} />
					<Skeleton active paragraph={{ rows: 3 }} />
				</Card>
			))}
	</Space>
);

/**
 * Onboard Profile Form Skeleton
 *
 * Matches the OnboardProfileForm layout exactly:
 * - 2-col row (first name, last name) with icons
 * - Email input with icon
 * - Phone input with icon
 * - DOB label + 3 selects
 * - Weight: input with icon + unit select (Space.Compact)
 * - Height: input with icon + "Ft" suffix + inch input + unit select (Space.Compact, 3 elements)
 * - Gender select (full width)
 * - Consent checkbox with text
 * - OnboardFooter handles continue button separately
 */
export const OnboardProfileSkeleton: React.FC = () => {
	const inputHeight = 44;

	return (
		<div className="form-outer-div onboard-profile-form">
			<div className="form-div-onboard">
				<div className="form-container-onboard">
					{/* First name + Last name (2-col) - uses form-row-two-col class */}
					<div className="form-row-two-col">
						<div className="form-col">
							<Skeleton.Input
								active
								block
								style={{
									height: inputHeight,
									borderRadius: 'var(--radius-xl)',
								}}
							/>
						</div>
						<div className="form-col">
							<Skeleton.Input
								active
								block
								style={{
									height: inputHeight,
									borderRadius: 'var(--radius-xl)',
								}}
							/>
						</div>
					</div>

					{/* Email */}
					<div className="form-container-inner-div">
						<Skeleton.Input
							active
							block
							style={{ height: inputHeight, borderRadius: 'var(--radius-xl)' }}
						/>
					</div>

					{/* Phone */}
					<div className="form-container-inner-div">
						<Skeleton.Input
							active
							block
							style={{ height: inputHeight, borderRadius: 'var(--radius-xl)' }}
						/>
					</div>

					{/* DOB label + 3 selects */}
					<div className="form-conatiner-date-div">
						<Skeleton.Input
							active
							style={{ width: 100, height: 20, marginBottom: 8 }}
						/>
						<div className="form-container-date-inner-div">
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									flex: 1,
									borderRadius: 'var(--radius-xl)',
								}}
							/>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									flex: 1,
									borderRadius: 'var(--radius-xl)',
								}}
							/>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									flex: 1,
									borderRadius: 'var(--radius-xl)',
								}}
							/>
						</div>
					</div>

					{/* Weight: input + unit select (Space.Compact style) */}
					<div className="form-container-inner-div">
						<Flex>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									flex: 1,
									borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
								}}
							/>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									width: 70,
									borderRadius: '0 var(--radius-xl) var(--radius-xl) 0',
								}}
							/>
						</Flex>
					</div>

					{/* Height: ft input + inch input + unit select (Space.Compact, 3 elements) */}
					<div className="form-container-inner-div">
						<Flex>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									flex: 1,
									borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
								}}
							/>
							<Skeleton.Input
								active
								style={{ height: inputHeight, flex: 1, borderRadius: 0 }}
							/>
							<Skeleton.Input
								active
								style={{
									height: inputHeight,
									width: 70,
									borderRadius: '0 var(--radius-xl) var(--radius-xl) 0',
								}}
							/>
						</Flex>
					</div>

					{/* Gender select (full width) */}
					<div className="form-container-inner-div">
						<Skeleton.Input
							active
							block
							style={{ height: inputHeight, borderRadius: 'var(--radius-xl)' }}
						/>
					</div>

					{/* Consent checkbox + text */}
					<div className="form-container-inner-div">
						<Flex align="center" gap={8}>
							<Skeleton.Avatar active size={16} shape="square" />
							<Skeleton.Input active style={{ height: 16, width: 280 }} />
						</Flex>
					</div>
				</div>

				{/* OnboardFooter skeleton - matches fixed footer */}
				<div className="onboard-footer-spacer" />
			</div>
		</div>
	);
};

/**
 * Onboard Path Selection Skeleton (PatientPainStatus / Choose Your Path)
 *
 * Matches the plan card layout exactly:
 * - 3 cards (399x549px) with border-radius 2xl
 * - Each card has image area + gradient overlay + content area
 * - Content: title, description list, select button
 * - Centered flex layout with gap
 * - OnboardFooter handled separately
 */
export const OnboardPathSkeleton: React.FC<{ cardCount?: number }> = ({
	cardCount = 3,
}) => {
	const cardWidth = 399;
	const cardHeight = 549;

	return (
		<div className="container mx-auto mt-4">
			<Flex justify="center" gap={12}>
				{Array(cardCount)
					.fill(0)
					.map((_, i) => (
						<div
							key={i}
							style={{
								position: 'relative',
								width: cardWidth,
								height: cardHeight,
								borderRadius: 'var(--radius-2xl)',
								overflow: 'hidden',
								background: 'var(--surface-secondary)',
							}}>
							{/* Image placeholder (top 60% of card) - plain animated block */}
							<Skeleton.Button
								active
								block
								style={{
									width: '100%',
									height: '60%',
									borderRadius: 0,
								}}
							/>
						</div>
					))}
			</Flex>

			{/* Footer spacer (OnboardFooter skeleton) */}
			<div className="onboard-footer-spacer" />
		</div>
	);
};

/**
 * Onboard Pre-Existing Conditions Skeleton
 *
 * Matches the PreExistingCondition layout:
 * - 4 question cards with warning icon + text
 * - Checkbox acknowledgment at bottom
 * - Centered container max-width 764px
 * - OnboardFooter handled separately
 */
export const OnboardPreExistingSkeleton: React.FC<{ questionCount?: number }> = ({
	questionCount = 4,
}) => (
	<div className="pre-existing-wrapper">
		<div className="pre-existing-container">
			<div className="pre-existing-questions">
				{Array(questionCount)
					.fill(0)
					.map((_, i) => (
						<div key={i} className="pre-existing-question-card">
							{/* Warning icon placeholder */}
							<Skeleton.Avatar
								active
								size={16}
								shape="square"
								style={{ flexShrink: 0 }}
							/>
							{/* Question text */}
							<Skeleton.Input
								active
								style={{
									flex: 1,
									height: 20,
								}}
							/>
						</div>
					))}
			</div>

			{/* Checkbox acknowledgment */}
			<div className="pre-existing-acknowledge">
				<Flex align="center" gap={8}>
					<Skeleton.Avatar active size={16} shape="square" />
					<Skeleton.Input active style={{ height: 16, width: 320 }} />
				</Flex>
			</div>
		</div>

		<div className="onboard-footer-spacer" />
	</div>
);

/**
 * Onboard Functional Goals Skeleton
 *
 * Matches the FunctionalGoals layout:
 * - 2-column grid, max-width 960px
 * - 6 horizontal cards (120px height)
 * - Each card: image (50x90) + title + description
 * - OnboardFooter handled separately
 */
export const OnboardFunctionalGoalsSkeleton: React.FC<{ cardCount?: number }> = ({
	cardCount = 6,
}) => (
	<div className="functional-container">
		<div className="functional-cards-wrapper">
			<div className="functional-card-div">
				{Array(cardCount)
					.fill(0)
					.map((_, i) => (
						<div
							key={i}
							className="slide-container"
							style={{ cursor: 'default' }}>
							{/* Image placeholder */}
							<div className="slide-container-image-div">
								<Skeleton.Button
									active
									style={{
										width: 50,
										height: 90,
										borderRadius: 'var(--radius-md)',
									}}
								/>
							</div>
							{/* Text content */}
							<Flex vertical gap={8} style={{ flex: 1 }}>
								<Skeleton.Input
									active
									style={{ width: '60%', height: 18 }}
								/>
								<Skeleton.Input
									active
									style={{ width: '90%', height: 14 }}
								/>
								<Skeleton.Input
									active
									style={{ width: '75%', height: 14 }}
								/>
							</Flex>
						</div>
					))}
			</div>
		</div>

		<div className="onboard-footer-spacer" />
	</div>
);

/**
 * Onboard Whole Day Activity Skeleton
 *
 * Matches the WholeDayActivity layout:
 * - Segmented toggle (Basic/Advanced) at top
 * - Activity cards: 471px width, 120px height
 * - Each card: image (50x89) + title + slider with labels
 * - Default 3 cards (Basic mode)
 * - Total hours pill below
 * - OnboardFooter handled separately
 */
export const OnboardWholeDaySkeleton: React.FC<{ cardCount?: number }> = ({
	cardCount = 3,
}) => (
	<div className="activity-ring-chart-container">
		<div className="whole-day-content-wrapper">
			{/* Segmented toggle */}
			<Skeleton.Button
				active
				style={{
					width: 180,
					height: 40,
					borderRadius: 'var(--radius-xl)',
				}}
			/>

			{/* Activity cards */}
			<div className="activities-list">
				{Array(cardCount)
					.fill(0)
					.map((_, i) => (
						<div key={i} className="activity-card" style={{ cursor: 'default' }}>
							{/* Image placeholder */}
							<Skeleton.Button
								active
								style={{
									width: 50,
									height: 89,
									borderRadius: 'var(--radius-md)',
									flexShrink: 0,
								}}
							/>
							{/* Content */}
							<div className="activity-card-content">
								<Skeleton.Input
									active
									style={{ width: 80, height: 18 }}
								/>
								{/* Slider row: 0h label + slider + 24h label */}
								<Flex align="center" gap={10} style={{ width: '100%' }}>
									<Skeleton.Input
										active
										style={{ width: 24, height: 16 }}
									/>
									<Skeleton.Button
										active
										style={{
											flex: 1,
											height: 8,
											borderRadius: 'var(--radius-full)',
										}}
									/>
									<Skeleton.Input
										active
										style={{ width: 30, height: 16 }}
									/>
								</Flex>
							</div>
						</div>
					))}
			</div>

			{/* Total hours pill */}
			<Skeleton.Button
				active
				style={{
					width: 180,
					height: 36,
					borderRadius: 'var(--radius-2xl)',
				}}
			/>

			<div className="onboard-footer-spacer" />
		</div>
	</div>
);

// Export all skeletons
export default {
	UserListSkeleton,
	TableSkeleton,
	FormSkeleton,
	DashboardSkeleton,
	ChartSkeleton,
	ModalContentSkeleton,
	CardGridSkeleton,
	ActivityFeedSkeleton,
	TriageTableSkeleton,
	SettingsSkeleton,
	OnboardProfileSkeleton,
	OnboardPathSkeleton,
	OnboardPreExistingSkeleton,
	OnboardFunctionalGoalsSkeleton,
	OnboardWholeDaySkeleton,
};

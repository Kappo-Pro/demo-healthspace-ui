/**
 * common.ts
 *
 * Common enums and utility types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 10
 */

// ============================================================================
// COMMON TYPES (10 declarations)
// ============================================================================

export enum Status {
	newPatients = 'newPatients',
	outOfParams = 'outOfParams',
	pendingReview = 'pendingReview',
	reviewed = 'reviewed',
	escalationRequired = 'escalationRequired',
	followUpRequired = 'followUpRequired',
}

export type IStatusNormalized = Record<Status, string>;

export enum OverallConditionEnum {
	improving,
	noChange,
	worsening,
}

export interface Days {
	[key: string]: boolean;
}

export enum Sort {
	name = 'name',
	createdAt = 'createdAt',
}

export enum Side {
	LEFT = 'left',
	RIGHT = 'right',
}

export interface OnchangeStatus {
	sessionId: Session;
	status: Status;
	userId: string;
}

export interface IstatusIcon {
	outOfParams: React.ReactNode;
	pendingReview: React.ReactNode;
	reviewed: React.ReactNode;
	escalationRequired: React.ReactNode;
	followUpRequired: React.ReactNode;
}

export interface ShowPopStatus {
	showPopup: boolean;
}

export interface TSideFilters {
	id: string;
	attributes: {
		name: string;
	};
}

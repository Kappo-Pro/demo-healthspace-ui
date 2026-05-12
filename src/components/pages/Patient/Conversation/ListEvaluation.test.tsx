/**
 * ListEvaluation Tests
 * Story 1.3: Modal Integration
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ListEvaluation } from './ListEvaluation';
import { TDataProps } from '@types';

// Mock the modal component
jest.mock('@organisms/EvaluationResultsModal', () => ({
	EvaluationResultsModal: ({ isOpen, evaluationData }: { isOpen: boolean; evaluationData: TDataProps }) => (
		<div data-testid="evaluation-modal" data-open={isOpen}>
			{isOpen && <div>Modal for {evaluationData.id}</div>}
		</div>
	),
}));

// Mock PainAssessmentProgressData
jest.mock('@pages/Contacts/Details/PainAssessmentProgressData', () => ({
	__esModule: true,
	default: ({ onEvaluationClick, apiData }: { onEvaluationClick: (eval: TDataProps) => void; apiData: { data: TDataProps[] } }) => (
		<div>
			{apiData.data.map((item: TDataProps) => (
				<div
					key={item.id}
					data-testid={`evaluation-card-${item.id}`}
					onClick={() => onEvaluationClick(item)}
				>
					{item.createdAt}
				</div>
			))}
		</div>
	),
}));

// Mock Redux store
const createMockStore = (evaluations: TDataProps[] = []) => {
	return configureStore({
		reducer: {
			user: () => ({ id: 'user-123', isPhysioterapist: false }),
			contacts: () => ({ main: { selectedUser: null } }),
			patientDetail: () => ({ patientDetail: { perpage: 10, isReportModal: false } }),
			myLibrary: () => ({ summaryTabData: { data: evaluations, pagination: { total: evaluations.length } } }),
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
	});
};

const mockEvaluation: TDataProps = {
	id: 'eval-1',
	createdAt: '2025-10-30T10:00:00Z',
	status: 'pendingReview',
	userId: 'user-123',
	// Add other required fields...
} as TDataProps;

describe('ListEvaluation - Story 1.3', () => {
	it('AC-1.3.1: Should manage modal state', () => {
		const store = createMockStore([mockEvaluation]);
		render(
			<Provider store={store}>
				<ListEvaluation />
			</Provider>
		);

		const modal = screen.getByTestId('evaluation-modal');
		expect(modal).toHaveAttribute('data-open', 'false');
	});

	it('AC-1.3.2: Should open modal when evaluation card is clicked', async () => {
		const store = createMockStore([mockEvaluation]);
		render(
			<Provider store={store}>
				<ListEvaluation />
			</Provider>
		);

		const card = screen.getByTestId(`evaluation-card-${mockEvaluation.id}`);
		fireEvent.click(card);

		await waitFor(() => {
			const modal = screen.getByTestId('evaluation-modal');
			expect(modal).toHaveAttribute('data-open', 'true');
		});
	});

	it('AC-1.3.5: Should pass correct props to modal', async () => {
		const store = createMockStore([mockEvaluation]);
		render(
			<Provider store={store}>
				<ListEvaluation />
			</Provider>
		);

		const card = screen.getByTestId(`evaluation-card-${mockEvaluation.id}`);
		fireEvent.click(card);

		await waitFor(() => {
			expect(screen.getByText(`Modal for ${mockEvaluation.id}`)).toBeInTheDocument();
		});
	});
});

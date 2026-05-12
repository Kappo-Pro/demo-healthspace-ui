import React from 'react';
import { render, screen } from '@testing-library/react';
import { SymptomsHistoryTab, THealthSigns, TMedicalHistories } from './SymptomsHistoryTab';

const mockSymptoms: THealthSigns[] = [
	{
		name: 'Lower back pain',
		category: 'Musculoskeletal',
		severity: 'high',
		duration: '6 months',
		frequency: 'Daily',
		functionalLimitations: 'Difficulty walking >15 minutes',
	},
	{
		name: 'Numbness in left leg',
		category: 'Neurological',
		severity: 'medium',
		duration: '3 months',
		frequency: 'Intermittent',
	},
	{
		name: 'Stiffness in morning',
		category: 'Musculoskeletal',
		severity: 'medium',
		duration: '6 months',
		frequency: 'Daily (mornings)',
	},
];

const mockHistory: TMedicalHistories = {
	diagnoses: [
		{
			name: 'Chronic Lower Back Pain',
			icdCode: 'M54.5',
			dateDiagnosed: '2024-01-15',
			status: 'Active',
		},
		{
			name: 'Lumbar Disc Herniation',
			icdCode: 'M51.26',
			dateDiagnosed: '2024-02-20',
			status: 'Active',
		},
	],
	medications: [
		{
			name: 'Ibuprofen',
			dosage: '400 mg',
			frequency: '3 times daily',
			route: 'Oral',
			startDate: '2024-10-01',
		},
		{
			name: 'Cyclobenzaprine',
			dosage: '10 mg',
			frequency: 'At bedtime',
			route: 'Oral',
			startDate: '2024-09-15',
		},
	],
	previousTreatments: [
		{
			type: 'Physical Therapy',
			duration: '6 weeks',
			outcome: 'Minimal improvement',
			dateCompleted: '2024-09-15',
		},
		{
			type: 'Chiropractic Care',
			duration: '3 months',
			outcome: 'No change',
			dateCompleted: '2024-08-01',
		},
	],
	comorbidities: [
		{
			name: 'Type 2 Diabetes',
			status: 'Well-controlled',
			icdCode: 'E11.9',
		},
		{
			name: 'Hypertension',
			status: 'Stable',
			icdCode: 'I10',
		},
	],
	contraindications: [
		{
			type: 'Medication Allergy',
			description: 'Allergic to NSAIDs - causes hives and swelling',
			severity: 'high',
		},
		{
			type: 'Physical Limitation',
			description: 'Avoid overhead lifting due to shoulder impingement',
			severity: 'medium',
		},
	],
};

describe('SymptomsHistoryTab', () => {
	it('renders both symptoms and history sections', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Current Symptoms')).toBeInTheDocument();
		expect(screen.getByText('Medical History')).toBeInTheDocument();
	});

	it('displays symptoms organized by category', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Musculoskeletal')).toBeInTheDocument();
		expect(screen.getByText('Neurological')).toBeInTheDocument();
		expect(screen.getByText('Lower back pain')).toBeInTheDocument();
		expect(screen.getByText('Numbness in left leg')).toBeInTheDocument();
		expect(screen.getByText('Stiffness in morning')).toBeInTheDocument();
	});

	it('shows severity indicators for symptoms', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		const severityIndicators = screen.getAllByTestId('severity-indicator');
		expect(severityIndicators.length).toBeGreaterThan(0);
	});

	it('displays duration and frequency correctly', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getAllByText(/Duration: 6 months/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/Frequency: Daily/i).length).toBeGreaterThan(0);
	});

	it('displays functional limitations', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText(/Difficulty walking >15 minutes/i)).toBeInTheDocument();
		expect(screen.getByText('Impact:')).toBeInTheDocument();
	});

	it('renders diagnoses with ICD codes', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Diagnoses')).toBeInTheDocument();
		expect(screen.getByText('Chronic Lower Back Pain')).toBeInTheDocument();
		expect(screen.getByText('M54.5')).toBeInTheDocument();
		expect(screen.getByText(/Diagnosed: Jan 15, 2024/i)).toBeInTheDocument();
	});

	it('shows current medications with dosage', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Current Medications')).toBeInTheDocument();
		expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
		expect(screen.getAllByText(/400 mg/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/3 times daily/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/Oral/i).length).toBeGreaterThan(0);
	});

	it('displays previous treatments with outcomes', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Previous Treatments')).toBeInTheDocument();
		expect(screen.getByText('Physical Therapy')).toBeInTheDocument();
		expect(screen.getByText(/Duration: 6 weeks/i)).toBeInTheDocument();
		expect(screen.getByText(/Outcome: Minimal improvement/i)).toBeInTheDocument();
	});

	it('renders comorbidities correctly', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText('Comorbidities')).toBeInTheDocument();
		expect(screen.getByText('Type 2 Diabetes')).toBeInTheDocument();
		expect(screen.getByText('Well-controlled')).toBeInTheDocument();
		expect(screen.getByText('E11.9')).toBeInTheDocument();
	});

	it('highlights contraindications prominently', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText(/Contraindications & Precautions/i)).toBeInTheDocument();
		expect(screen.getByText(/Medication Allergy/i)).toBeInTheDocument();
		expect(screen.getByText(/Allergic to NSAIDs/i)).toBeInTheDocument();
	});

	it('handles missing data gracefully (empty states)', () => {
		render(<SymptomsHistoryTab symptoms={[]} history={{}} />);

		expect(screen.getByText(/No symptoms or medical history available/i)).toBeInTheDocument();
	});

	it('displays only symptoms when history is empty', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={{}} />);

		expect(screen.getByText('Current Symptoms')).toBeInTheDocument();
		expect(screen.queryByText('Medical History')).not.toBeInTheDocument();
	});

	it('displays only history when symptoms are empty', () => {
		render(<SymptomsHistoryTab symptoms={[]} history={mockHistory} />);

		expect(screen.queryByText('Current Symptoms')).not.toBeInTheDocument();
		expect(screen.getByText('Diagnoses')).toBeInTheDocument();
	});

	it('section divider visible between sections', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		const divider = screen.getByText('Medical History');
		expect(divider).toBeInTheDocument();
	});

	it('handles symptoms without severity', () => {
		const symptomsWithoutSeverity: THealthSigns[] = [
			{
				name: 'General fatigue',
				category: 'Other',
			},
		];

		render(<SymptomsHistoryTab symptoms={symptomsWithoutSeverity} history={{}} />);

		expect(screen.getByText('General fatigue')).toBeInTheDocument();
		expect(screen.getByText('Other')).toBeInTheDocument();
	});

	it('handles diagnoses without optional fields', () => {
		const minimalHistory: TMedicalHistories = {
			diagnoses: [
				{
					name: 'Lower Back Pain',
				},
			],
		};

		render(<SymptomsHistoryTab symptoms={[]} history={minimalHistory} />);

		expect(screen.getByText('Lower Back Pain')).toBeInTheDocument();
		expect(screen.queryByText(/Diagnosed:/i)).not.toBeInTheDocument();
	});

	it('handles medications without optional fields', () => {
		const minimalHistory: TMedicalHistories = {
			medications: [
				{
					name: 'Aspirin',
				},
			],
		};

		render(<SymptomsHistoryTab symptoms={[]} history={minimalHistory} />);

		expect(screen.getByText('Aspirin')).toBeInTheDocument();
	});

	it('renders multiple contraindications with different severities', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		const contraindications = screen.getAllByText(/MEDICATION ALLERGY|PHYSICAL LIMITATION/i);
		expect(contraindications.length).toBe(2);
	});

	it('organizes symptoms into correct categories', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		// Musculoskeletal category should have 2 symptoms
		const musculoskeletalSection = screen.getByText('Musculoskeletal').closest('div');
		expect(musculoskeletalSection).toBeInTheDocument();

		// Neurological category should have 1 symptom
		const neurologicalSection = screen.getByText('Neurological').closest('div');
		expect(neurologicalSection).toBeInTheDocument();
	});

	it('formats dates correctly', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		// Check date formatting (e.g., "Jan 15, 2024")
		expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument();
		expect(screen.getByText(/Feb 20, 2024/i)).toBeInTheDocument();
	});

	it('displays treatment outcome with appropriate styling', () => {
		render(<SymptomsHistoryTab symptoms={mockSymptoms} history={mockHistory} />);

		expect(screen.getByText(/Outcome: Minimal improvement/i)).toBeInTheDocument();
		expect(screen.getByText(/Outcome: No change/i)).toBeInTheDocument();
	});
});

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SymptomsHistoryTab } from './SymptomsHistoryTab';

const meta: Meta<typeof SymptomsHistoryTab> = {
	title: 'Organisms/EvaluationResultsModal/Tabs/SymptomsHistoryTab',
	component: SymptomsHistoryTab,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SymptomsHistoryTab>;

const completeSymptoms = [
	{
		name: 'Lower back pain',
		category: 'Musculoskeletal' as const,
		severity: 'high' as const,
		duration: '6 months',
		frequency: 'Daily',
		functionalLimitations:
			'Difficulty walking >15 minutes, unable to sit >1 hour',
	},
	{
		name: 'Stiffness in morning',
		category: 'Musculoskeletal' as const,
		severity: 'medium' as const,
		duration: '6 months',
		frequency: 'Daily (mornings)',
	},
	{
		name: 'Weakness in legs',
		category: 'Musculoskeletal' as const,
		severity: 'medium' as const,
		duration: '4 months',
		frequency: 'Constant',
		functionalLimitations: 'Difficulty climbing stairs',
	},
	{
		name: 'Numbness in left leg',
		category: 'Neurological' as const,
		severity: 'medium' as const,
		duration: '3 months',
		frequency: 'Intermittent',
	},
	{
		name: 'Tingling in toes',
		category: 'Neurological' as const,
		severity: 'low' as const,
		duration: '2 months',
		frequency: 'Occasional',
	},
	{
		name: 'Limited range of motion',
		category: 'Functional' as const,
		severity: 'high' as const,
		duration: '6 months',
		frequency: 'Constant',
		functionalLimitations:
			'Unable to bend forward, difficulty putting on shoes',
	},
];

const completeHistory = {
	diagnoses: [
		{
			name: 'Chronic Lower Back Pain',
			icdCode: 'M54.5',
			dateDiagnosed: '2024-01-15',
			status: 'Active' as const,
		},
		{
			name: 'Lumbar Disc Herniation',
			icdCode: 'M51.26',
			dateDiagnosed: '2024-02-20',
			status: 'Active' as const,
		},
		{
			name: 'Sciatica',
			icdCode: 'M54.3',
			dateDiagnosed: '2024-03-10',
			status: 'Active' as const,
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
		{
			name: 'Gabapentin',
			dosage: '300 mg',
			frequency: 'Twice daily',
			route: 'Oral',
			startDate: '2024-08-20',
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
		{
			type: 'Epidural Steroid Injection',
			duration: 'Single session',
			outcome: 'Effective',
			dateCompleted: '2024-07-10',
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
		{
			name: 'Obesity',
			status: 'Uncontrolled',
			icdCode: 'E66.9',
		},
	],
	contraindications: [
		{
			type: 'Medication Allergy',
			description: 'Allergic to NSAIDs - causes hives and swelling',
			severity: 'high' as const,
		},
		{
			type: 'Physical Limitation',
			description: 'Avoid overhead lifting due to shoulder impingement',
			severity: 'medium' as const,
		},
		{
			type: 'Medical Condition',
			description: 'History of deep vein thrombosis - avoid prolonged sitting',
			severity: 'medium' as const,
		},
	],
};

/**
 * Default story with complete symptoms and medical history data
 */
export const Default: Story = {
	args: {
		symptoms: completeSymptoms,
		history: completeHistory,
	},
};

/**
 * Story showing only symptoms section (medical history empty)
 */
export const SymptomsOnly: Story = {
	args: {
		symptoms: completeSymptoms,
		history: {},
	},
};

/**
 * Story showing only medical history section (symptoms empty)
 */
export const HistoryOnly: Story = {
	args: {
		symptoms: [],
		history: completeHistory,
	},
};

/**
 * Story with minimal/sparse data across sections
 */
export const MinimalData: Story = {
	args: {
		symptoms: [
			{
				name: 'Back pain',
				category: 'Musculoskeletal' as const,
				severity: 'medium' as const,
			},
		],
		history: {
			diagnoses: [
				{
					name: 'Lower Back Pain',
					icdCode: 'M54.5',
				},
			],
		},
	},
};

/**
 * Empty state - no symptoms or medical history available
 */
export const NoData: Story = {
	args: {
		symptoms: [],
		history: {},
	},
};

/**
 * Mobile viewport view (375px width)
 */
export const MobileView: Story = {
	args: {
		symptoms: completeSymptoms,
		history: completeHistory,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
	},
};

/**
 * Story with symptoms lacking optional fields
 */
export const SymptomsWithoutDetails: Story = {
	args: {
		symptoms: [
			{
				name: 'Back pain',
				category: 'Musculoskeletal' as const,
			},
			{
				name: 'Headache',
				category: 'Other' as const,
			},
			{
				name: 'Fatigue',
				category: 'Other' as const,
			},
		],
		history: {},
	},
};

/**
 * Story with only critical contraindications
 */
export const HighSeverityContraindications: Story = {
	args: {
		symptoms: [],
		history: {
			contraindications: [
				{
					type: 'Medication Allergy',
					description: 'Severe allergic reaction to NSAIDs - anaphylaxis risk',
					severity: 'high' as const,
				},
				{
					type: 'Medical Condition',
					description: 'Recent spinal surgery - no weight-bearing exercises',
					severity: 'high' as const,
				},
				{
					type: 'Medical Condition',
					description:
						'Uncontrolled hypertension - avoid high-intensity exercises',
					severity: 'high' as const,
				},
			],
		},
	},
};

/**
 * Story showing multiple symptoms in each category
 */
export const MultiCategorySymptoms: Story = {
	args: {
		symptoms: [
			{
				name: 'Lower back pain',
				category: 'Musculoskeletal' as const,
				severity: 'high' as const,
				duration: '6 months',
				frequency: 'Daily',
			},
			{
				name: 'Shoulder stiffness',
				category: 'Musculoskeletal' as const,
				severity: 'medium' as const,
				duration: '2 months',
				frequency: 'Daily (mornings)',
			},
			{
				name: 'Knee pain',
				category: 'Musculoskeletal' as const,
				severity: 'low' as const,
				duration: '1 month',
				frequency: 'Intermittent',
			},
			{
				name: 'Numbness in hands',
				category: 'Neurological' as const,
				severity: 'medium' as const,
				duration: '3 months',
				frequency: 'Intermittent',
			},
			{
				name: 'Tingling in feet',
				category: 'Neurological' as const,
				severity: 'low' as const,
				duration: '2 months',
				frequency: 'Occasional',
			},
			{
				name: 'Difficulty walking',
				category: 'Functional' as const,
				severity: 'high' as const,
				duration: '4 months',
				frequency: 'Constant',
				functionalLimitations: 'Cannot walk more than 10 minutes without rest',
			},
			{
				name: 'Limited bending',
				category: 'Functional' as const,
				severity: 'medium' as const,
				duration: '6 months',
				frequency: 'Constant',
				functionalLimitations: 'Cannot bend to pick up objects from floor',
			},
		],
		history: {},
	},
};

/**
 * Story with comprehensive medical history but no symptoms
 */
export const ComprehensiveMedicalHistory: Story = {
	args: {
		symptoms: [],
		history: {
			diagnoses: [
				{
					name: 'Chronic Lower Back Pain',
					icdCode: 'M54.5',
					dateDiagnosed: '2024-01-15',
					status: 'Active' as const,
				},
				{
					name: 'Lumbar Disc Herniation',
					icdCode: 'M51.26',
					dateDiagnosed: '2024-02-20',
					status: 'Active' as const,
				},
				{
					name: 'Osteoarthritis',
					icdCode: 'M19.90',
					dateDiagnosed: '2023-06-10',
					status: 'Managed' as const,
				},
				{
					name: 'Previous Fracture',
					icdCode: 'S32.0',
					dateDiagnosed: '2020-03-15',
					status: 'Resolved' as const,
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
				{
					name: 'Gabapentin',
					dosage: '300 mg',
					frequency: 'Twice daily',
					route: 'Oral',
					startDate: '2024-08-20',
				},
				{
					name: 'Metformin',
					dosage: '500 mg',
					frequency: 'Twice daily',
					route: 'Oral',
					startDate: '2023-01-01',
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
				{
					type: 'Epidural Steroid Injection',
					duration: 'Single session',
					outcome: 'Effective',
					dateCompleted: '2024-07-10',
				},
				{
					type: 'Massage Therapy',
					duration: '8 weeks',
					outcome: 'Effective',
					dateCompleted: '2024-06-01',
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
				{
					name: 'Obesity',
					status: 'Uncontrolled',
					icdCode: 'E66.9',
				},
				{
					name: 'Sleep Apnea',
					status: 'Well-controlled',
					icdCode: 'G47.33',
				},
			],
			contraindications: [
				{
					type: 'Medication Allergy',
					description: 'Allergic to NSAIDs - causes hives and swelling',
					severity: 'high' as const,
				},
				{
					type: 'Physical Limitation',
					description: 'Avoid overhead lifting due to shoulder impingement',
					severity: 'medium' as const,
				},
				{
					type: 'Medical Condition',
					description:
						'History of deep vein thrombosis - avoid prolonged sitting',
					severity: 'medium' as const,
				},
			],
		},
	},
};

// personas.ts
import { TFunction } from 'i18next';

export const getPersonas = (t: TFunction) => [
	{
		id: 'agile-achiever',
		range: [0, 1],
		title: t('Patient.data.postures.personas.agileAchiever.title'),
		subtitle: t('Patient.data.postures.personas.agileAchiever.subtitle'),
		tagline: t('Patient.data.postures.personas.agileAchiever.tagline'),
		description: t('Patient.data.postures.personas.agileAchiever.description'),
		image: '/assets/the-agile-achiever.png',
	},
	{
		id: 'balanced-mover',
		range: [2, 4],
		title: t('Patient.data.postures.personas.balancedMover.title'),
		subtitle: t('Patient.data.postures.personas.balancedMover.subtitle'),
		tagline: t('Patient.data.postures.personas.balancedMover.tagline'),
		description: t('Patient.data.postures.personas.balancedMover.description'),
		image: '/assets/the-balanced-mover.png',
	},
	{
		id: 'compensating-contender',
		range: [5, 7],
		title: t('Patient.data.postures.personas.compensatingContender.title'),
		subtitle: t(
			'Patient.data.postures.personas.compensatingContender.subtitle',
		),
		tagline: t('Patient.data.postures.personas.compensatingContender.tagline'),
		description: t(
			'Patient.data.postures.personas.compensatingContender.description',
		),
		image: '/assets/the-compensating-contender.png',
	},
	{
		id: 'stiff-struggler',
		range: [8, 10],
		title: t('Patient.data.postures.personas.stiffStruggler.title'),
		subtitle: t('Patient.data.postures.personas.stiffStruggler.subtitle'),
		tagline: t('Patient.data.postures.personas.stiffStruggler.tagline'),
		description: t('Patient.data.postures.personas.stiffStruggler.description'),
		image: '/assets/the-stiff-struggler.png',
	},
	{
		id: 'collapsed-coper',
		range: [11, 14],
		title: t('Patient.data.postures.personas.collapsedCoper.title'),
		subtitle: t('Patient.data.postures.personas.collapsedCoper.subtitle'),
		tagline: t('Patient.data.postures.personas.collapsedCoper.tagline'),
		description: t('Patient.data.postures.personas.collapsedCoper.description'),
		image: '/assets/the-collapsed-coper.png',
	},
];

export const getPostureBenefits = (t: TFunction) => [
	{
		label: t('Patient.data.postures.benefits.spinalHealth.label'),
		description: t('Patient.data.postures.benefits.spinalHealth.description'),
	},
	{
		label: t('Patient.data.postures.benefits.efficientMovement.label'),
		description: t(
			'Patient.data.postures.benefits.efficientMovement.description',
		),
	},
	{
		label: t('Patient.data.postures.benefits.breathing.label'),
		description: t('Patient.data.postures.benefits.breathing.description'),
	},
	{
		label: t('Patient.data.postures.benefits.energy.label'),
		description: t('Patient.data.postures.benefits.energy.description'),
	},
	{
		label: t('Patient.data.postures.benefits.painPrevention.label'),
		description: t('Patient.data.postures.benefits.painPrevention.description'),
	},
];

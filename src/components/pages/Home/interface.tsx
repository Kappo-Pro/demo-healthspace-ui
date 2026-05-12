export interface TStrapiHealthSignsAttributes {
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface TStrapiHealthSigns {
	id: number;
	attributes: TStrapiHealthSignsAttributes;
}

export interface TAssociatedSymptoms {
	id: string;
	userId: string;
	strapiHealthSignsIds: [];
	createdAt: string;
	updatedAt: string;
	strapiHealthSigns: TStrapiHealthSigns[];
}

export interface TMedicalHistoryAttributes {
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface TStrapiMedicalHistories {
	id: number;
	attributes: TMedicalHistoryAttributes;
}

export interface TMedicalHistory {
	id: string;
	userId: string;
	strapiMedicalHistoriesIds: [];
	createdAt: string;
	updatedAt: string;
	strapiMedicalHistories: TStrapiMedicalHistories[];
}

export interface TStrapiBodyPointAttributes {
	name: string;
	position: string;
}

export interface TStrapiBodyPoint {
	id: number;
	attributes: TStrapiBodyPointAttributes;
}

export interface TPainAssessment {
	id: string;
	userId: string;
	strapiBodyPointId: number;
	strapiAggravatingFactorsIds: [];
	strapiRelievingFactorsIds: [];
	strapiPainCausesIds: [];
	strapiPainDurationId: number;
	strapiPainFrequencyId: number;
	strapiPainStatusId: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	strapiBodyPoint: TStrapiBodyPoint;
}

export interface THealthSignsOptionsAttribute {
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
}

export interface THealthSignsOptions {
	id: number;
	name: string;
	locale: string;
}

//-------------------

export interface PainAssessments {
	id?: string | undefined;
	userId?: string;
	painLevel: number;
	strapiBodyPointId: number;
	strapiAggravatingFactorsIds: number[];
	strapiRelievingFactorsIds: number[];
	strapiPainCausesIds: number[];
	strapiPainDurationId: number;
	strapiPainFrequencyId: number;
	strapiPainStatusId: number;
	notes: string;
}

export interface HealthSigns {
	id?: string;
	userId?: string;
	strapiHealthSignsIds: number[];
	notes?: string;
}

export interface MedicalHistories {
	id?: string;
	userId?: string;
	strapiMedicalHistoriesIds: number[];
	notes?: string;
}

export interface EvaluationData {
	id?: string | undefined;
	userId?: string | undefined;
	painAssessments?: PainAssessments[] | undefined;
	healthSigns?: HealthSigns;
	medicalHistories?: MedicalHistories;
	notes?: string;
}
export interface EvaluationData {
    id?: string | undefined,
    userId?: string | undefined,
    painAssessments?: PainAssessments[] | undefined,
    healthSigns?: HealthSigns,
    medicalHistories?: MedicalHistories
}

export interface Options {
    id: number,
    locale: string,
    name: string
}

export interface TPayload {
  painAssessments?: PainAssessments[];
  healthSigns?: {
    strapiHealthSignsIds?: number[] | undefined;
    id?: string;
    userId?: string;
    notes?: string;
  };
  medicalHistories?: {
    strapiMedicalHistoriesIds?: number[];
    id?: string;
    userId?: string;
    notes?: string;
  };
  strapiHealthSignsIds?: number[];
  strapiMedicalHistoriesIds?: number[];
  id?: string;
  userId?: string;
  notes?: string;
}

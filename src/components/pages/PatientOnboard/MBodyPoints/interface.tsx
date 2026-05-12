export interface BodyPointOption {
  name: string
  key?: string
}
export interface BodyPointDropdownOption {
  name: string;
  key: string;
  options: TOptionFormatedType[];
  selectedOption: string | number | string[] | number[] | undefined;
}

export interface TFormDataType {
  userId?: string
  painLevel: number,
  strapiBodyPointId: number,
  strapiAggravatingFactorsIds: number[],
  strapiRelievingFactorsIds: number[],
  strapiPainCausesIds: number[],
  strapiPainDurationId: number,
  strapiPainFrequencyId: number,
  strapiPainStatusId: number,
  notes: string,
}

export interface TattributeType {
  name: string
  position: string
}

export interface TstrapiBodyPointTyp {
  id: number
  attributes: TattributeType
}

export interface TSavedDataType {
  id: string
  userId: string
  strapiBodyPointId: number,
  strapiAggravatingFactorsIds: [],
  strapiRelievingFactorsIds: [],
  strapiPainCausesIds: [],
  strapiPainDurationId: number,
  strapiPainFrequencyId: number,
  strapiPainStatusId: number
  active: boolean
  createdAt: string
  updatedAt: string
  strapiBodyPoint: TstrapiBodyPointTyp
}

export interface TStrapiAttributes {
  name: string
  position: string
}

export interface TStrapiRomStyle {
  top?: string | null
  left?: string | null
  right?: string | null
  bottom?: string | null
}

export interface TStrapiBodyPoints {
  id: number
  name: string
  position: string
  romStyle?: TStrapiRomStyle
  isSaved?: boolean
}

export interface TBodyOptionAttributeType {
  createdAt?: string
  locale?: string
  name?:string
  publishedAt?: string
  updatedAt?: string
}
export interface TBodyOptionType {
  createdAt?: string
  locale?: string
  name?:string
  publishedAt?: string
  updatedAt?: string
  id: number
}

export interface TOptionFormatedType {
  label?: string
  value?: number
}
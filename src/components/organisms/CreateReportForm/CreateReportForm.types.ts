import { Dayjs } from 'dayjs';

export interface ReportSection {
  id: string;
  checked: boolean;
  label: string;
  icon?: React.ReactNode;
}

export interface ReportSectionGroup {
  title: string;
  icon: React.ReactNode;
  sections: ReportSection[];
}

export interface CreateReportFormValues {
  reportName: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  selectedSections: string[];
}

export interface ReportSectionKey {
  evaluation: boolean;
  romSummary: boolean;
  romCaptures: boolean;
  postureCaptures: boolean;
  letsMoveSessions: boolean;
  surveySessions: boolean;
}

export interface CreateReportPayload {
  userId: string;
  name: string;
  evaluation: boolean;
  romSummary: boolean;
  romCaptures: boolean;
  letsMoveSessions: boolean;
  postureResults: boolean;
  surveyResults: boolean;
  startDate: string;
  endDate: string;
}

export interface CreateReportFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface ExportReportFormValues {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  tags: string[];
}

export interface ExportReportPayload {
  startDate: string | null;
  endDate: string | null;
  tags: string[];
}

export interface ExportReportFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Type definitions for the application's state and configuration
export type GeolocationStatus =
  | "pending"
  | "fetching_pincode"
  | "success"
  | "denied";
export type Language = "en" | "hi";

export interface FormFieldConfig {
  id: string;
  type: string;
  required: boolean;
  min?: number;
  max?: number;
  showWhen?: {
    fieldId: string;
    hasValue: any;
  };
}

export interface TranslationContent {
  pageTitle: string;
  pageSubtitle: string;
  cardTitle: string;
  submitButtonText: string;
  submittingButtonText: string;
  loadingText: string;
  fields: {
    [key: string]: {
      label: string;
      placeholder: string;
      options?: { value: string; label: string }[];
    };
  };
  links: { text: string; url: string }[];
}

export interface FormConfig {
  submitEndpoint: string;
  redirectEndpoint: string;
  redirectUrl: string;
  fields: FormFieldConfig[];
  translations: {
    en: TranslationContent;
    hi: TranslationContent;
  };
}

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Application, StructuredResume, Suggestion } from './hooks/useApplications'; // We can reuse interfaces from here for now

export interface WizardForm {
  jobTitle: string;
  company: string;
  jobDescription: string;
  jobPostingDate: string;
  deadline: string;
  jobLink: string;
  referralName: string;
  referralEmail: string;
}

interface AppState {
  applications: Application[];
  selectedApp: Application | null;
  loading: boolean;
  pdfCacheBuster: number;
  structuredData: StructuredResume;
  gatingError: {
    matchScore: number;
    suggestions: any[];
    error: string;
  } | null;
  wizardForm: WizardForm;
  resumeFileBase64: string | null;
  resumeFileName: string | null;
}

const initialState: AppState = {
  applications: [],
  selectedApp: null,
  loading: false,
  pdfCacheBuster: Date.now(),
  structuredData: {
    name: '',
    email: '',
    phone: '',
    summary: [],
    skills: [],
    experience: [],
    education: [],
    volunteer: [],
    projects: []
  },
  gatingError: null,
  wizardForm: {
    jobTitle: '',
    company: '',
    jobDescription: '',
    jobPostingDate: '',
    deadline: '',
    jobLink: '',
    referralName: '',
    referralEmail: '',
  },
  resumeFileBase64: null,
  resumeFileName: null,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },
    setSelectedApp: (state, action: PayloadAction<Application | null>) => {
      state.selectedApp = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPdfCacheBuster: (state, action: PayloadAction<number>) => {
      state.pdfCacheBuster = action.payload;
    },
    setStructuredData: (state, action: PayloadAction<StructuredResume>) => {
      state.structuredData = action.payload;
    },
    setGatingError: (state, action: PayloadAction<AppState['gatingError']>) => {
      state.gatingError = action.payload;
    },
    setWizardForm: (state, action: PayloadAction<Partial<WizardForm>>) => {
      state.wizardForm = { ...state.wizardForm, ...action.payload };
    },
    setResumeFile: (state, action: PayloadAction<{ base64: string | null; name: string | null }>) => {
      state.resumeFileBase64 = action.payload.base64;
      state.resumeFileName = action.payload.name;
    },
  },
});

export const {
  setApplications,
  setSelectedApp,
  setLoading,
  setPdfCacheBuster,
  setStructuredData,
  setGatingError,
  setWizardForm,
  setResumeFile,
} = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

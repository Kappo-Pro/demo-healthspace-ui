import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  myLibraryData: [],
  suggestedExercisesData: [],
  painAssessmentSavedBodyPointData: [],
  healthSignOptions: [],
  medicalHistoriesOptions: [],
  savedHealthSignData: [],
  savedMedicalHistoryData: []
}

const myLibraryInfoConfig = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    myLibraryInfo(state, action) {
      state.myLibraryData = action.payload
    },
    suggestedExercisesInfo(state, action) {
      state.suggestedExercisesData = action.payload
    },
    painAssessmentSavedBodyPointInfo(state, action) {
      state.painAssessmentSavedBodyPointData = action.payload
    },
    healthSignOptionsInfo(state, action) {
      state.healthSignOptions = action.payload
    },
    medicalHistoriesOptionsinfo(state, action) {
      state.medicalHistoriesOptions = action.payload
    }
  }
})

export const myLibraryInfoAction = myLibraryInfoConfig.actions;
export default myLibraryInfoConfig;
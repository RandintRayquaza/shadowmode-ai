import { createSlice } from '@reduxjs/toolkit';
import { uploadImageAndAnalyze, fetchAnalysisResult } from './analysisThunks';

const initialState = {
  currentImage: null,   // URL object or base64 for preview
  analysisId: null,     // Backend document ID
  loading: false,       // Is an analysis or upload currently running?
  result: null,         // The full result object containing scores and signals
  error: null,          // Any error during the process
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    resetAnalysis(state) {
      state.currentImage = null;
      state.analysisId = null;
      state.loading = false;
      state.result = null;
      state.error = null;
    },
    setCurrentImage(state, action) {
      state.currentImage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // uploadImageAndAnalyze
    builder.addCase(uploadImageAndAnalyze.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.result = null; // Clear previous result if any
      state.analysisId = null;
    });
    builder.addCase(uploadImageAndAnalyze.fulfilled, (state, action) => {
      state.analysisId = action.payload.id;
      // We keep loading=true here because the backend handles analysis asynchronously
      // and we immediately start polling via the component or thunk
    });
    builder.addCase(uploadImageAndAnalyze.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to upload image";
    });

    // fetchAnalysisResult
    builder.addCase(fetchAnalysisResult.fulfilled, (state, action) => {
      const data = action.payload;
      // When backend status is complete or failed, we stop loading
      if (data.status === 'complete' || data.status === 'analysis_failed') {
        state.result = data;
        state.loading = false;
      }
    });
    builder.addCase(fetchAnalysisResult.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch result";
    });
  },
});

export const { resetAnalysis, setCurrentImage } = analysisSlice.actions;
export default analysisSlice.reducer;

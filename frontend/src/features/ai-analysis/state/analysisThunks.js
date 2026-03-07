import { createAsyncThunk } from '@reduxjs/toolkit';
import { uploadAnalysisImage, fetchAnalysisResult as fetchApiResult } from '../api/analysisApi';

export const fetchAnalysisResult = createAsyncThunk(
  'analysis/fetchResult',
  async (analysisId, { rejectWithValue }) => {
    try {
      const data = await fetchApiResult(analysisId);
      return data;
    } catch (error) {
       return rejectWithValue(
         error.response?.data?.message || error.message || "Failed to fetch result"
       );
    }
  }
);

// We define a polling utility that can be dispatched or called
export const startPolling = createAsyncThunk(
  'analysis/poll',
  async (analysisId, { dispatch, getState }) => {
    return new Promise((resolve) => {
      const poll = async () => {
         const resultAction = await dispatch(fetchAnalysisResult(analysisId));
         if (fetchAnalysisResult.fulfilled.match(resultAction)) {
           const data = resultAction.payload;
           if (data.status === 'complete' || data.status === 'analysis_failed') {
             resolve(data);
           } else {
             // Continue polling
             setTimeout(poll, 2000);
           }
         } else {
           // If error, we stop polling
           resolve();
         }
      };
      
      // Initial poll after 2 seconds
      setTimeout(poll, 2000);
    });
  }
);

export const uploadImageAndAnalyze = createAsyncThunk(
  'analysis/uploadAndAnalyze',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const data = await uploadAnalysisImage(file);
      
      // Start polling immediately after successful upload
      dispatch(startPolling(data.id));
      
      return data; // contains { id, status, imageUrl ... }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Upload failed"
      );
    }
  }
);

export const loadExistingAnalysis = createAsyncThunk(
  'analysis/loadExisting',
  async (analysisId, { dispatch, getState }) => {
    const { analysis } = getState();
    // Don't re-trigger if we're already handling this exact ID
    if (analysis.analysisId === analysisId && (analysis.loading || analysis.result?.status === 'complete')) {
       return;
    }
    
    dispatch(fetchAnalysisResult(analysisId)).then((resultAction) => {
       if (fetchAnalysisResult.fulfilled.match(resultAction)) {
           const data = resultAction.payload;
           // If it's still pending, start polling
           if (data.status === 'pending') {
               dispatch(startPolling(analysisId));
           }
       }
    });

    return analysisId;
  }
);

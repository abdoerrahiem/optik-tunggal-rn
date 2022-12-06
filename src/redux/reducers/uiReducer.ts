import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import moment from 'moment';
import { LangType, UiRootState } from '../../types/redux';

export const uiSlice = createSlice<UiRootState, SliceCaseReducers<UiRootState>, 'ui'>({
  name: 'ui',
  initialState: {
    lang: 'id',
    theme: 'light',
  },
  reducers: {
    setLang: (state, action: PayloadAction<LangType>) => {
      moment.locale(action.payload);

      return {
        ...state,
        lang: action.payload,
      };
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      return {
        ...state,
        theme: action.payload,
      };
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  setLang: setUiLang,
  setTheme: setUiTheme,
} = uiSlice.actions;

export default uiSlice.reducer;

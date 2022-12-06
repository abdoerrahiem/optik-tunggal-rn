import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { UserModel } from '../../types/model';
import { UserRootState, UserLocation } from '../../types/redux';
import { fetchAddresses, setFavorites, toggleFavorite } from '../actions';

export const userSlice = createSlice<UserRootState, SliceCaseReducers<UserRootState>, 'user'>({
  name: 'user',
  initialState: {
    user: null,
    notifications: [],
    location: {
      lat: null,
      lng: null,
      address: null,
    },
    firebase: {},
    address: { models: [], modelsLoaded: false },
    favorites: [],
  },
  reducers: {
    setUser: (state, action: PayloadAction<UserModel>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
    setLocation: (state, action: PayloadAction<Partial<UserLocation>>) => {
      return {
        ...state,
        location: {
          ...state.location,
          ...action.payload
        }
      };
    },
    setFirebase: (state, action) => {
      return {
        ...state,
        firebase: {
          ...state.firebase,
          ...action.payload
        },
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        return {
          ...state,
          address: {
            ...state.address,
            models: action.payload,
            modelsLoaded: true
          },
        };
      })
      .addCase(setFavorites.fulfilled, (state, action) => {
        return {
          ...state,
          favorites: action.payload,
        };
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        return {
          ...state,
          favorites: action.payload,
        };
      });
  }
})

// Action creators are generated for each case reducer function
export const {
  setUser,
  setLocation: setUserLocation,
  setFirebase: setUserFirebase,
} = userSlice.actions;

export default userSlice.reducer;

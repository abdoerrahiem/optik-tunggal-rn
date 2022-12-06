import { configureStore } from '@reduxjs/toolkit'
import { userReducer, uiReducer, shopReducer } from './reducers';

const store = configureStore({
  reducer: {
    user: userReducer,
    ui: uiReducer,
    shop: shopReducer,
  },
});

export type RootStoreState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

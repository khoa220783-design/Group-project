import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer
        // Có thể thêm reducers khác sau này
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore các action này vì có thể chứa non-serializable values
                ignoredActions: ['auth/login/fulfilled', 'auth/logout/fulfilled']
            }
        }),
    devTools: process.env.NODE_ENV !== 'production' // Enable Redux DevTools
});

export default store;


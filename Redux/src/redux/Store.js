import { configureStore } from '@reduxjs/toolkit'
import { counterSlice } from './reducer/counterSlice'

export const Store = configureStore({
    reducer: {
        counter: counterSlice.reducer,
    },
})
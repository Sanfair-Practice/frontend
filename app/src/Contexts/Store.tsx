import {Provider} from "react-redux";
import React, {FC} from "react";
import {configureStore} from "@reduxjs/toolkit";
import chaptersReducer from "../Redux/Chapters"
import sectionsReducer from "../Redux/Sections"
import trainingsReducer from "../Redux/Trainings"

const store = configureStore({
    reducer: {
        chapters: chaptersReducer,
        sections: sectionsReducer,
        trainings: trainingsReducer,
    }
});
export type AppDispatch = typeof store.dispatch;

export const StoreProvider: FC = ({children}) => {

    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

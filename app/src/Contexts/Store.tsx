import {Provider} from "react-redux";
import React, {FC} from "react";
import {configureStore} from "@reduxjs/toolkit";
import chaptersReducer from "../Redux/Chapters"
import sectionsReducer from "../Redux/Sections"

export const StoreProvider: FC = ({children}) => {
    const store = configureStore({
        reducer: {
            chapters: chaptersReducer,
            sections: sectionsReducer,
        }
    });

    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

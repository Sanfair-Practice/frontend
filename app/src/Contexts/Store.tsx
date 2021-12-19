import {Provider} from "react-redux";
import React, {FC} from "react";
import {configureStore} from "@reduxjs/toolkit";
import chaptersReducer from "../Redux/Chapters"

export const StoreProvider: FC = ({children}) => {
    const store = configureStore({
        reducer: {
            chapters: chaptersReducer
        }
    });

    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

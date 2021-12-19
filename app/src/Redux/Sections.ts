import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../Contexts/Api";
import {ISectionRecord} from "../Api/Backend";
import {CombinedState} from "redux";

export enum Status {
    IDLE,
    LOADING,
    SUCCEEDED,
    FAILED,
}

interface State {
    status: Status,
    error: string | undefined
    sections: ISectionRecord[]
}

const initialState: State = {
    status: Status.IDLE,
    error: undefined,
    sections: [],
};

export const fetchSections = createAsyncThunk("sections/fetchAll", async () => {
    return api.getSections()
})

const sectionSlice = createSlice({
    name: "sections",
    initialState,
    reducers: {
        // omit existing reducers here
    },
    extraReducers(builder) {
        builder
            .addCase(fetchSections.pending, (state) => {
                state.status = Status.LOADING
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.status = Status.SUCCEEDED
                state.sections = action.payload
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.status = Status.FAILED
                state.error = action.error.message;
            })
    }
})

export const selectAll = (state: CombinedState<{sections: State}>): ISectionRecord[] => state.sections.sections;
export const selectStatus = (state: CombinedState<{sections: State}>): Status => state.sections.status;
export const selectError = (state: CombinedState<{sections: State}>): string | undefined => state.sections.error;

export default sectionSlice.reducer

import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../Contexts/Api";
import {IChapterRecord} from "../Api/Backend";
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
    chapters: IChapterRecord[]
}

const initialState: State = {
    status: Status.IDLE,
    error: undefined,
    chapters: [],
};

export const fetchChapters = createAsyncThunk("chapters/fetchAll", async () => {
    return api.getChapters()
})

const chapterSlice = createSlice({
    name: "chapters",
    initialState,
    reducers: {
        // omit existing reducers here
    },
    extraReducers(builder) {
        builder
            .addCase(fetchChapters.pending, (state) => {
                state.status = Status.LOADING
            })
            .addCase(fetchChapters.fulfilled, (state, action) => {
                state.status = Status.SUCCEEDED
                state.chapters = action.payload
            })
            .addCase(fetchChapters.rejected, (state, action) => {
                state.status = Status.FAILED
                state.error = action.error.message;
            })
    }
})

export const selectAllChapters = (state: CombinedState<{chapters: State}>): IChapterRecord[] => state.chapters.chapters;
export const chapterSliceStatus = (state: CombinedState<{chapters: State}>): Status => state.chapters.status;
export const chapterSliceError = (state: CombinedState<{chapters: State}>): string | undefined => state.chapters.error;

export default chapterSlice.reducer

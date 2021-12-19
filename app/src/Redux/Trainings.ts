import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import api from "../Contexts/Api";
import {ITestRecord} from "../Api/Backend";
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
    records: ITestRecord[]
}

const initialState: State = {
    status: Status.IDLE,
    error: undefined,
    records: [],
};

export const fetchTrainings = createAsyncThunk("trainings/fetchAll", async (user: number) => {
    return api.getTrainings(user)
})

interface CreateProps {
    user: number,
    data: string[]
}

export const createForChapters = createAsyncThunk("trainings/createForChapters", async ({user, data}: CreateProps) => {
    return api.createTrainingForChapters(user, data);
})
export const createForSections = createAsyncThunk("trainings/createForSections", async ({user, data}: CreateProps) => {
    return api.createTrainingForSections(user, data);
})

const trainingSlice = createSlice({
    name: "trainings",
    initialState,
    reducers: {
        // omit existing reducers here
    },
    extraReducers(builder) {
        builder
            .addCase(fetchTrainings.pending, (state) => {
                state.status = Status.LOADING
            })
            .addCase(fetchTrainings.fulfilled, (state, action) => {
                state.status = Status.SUCCEEDED
                state.records = action.payload
            })
            .addCase(fetchTrainings.rejected, (state, action) => {
                state.status = Status.FAILED
                state.error = action.error.message;
            })
            .addCase(createForChapters.fulfilled, (state, action) => {
                state.records.push(action.payload)
            })
            .addCase(createForSections.fulfilled, (state, action) => {
                state.records.push(action.payload)
            })
    }
})

export const selectAll = (state: CombinedState<{ trainings: State }>): ITestRecord[] => state.trainings.records;
export const selectStatus = (state: CombinedState<{ trainings: State }>): Status => state.trainings.status;
export const selectError = (state: CombinedState<{ trainings: State }>): string | undefined => state.trainings.error;

export default trainingSlice.reducer

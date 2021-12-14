import React, {FC, useState} from "react";
import Moment from "react-moment";
import {
    Button,
    ButtonGroup,
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useAsync} from "react-async-hook";
import {useApi, useUser} from "../Contexts";
import {ILoggedUser} from "../Models";
import {ITestRecord, TestStatus} from "../Api/Backend";
import {SectionForm} from "./SectionForm";
import {ChapterForm} from "./ChapterForm";
import {CustomForm} from "./CustomForm";
import {useNavigate} from "react-router-dom";
import {Router} from "../Helpers"
import {Modal} from "../Components/Modal"

const getAction = (training: ITestRecord): string => {
    switch (training.status) {
        case TestStatus.CREATED:
            return "Start";
        case TestStatus.STARTED:
            return "Continue";
        case TestStatus.PASSED:
        case TestStatus.FAILED:
        case TestStatus.EXPIRED:
        default:
            return "View";
    }
}

const Training: FC<{ training: ITestRecord }> = ({training}) => {
    const navigate = useNavigate();
    const action = getAction(training);

    return (
        <TableRow hover>
            <TableCell>{training.id}</TableCell>
            <TableCell>{training.type}</TableCell>
            <TableCell>{training.status}</TableCell>
            <TableCell align="center"><Moment format="YYYY/MM/DD HH:mm" date={training.created}/></TableCell>
            <TableCell size="small"><Button onClick={() => navigate(Router.linkTraining(training.id))}>{action}</Button></TableCell>
        </TableRow>
    )
}

const Trainings: FC<{ update: string }> = ({update}) => {
    const api = useApi();
    const {user} = useUser();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const callback = async (id: number, update: string) => await api.getTrainings(id);
    const trainings = useAsync(callback, [(user as ILoggedUser).id, update]);

    let content;
    if (trainings.loading) {
        content = <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>;
    } else if (trainings.error) {
        content = <TableRow><TableCell colSpan={4}>{trainings.error.message}</TableCell></TableRow>;
    } else if (trainings.result && trainings.result.length === 0) {
        content = <TableRow><TableCell colSpan={4}>No results.</TableCell></TableRow>;
    } else if (trainings.result) {
        content = <>{trainings.result.map((record) => <Training key={record.id} training={record}/>)}</>
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Date</TableCell>
                        <TableCell size="small">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {content}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const Menu: FC<{ setUpdate: React.Dispatch<string> }> = ({setUpdate}) => {
    const [form, setForm] = React.useState<React.ReactElement>();
    const clear = () => setForm(undefined);
    const onSubmit = (record: ITestRecord) => {
        clear()
        setUpdate(String(record.id));
    }
    const useSectionForm = () => setForm(React.createElement(SectionForm, {onSubmit}));
    const useChapterForm = () => setForm(React.createElement(ChapterForm, {onSubmit}));
    const useCustomForm = () => setForm(React.createElement(CustomForm, {onSubmit}));
    return (
        <Grid container justifyContent="center" p={2} component={Paper} position="sticky" top={"5rem"}>
            <ButtonGroup orientation="vertical">
                <Button onClick={useSectionForm}>Start section</Button>
                <Button onClick={useChapterForm}>Start chapter</Button>
                <Button onClick={useCustomForm}>Select configuration</Button>
            </ButtonGroup>
            <Modal open={form !== undefined} onClose={clear}>
                {form || <></>}
            </Modal>
        </Grid>
    )
}

export const Dashboard: FC = () => {
    const [update, setUpdate] = useState("");
    return (
        <Container>
            <Grid p={2} container columnSpacing={3}>
                <Grid item xs={3}>
                    <Menu setUpdate={setUpdate}/>
                </Grid>
                <Grid item xs={9}>
                    <Trainings update={update}/>
                </Grid>
            </Grid>
        </Container>
    )
}

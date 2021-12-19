import React, {FC, useEffect} from "react";
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
import {useUser} from "../Contexts";
import {ITestRecord, LoggedUser, TestStatus} from "../Api/Backend";
import {SectionForm} from "./SectionForm";
import {ChapterForm} from "./ChapterForm";
import {CustomForm} from "./CustomForm";
import {useNavigate} from "react-router-dom";
import {Router} from "../Helpers"
import {Modal} from "../Components/Modal"
import {useDispatch, useSelector} from "react-redux";
import {fetchTrainings, selectAll, selectError, selectStatus, Status} from "../Redux/Trainings";

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

const Trainings: FC = () => {
    const {user} = useUser();
    const dispatch = useDispatch()
    const trainings = useSelector(selectAll);
    const status = useSelector(selectStatus);
    const error = useSelector(selectError);

    useEffect(() => {
        if (status === Status.IDLE) {
            dispatch(fetchTrainings((user as LoggedUser).id))
        }
    }, [status, dispatch, user]);

    let content;
    if (status === Status.LOADING) {
        content = <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>;
    } else if (status === Status.FAILED) {
        content = <TableRow><TableCell colSpan={4}>{error}</TableCell></TableRow>;
    } else if (status === Status.SUCCEEDED && trainings.length === 0) {
        content = <TableRow><TableCell colSpan={4}>No results.</TableCell></TableRow>;
    } else if (status === Status.SUCCEEDED) {
        content = <>{trainings.map((record) => <Training key={record.id} training={record}/>)}</>
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

const Menu: FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = React.useState<React.ReactElement>();
    const clear = () => setForm(undefined);
    const onSubmit = (record: ITestRecord) => {
        clear();
        navigate(Router.linkTraining(record.id));
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
    return (
        <Container>
            <Grid p={2} container columnSpacing={3}>
                <Grid item xs={3}>
                    <Menu/>
                </Grid>
                <Grid item xs={9}>
                    <Trainings/>
                </Grid>
            </Grid>
        </Container>
    )
}

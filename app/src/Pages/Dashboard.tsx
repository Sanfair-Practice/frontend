import React, {FC, useState} from "react";
import Moment from "react-moment";
import {
    Box,
    Container,
    List,
    ListItem,
    ListItemText,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useAsync} from "react-async-hook";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {ILoggedUser} from "../Models";
import {ITrainingRecord} from "../Api/Backend";
import {SectionForm} from "./SectionForm";
import {ChapterForm} from "./ChapterForm";
import {CustomForm} from "./CustomForm";
import {useNavigate} from "react-router-dom";
import {Router} from "../Helpers"

const Training: FC<{ training: ITrainingRecord }> = ({training}) => {
    const navigate = useNavigate();
    return (
        <TableRow hover sx={{cursor: "pointer"}} onClick={() => navigate(Router.linkTraining(training.id))}>
            <TableCell>{training.id}</TableCell>
            <TableCell>{training.type}</TableCell>
            <TableCell>{training.status}</TableCell>
            <TableCell><Moment format="YYYY/MM/DD HH:mm" date={training.created}/></TableCell>
        </TableRow>
    )
}

const Trainings: FC<{ update: string }> = ({update}) => {
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
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
            <Table sx={{minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {content}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const style = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

const Menu: FC<{ setUpdate: React.Dispatch<string> }> = ({setUpdate}) => {
    const [form, setForm] = React.useState<React.ReactElement>();
    const clear = () => setForm(undefined);
    const onSubmit = (record: ITrainingRecord) => {
        clear()
        setUpdate(String(record.id));
    }
    const useSectionForm = () => setForm(React.createElement(SectionForm, {onSubmit}));
    const useChapterForm = () => setForm(React.createElement(ChapterForm, {onSubmit}));
    const useCustomForm = () => setForm(React.createElement(CustomForm, {onSubmit}));

    return (
        <>
            <List>
                <ListItem button onClick={useSectionForm}>
                    <ListItemText primary="Start section"/>
                </ListItem>
                <ListItem button onClick={useChapterForm}>
                    <ListItemText primary="Start chapter"/>
                </ListItem>
                <ListItem button onClick={useCustomForm}>
                    <ListItemText primary="Select configuration"/>
                </ListItem>
            </List>
            <Modal open={form !== undefined} onClose={clear}>
                <Box sx={{position: "absolute", ...style}}>
                    {form}
                </Box>
            </Modal>
        </>
    )
}

export const Dashboard: FC = () => {
    const [update, setUpdate] = useState("");
    return (
        <Container>
            <Box sx={{
                display: "flex",
                justifyContent: "space-around",
                p: 1,
                m: 1,
                bgcolor: "background.paper",
            }}>
                <Box sx={{m: 1}}>
                    <Menu setUpdate={setUpdate}/>
                </Box>
                <Box sx={{flexGrow: 1, m: 1}}>
                    <Trainings update={update}/>
                </Box>
            </Box>
        </Container>
    )
}

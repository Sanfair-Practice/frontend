import React, {FC} from "react";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {useAsync} from "react-async-hook";
import {ILoggedUser} from "../Models";
import {useParams} from "react-router-dom";
import {IChapterRecord, ISectionRecord, ITrainingRecord, IVariantRecord} from "../Api/Backend";
import {Box, Card, CardContent, Chip, Container, Grid, Typography} from "@mui/material";
import Moment from "react-moment";
import moment from "moment";

type TrainingParams = {
    id: string;
}

const Section: FC<{ section: ISectionRecord }> = ({section}) => {
    return <Chip label={section.name} size="small"/>
}

const Chapter: FC<{ chapter: IChapterRecord }> = ({chapter}) => {
    return <Chip label={chapter.name} size="small"/>
}

const Variant: FC<{variant: IVariantRecord}> = ({variant}) => {
    const time = moment.duration(variant.time, "minutes");
    return (
        <Card sx={{m: 1}}>
            <CardContent>
                <Line label="ID">{variant.id}</Line>
                <Line label="Status">{variant.status}</Line>
                <Line label="Time">{time.humanize()}</Line>
                {variant.end && (
                    <Line label="End"><Moment format="YYYY/MM/DD HH:mm:ss" unix date={variant.end}/></Line>
                )}
                <Line label="Allowed errors">{(variant.errors === -1) ? "Unlimited" : variant.errors}</Line>

            </CardContent>
        </Card>
    )
}

const Line: FC<{ label: string }> = ({label, children}) => {
    return (
        <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline"
        }}>
            <Typography variant="h6" component="div" mr={1}>{label}:</Typography>
            <Typography flexGrow={1} component="div">{children}</Typography>
        </Box>
    )
}

const Component: FC<{ training: ITrainingRecord }> = ({training}) => {

    const chapters = training.chapters && training.chapters.length > 0 ? training.chapters.map((chapter) => {
        return (
            <Grid item key={chapter.id}>
                <Chapter chapter={chapter}/>
            </Grid>
        )
    }) : null;
    const sections = training.sections && training.sections.length > 0 ? training.sections.map((section) => {
        return (
            <Grid item key={section.id} xs>
                <Section section={section}/>
            </Grid>
        )
    }) : null;

    const variants = training.variants && training.variants.length > 0 ? training.variants.map((variant) => {
        return (
            <Grid item key={variant.id} xs>
                <Variant variant={variant}/>
            </Grid>
        )
    }) : null;

    return (
        <Box component="main">
            <Container>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    p: 1,
                    m: 1,
                }}>
                    <Box m={1} p={2} flexGrow={1} flexBasis={"30%"}>
                        <Card sx={{m: 1}}>
                            <CardContent>
                                <Line label="ID">{training.id}</Line>
                                <Line label="Allowed errors">{(training.errors === -1) ? "Unlimited" : training.errors}</Line>
                                <Line label="Questions">{training.quantity}</Line>
                                <Line label="Type">{training.type}</Line>
                                <Line label="Created"><Moment format="YYYY/MM/DD HH:mm" date={training.created}/></Line>
                            </CardContent>
                        </Card>
                        {chapters &&
                            <Card sx={{m: 1}}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">Chapters</Typography>
                                    <Grid container spacing={3}>
                                        {chapters}
                                    </Grid>
                                </CardContent>
                            </Card>
                        }
                        {sections &&
                            <Card sx={{m: 1}}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">Sections</Typography>
                                    <Grid container spacing={3}>
                                        {sections}
                                    </Grid>
                                </CardContent>
                            </Card>
                        }
                    </Box>
                    <Box m={1} p={2} flexBasis={"70%"} flexGrow={3}>
                        {variants &&
                            <Grid container spacing={3}>
                                {variants}
                            </Grid>
                        }
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export const Training: FC = () => {
    const {id} = useParams<TrainingParams>()
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    const {user} = useUser();
    const callback = async (user: number, training: string | undefined) => {
        return training !== undefined ? await api.getTraining(user, +training) : null;
    };
    const training = useAsync(callback, [(user as ILoggedUser).id, id]);

    if (training.loading) {
        return <>Loading ...</>;
    }
    if (training.error) {
        return <>Error: {training.error}</>
    }
    if (!training.result) {
        return <>No training</>
    }

    return <Component training={training.result}/>
}

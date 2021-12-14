import React, {FC} from "react";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {useAsync} from "react-async-hook";
import {ILoggedUser} from "../Models";
import {Link as RouteLink, useNavigate, useParams} from "react-router-dom";
import {
    IChapterRecord,
    ISectionRecord,
    ITestRecord,
    IVariantRecord,
    TestStatus,
    VariantStatus
} from "../Api/Backend";
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
    Link,
    Stack,
    Typography
} from "@mui/material";
import {NavigateNext} from "@mui/icons-material"
import Moment from "react-moment";
import moment from "moment";
import {Router} from "../Helpers";
import {Countdown} from "../Components/Countdown";

const Section: FC<{ section: ISectionRecord }> = ({section}) => {
    return <Chip label={section.name} size="small"/>
}

const Chapter: FC<{ chapter: IChapterRecord }> = ({chapter}) => {
    return <Chip label={chapter.name} size="small"/>
}

const VariantActions: FC<{ variant: IVariantRecord }> = ({variant}) => {
    const navigate = useNavigate();
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    const {user} = useUser();
    const handleStart = async () => {
        const record = await api.startVariant((user as ILoggedUser).id, variant.test.id, variant.id);
        navigate(Router.linkVariant(record.test.id, record.id));
    }
    const handleView = () => {
        navigate(Router.linkVariant(variant.test.id, variant.id));
    }

    switch (variant.status) {
        case VariantStatus.CREATED:
            if (variant.test.status !== TestStatus.FAILED) {
                return <Button onClick={handleStart} size="small">Start</Button>;
            }
            return <></>;
        case VariantStatus.STARTED:
            if (variant.test.status !== TestStatus.FAILED) {
                return <Button onClick={handleView} size="small">Continue</Button>;
            }
            return <Button onClick={handleView} size="small">View</Button>;
        case VariantStatus.PASSED:
        case VariantStatus.FAILED:
        case VariantStatus.EXPIRED:
            return <Button onClick={handleView} size="small">View</Button>;
        default:
            return <></>;
    }
}

const Variant: FC<{ variant: IVariantRecord }> = ({variant}) => {
    const time = variant.time > 0 ? moment.duration(variant.time, "minutes") : null;
    const showTimer = variant.end && variant.status === VariantStatus.STARTED && Date.parse(variant.end) > Date.now();
    return (
        <Card>
            <CardHeader title={`Variant #${variant.id}`} subheader={variant.status}/>
            <CardContent>
                {!showTimer && time && (
                    <Line label="Time">{time.humanize()}</Line>
                )}
                {showTimer && (
                    <Line label="Time left"><Countdown format={"hh:mm:ss"} durationFromNow date={variant.end} interval={1000}/></Line>
                )}
                <Line label="Allowed errors">{(variant.errors === -1) ? "Unlimited" : variant.errors}</Line>
            </CardContent>
            <CardActions>
                <VariantActions variant={variant}/>
            </CardActions>
        </Card>
    )
}

const Line: FC<{ label: string }> = ({label, children}) => {
    return (
        <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="subtitle2" component="div">{label}:</Typography>
            <Typography variant="body2" component="div">{children}</Typography>
        </Stack>
    )
}

const TrainingInformation: FC<{ training: ITestRecord }> = ({training}) => {
    return (
        <Card>
            <CardHeader title={`Test #${training.id}`} subheader={training.type}/>
            <CardContent>
                <Line label="Allowed errors">
                    {(training.errors === -1) ? "Unlimited" : training.errors}
                </Line>
                <Line label="Questions in variant">{training.quantity}</Line>
                <Line label="Created">
                    <Moment format="YYYY/MM/DD HH:mm" date={training.created}/>
                </Line>
            </CardContent>
        </Card>
    )
}

const ChaptersInformation: FC<{ training: ITestRecord }> = ({training}) => {
    if (!training.chapters || training.chapters.length === 0) {
        return null
    }
    return (
        <Card>
            <CardHeader title="Chapters"/>
            <CardContent>
                <Grid container spacing={1}>
                    {training.chapters
                        .map(chapter => <Chapter key={chapter.id} chapter={chapter}/>)
                        .map(element => <Grid key={element.key} item>{element}</Grid>)
                    }
                </Grid>
            </CardContent>
        </Card>
    )
}
const SectionsInformation: FC<{ training: ITestRecord }> = ({training}) => {
    if (!training.sections || training.sections.length === 0) {
        return null
    }
    return (
        <Card>
            <CardHeader title="Sections"/>
            <CardContent>
                <Grid container spacing={1}>
                    {training.sections
                        .map(section => <Section key={section.id} section={section}/>)
                        .map(element => <Grid key={element.key} item>{element}</Grid>)
                    }
                </Grid>
            </CardContent>
        </Card>
    )
}


const Variants: FC<{ training: ITestRecord }> = ({training}) => {
    if (!training.variants || training.variants.length === 0) {
        return null
    }
    return (
        <Grid container columns={{ xs: 4 }} spacing={2}>
            {training.variants
                .map(variant => <Variant key={variant.id} variant={variant}/>)
                .map(element => <Grid xs={1} key={element.key} item>{element}</Grid>)
            }
        </Grid>
    )
}
const PageBreadcrumbs: FC<{ training: ITestRecord }> = ({training}) => {
    // TODO move to Breadcrumbs component.
    return (
        <Box m={2} px={2}>
            <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                <Link underline="hover" color="inherit" component={RouteLink} to={Router.linkHome()}>Dashboard</Link>
                <Link underline="hover" color="inherit" component={RouteLink} to={Router.linkHome()}>Trainings</Link>
                <Link underline="hover" color="text.primary" component={RouteLink} to={Router.linkTraining(training.id)}>Test #{training.id}</Link>
            </Breadcrumbs>
        </Box>
    );
}
const Component: FC<{ training: ITestRecord }> = ({training}) => {
    return (
        <Box component="main">
            <Container>
                <PageBreadcrumbs training={training} />
                <Grid px={2} container columnSpacing={3}>
                    <Grid item xs={3}>
                        <Stack spacing={2}>
                            <TrainingInformation training={training}/>
                            <ChaptersInformation training={training}/>
                            <SectionsInformation training={training}/>
                        </Stack>
                    </Grid>
                    <Grid item xs={9}>
                        <Variants training={training}/>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export const Training: FC = () => {
    const {training: id} = useParams<"training">()
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

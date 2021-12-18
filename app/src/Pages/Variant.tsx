import React, {FC, Fragment, useEffect, useState} from "react";
import {Link as RouteLink, useParams} from "react-router-dom";
import {NotFound} from "./NotFound";
import {useApi, useUser} from "../Contexts";
import {
    Choices,
    CompletedVariantStatuses,
    IQuestionRecord,
    IVariantInput,
    IVariantRecord,
    LoggedUser,
    TestStatus,
    VariantStatus
} from "../Api/Backend";
import {useAsync} from "react-async-hook";
import {
    Box,
    Breadcrumbs,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Typography
} from "@mui/material";
import {Loader} from "../Components/Loader";
import {Check, Clear, NavigateNext} from "@mui/icons-material";
import {Router} from "../Helpers";
import {ButtonProps} from "@mui/material/Button/Button";
import {Modal} from "../Components/Modal";
import {Countdown} from "../Components/Countdown";
import {useFormik} from "formik";
import * as Yup from "yup";
import moment from "moment";


const PageBreadcrumbs: FC<{ variant: IVariantRecord }> = ({variant}) => {
    // TODO move to Breadcrumbs component.
    return (
        <Box m={2} px={2}>
            <Breadcrumbs separator={<NavigateNext fontSize="small"/>}>
                <Link underline="hover" color="inherit" component={RouteLink} to={Router.linkHome()}>Dashboard</Link>
                <Link underline="hover" color="inherit" component={RouteLink} to={Router.linkHome()}>Trainings</Link>
                <Link underline="hover" color="inherit" component={RouteLink}
                      to={Router.linkTraining(variant.test.id)}>Test #{variant.test.id}</Link>
                <Link underline="hover" color="inherit" component={RouteLink}
                      to={Router.linkTraining(variant.test.id)}>Variants</Link>
                <Link underline="hover" color="text.primary" component={RouteLink}
                      to={Router.linkVariant(variant.test.id, variant.id)}>Variant #{variant.id}</Link>
            </Breadcrumbs>
        </Box>
    );
}

interface QuestionProps {
    question?: IQuestionRecord,
    choicesCallback: ChoicesCallback
}

const Question: FC<QuestionProps> = ({question, choicesCallback}) => {
    if (question === undefined) {
        return null;
    }

    const choices = choicesCallback(question);

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" gutterBottom>{question.text}</Typography>
                {choices}
            </CardContent>
        </Card>
    )
}

const PassedMessage: FC = () => (
    <Typography variant="inherit" color="success.main">You passed the test!</Typography>
)
const FailedMessage: FC = () => (
    <Typography variant="inherit" color="error.main">You failed the test!</Typography>
)
const TimeoutMessage: FC = () => (
    <Stack spacing={1}>
        <Typography variant="inherit" color="error.main">Time is over.</Typography>
        <Typography variant="inherit" color="error.main">Test failed!</Typography>
    </Stack>
)

interface StatusMessageProps {
    variant: IVariantRecord
}
const StatusMessage: FC<StatusMessageProps> = ({variant}) => {
    switch (variant.status) {
        case VariantStatus.PASSED:
            return <PassedMessage />
        case VariantStatus.FAILED:
            return <FailedMessage />
        case VariantStatus.EXPIRED:
            return <TimeoutMessage />
        default:
            throw new Error(`Invalid status: ${variant.status}`);
    }
}

interface StatusProps {
    variant: IVariantRecord
}
const Status: FC<StatusProps> = ({variant}) => {
    const showStatus = variant.status !== VariantStatus.STARTED;
    if (!showStatus) {
        return null;
    }
    return (
        <Grid item xs={2}>
            <Box component={Paper} p={2}>
                <Typography variant="h5" textAlign="center">
                    <StatusMessage variant={variant} />
                </Typography>
            </Box>
        </Grid>
    )
}

interface TimerProps {
    variant: IVariantRecord
}
const Timer: FC<TimerProps> = ({variant}) => {
    const showTimer = variant.status === VariantStatus.STARTED
        && variant.test.status === TestStatus.STARTED
        && variant.end
        && Date.parse(variant.end) > Date.now();
    if (!showTimer) {
        return null;
    }

    return (
        <Grid item xs={2}>
            <Box component={Paper} p={2}>
                <Stack>
                    <Typography mx="auto" variant="h4">Time left</Typography>
                    <Typography mx="auto" variant="h5">
                        <Countdown format={"mm:ss"} durationFromNow date={variant.end} interval={1000}/>
                    </Typography>
                </Stack>
            </Box>
        </Grid>
    )
}
type AnswerCallback = (question:IQuestionRecord, answer: string) => Promise<void>;

interface EditProps {
    question: IQuestionRecord,
    onAnswer: AnswerCallback
    onContinue: ContinueCallback
}
const Edit: FC<EditProps> = ({question, onAnswer, onContinue}) => {

    const formik = useFormik({
        initialValues: {
            answer: "",
        },
        validationSchema: Yup.object({
            answer: Yup.string(),
        }),
        onSubmit: async (values) => {
            if (values.answer === "") {
                onContinue();
            }
            else {
                await onAnswer(question, values.answer);
            }
        }
    });
    const handleClick = () => {
        formik.resetForm();
    }

    const choices = Object.entries(question.choices).map(([key, value], index) => {
        return (
            <Fragment key={key}>
                {index !== 0 && <Divider/>}
                <ListItem>
                    <FormControlLabel value={key} label={value} control={<Radio sx={{p: 1}} onClick={handleClick}/>}/>
                </ListItem>
            </Fragment>
        )
    });

    const label = formik.values.answer ? "Submit" : "Continue";

    return (
        <Box m={3} width={1 / 4}>
            <form onSubmit={formik.handleSubmit}>
                <RadioGroup name="answer" value={formik.values.answer} onChange={formik.handleChange}>
                    <List>
                        {choices}
                    </List>
                </RadioGroup>
                <Button fullWidth variant="contained" type="submit">{label}</Button>
            </form>
        </Box>
    );

}
interface ViewProps {
    choices: Choices,
    input?: IVariantInput
    onContinue: ContinueCallback
}
const View: FC<ViewProps> = ({choices, input, onContinue}) => {
    const items = Object.entries(choices).map(([key, value], index) => {
        let icon = <></>;
        let color = "text.main";
        if (input?.correct === key) {
            color = "success.main";
            icon = <ListItemIcon sx={{color: "success.main"}}><Check/></ListItemIcon>
        } else if (input?.submitted === key) {
            color = "error.main";
            icon = <ListItemIcon sx={{color: "error.main"}}><Clear/></ListItemIcon>
        }
        return (
            <Fragment key={key}>
                {index !== 0 && <Divider/>}
                <ListItem sx={{color: color}}>
                    <ListItemText primary={value} sx={{ my: 1}}/>
                    {icon}
                </ListItem>
            </Fragment>
        )
    });
    return (
        <Box m={3} width={1 / 4}>
            <List>
                {items}
            </List>
            <Button fullWidth variant="contained" onClick={onContinue}>Continue</Button>
        </Box>
    );
}

type QuestionStatus = "questioned" | "success" | "fail";
const getQuestionStatus = (variant: IVariantRecord, question: IQuestionRecord): QuestionStatus => {
    const input = variant.input[question.id];
    if (!input) {
        return "questioned"
    }
    return input.correct === input.submitted ? "success" : "fail"
}

enum Action {
    VIEW,
    EDIT
}
const getCurrentAction = (variant: IVariantRecord, question?: IQuestionRecord): Action => {
    switch (variant.test.status) {
        case TestStatus.PASSED:
        case TestStatus.FAILED:
        case TestStatus.EXPIRED:
            return Action.VIEW;
    }
    switch (variant.status) {
        case VariantStatus.CREATED:
        case VariantStatus.PASSED:
        case VariantStatus.FAILED:
        case VariantStatus.EXPIRED:
            return Action.VIEW;
    }

    if (question && variant.input[question.id]?.correct) {
        return Action.VIEW;
    }

    return Action.EDIT;
}

type ChoicesCallback = (question: IQuestionRecord) => React.ReactElement | null;
type ContinueCallback = () => void;
const getChoicesCallback = (variant: IVariantRecord, onAnswer: AnswerCallback, onContinue: ContinueCallback): ChoicesCallback => (question: IQuestionRecord) => {
    switch (getCurrentAction(variant, question)) {
        case Action.VIEW:
            const viewProps = {
                choices: question.choices,
                input: variant.input[question.id],
                onContinue: onContinue,
            }
            return View(viewProps);
        case Action.EDIT:
            return Edit({question, onAnswer, onContinue});
    }
}

const getNextQuestion = (variant: IVariantRecord, question?: IQuestionRecord): IQuestionRecord | undefined => {
    const index = variant.questions?.findIndex(item => item.id === question?.id)
    if (index === undefined) {
        return variant.questions?.find(Boolean);
    }
    switch (getCurrentAction(variant)) {
        case Action.VIEW:
            return variant.questions?.[index + 1] ?? variant.questions?.[0];
        case Action.EDIT:
            const next = variant.questions?.find((item, i) => !variant.input[item.id] && i > index)
                ?? variant.questions?.find((item, i) => !variant.input[item.id] && i < index)
            if (next) {
                return next;
            }
    }
    return undefined;
}

interface MainProps {
    variant: IVariantRecord,
    onAnswer: AnswerCallback
}
const Main: FC<MainProps> = ({variant, onAnswer}) => {
    const [page, setPage] = useState(0);
    const [activeQuestion, setActive] = useState(() => getNextQuestion(variant));
    const [completed, setCompleted] = useState(CompletedVariantStatuses.includes(variant.status));
    const [completeModal, toggleModal] = useState(false);

    const length = variant.questions?.length || 0;
    const perPage = 10;
    const min = 0;
    const max = Math.floor((length > 0 ? length - 1 : length) / perPage);

    const closeModal = () => toggleModal(false);
    const openModal = () => toggleModal(true);
    const handleBack = () => setPage((page) => {
        return page > min ? page - 1 : min;
    });
    const handleNext = () => setPage((page) => {
        return page < max ? page + 1 : max;
    });
    const handleSwitch = (nextQuestion: IQuestionRecord) => {
        const index = variant.questions
            ?.findIndex((question) => question.id === nextQuestion.id);

        if (index !== undefined) {
            setActive(nextQuestion);
            const page = Math.floor(index / perPage);
            setPage(page);
        }
    }

    const handleContinue = () => {
        const next = getNextQuestion(variant, activeQuestion);
        console.log(activeQuestion, next);
        if (next) {
            handleSwitch(next);
        }
    }

    const choicesCallback = getChoicesCallback(variant, onAnswer, handleContinue);


    const buttons = variant.questions?.slice(page * perPage, (page + 1) * perPage)
        .map((question, index) => {
            const active = question.id === activeQuestion?.id;
            const color = (() => {
                switch (getQuestionStatus(variant, question)) {
                    case "questioned":
                        return "primary"
                    case "success":
                        return "success"
                    case "fail":
                        return "error"
                }
            })();


            const props: ButtonProps = {
                color,
                variant: active ? "contained" : "outlined",
                onClick: () => handleSwitch(question),
            };

            const label = page * perPage + index + 1;
            return <Button key={question.id} {...props}>{label}</Button>
        });
    if (buttons && buttons.length < perPage) {
        for (let i = buttons.length; i < perPage; i++) {
            buttons?.push(<Button key={`empty-${i}`} disabled />);
        }
    }
    if (max > 0) {
        buttons?.unshift(<Button onClick={handleBack} key="back" disabled={page <= min}>Back</Button>);
        buttons?.push(<Button onClick={handleNext} key="next" disabled={page >= max}>Next</Button>);
    }

    useEffect(() => {
        if (!completed && CompletedVariantStatuses.includes(variant.status)) {
            setCompleted(true);
            openModal();
        }
    }, [variant, completed]);

    return (
        <Box>
            <Box p={1} mb={2} component={Paper}>
                <ButtonGroup fullWidth disableElevation size="large">{buttons}</ButtonGroup>
            </Box>
            <Grid container columnSpacing={2}>
                <Grid item xs>
                    <Question question={activeQuestion} choicesCallback={choicesCallback}/>
                </Grid>
                <Timer variant={variant}/>
                <Status variant={variant} />
            </Grid>
            <Modal open={completeModal} onClose={closeModal}>
                <Typography variant="h3" textAlign="center">
                    <StatusMessage variant={variant} />
                </Typography>
            </Modal>
        </Box>
    )
}


interface PageProps {
    training_id: number,
    variant_id: number,
    user: LoggedUser
}

const Page: FC<PageProps> = ({user, training_id, variant_id}) => {
    const api = useApi();
    const callback = async (user: number, training: number, variant: number) => {
        return api.getVariant(user, training, variant);
    };
    const result = useAsync(callback, [user.id, training_id, variant_id]);
    const handleAnswer = async (question: IQuestionRecord, answer: string) => {
        const record = await api.answerQuestion({
            user: user.id,
            training: training_id,
            variant: variant_id,
            question: question.id,
            answer: answer
        });
        result.merge({result: record});
    }

    useEffect(() => {
        if (result.result?.status === VariantStatus.STARTED && result.result?.end) {
            const record = result.result;
            const diff = moment(record.end).diff(moment());
            if (diff > 0) {
                const id = setTimeout(() => {
                    result.merge({result: {...record, status: VariantStatus.EXPIRED}});
                }, diff);

                return () => clearTimeout(id);
            }
        }
    }, [result]);


    if (!result.result) {
        return <NotFound/>
    }

    let content = <NotFound/>;
    if (result.loading) {
        content = (
            <Loader>
                <Typography>Loading variant</Typography>
            </Loader>
        )
    }
    if (result.error) {
        // TODO Error component.
        content = <>Error: {result.error}</>
    }


    if (result.result) {
        content = (
            <>
                <PageBreadcrumbs variant={result.result}/>
                <Main variant={result.result} onAnswer={handleAnswer}/>
            </>
        )
    }
    return (
        <Box component="main">
            <Container>
                {content}
            </Container>
        </Box>
    );
}

export const Variant: FC = () => {
    const {training, variant} = useParams();
    const {user} = useUser();

    if (variant === undefined || training === undefined || user === undefined) {
        return <NotFound/>
    }

    const props: PageProps = {
        training_id: +training,
        variant_id: +variant,
        user
    }
    return <Page {...props}/>

}

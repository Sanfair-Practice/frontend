import React, {FC, Fragment, useEffect, useState} from "react";
import {Link as RouteLink, Navigate, useParams} from "react-router-dom";
import {NotFound} from "./NotFound";
import {IQuestionRecord, IVariantInput, IVariantRecord, TestStatus, VariantStatus} from "../Api/Backend";
import {useApi, useUser} from "../Contexts";
import {useAsync} from "react-async-hook";
import {ILoggedUser} from "../Models";
import {Router} from "../Helpers";
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
import {Check, Clear, NavigateNext} from "@mui/icons-material"
import {ButtonProps} from "@mui/material/Button/Button";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Countdown} from "../Components/Countdown";
import {Modal} from "../Components/Modal";
import moment from "moment";

type Color = "primary" | "success" | "error" | "default";

interface ChoicesProps {
    question: IQuestionRecord,
    input: IVariantInput
    onContinue: ContinueCallback
}

const Choices: FC<ChoicesProps> = ({question, input, onContinue}) => {
    const choices = Object.entries(question.choices).map(([key, value], index) => {
        let icon = <></>;
        let color = "text.main";
        if (input.correct === key) {
            color = "success.main";
            icon = <ListItemIcon sx={{color: "success.main"}}><Check/></ListItemIcon>
        } else if (input.submitted === key) {
            color = "error.main";
            icon = <ListItemIcon sx={{color: "error.main"}}><Clear/></ListItemIcon>
        }
        return (
            <Fragment key={key}>
                {index !== 0 && <Divider/>}
                <ListItem sx={{color: color}}>
                    <ListItemText primary={value}/>
                    {icon}
                </ListItem>
            </Fragment>
        )
    });
    return (
        <Box m={3} width={1 / 4}>
            <List>
                {choices}
            </List>
            <Button fullWidth variant="contained" onClick={onContinue}>Continue</Button>
        </Box>
    );
}
const FormChoices: FC<{ question: IQuestionRecord, onAnswer: AnswerCallback }> = ({question, onAnswer}) => {
    const formik = useFormik({
        initialValues: {
            answer: "",
        },
        validationSchema: Yup.object({
            answer: Yup
                .string()
                .required(),
        }),
        onSubmit: async (values) => {
            await onAnswer(question, values.answer);
        }
    });

    const choices = Object.entries(question.choices).map(([key, value], index) => {
        return (
            <Fragment key={key}>
                {index !== 0 && <Divider/>}
                <ListItem>
                    <FormControlLabel value={key} label={value} control={<Radio/>}/>
                </ListItem>
            </Fragment>
        )
    });
    return (
        <Box m={3} width={1 / 4}>
            <form onSubmit={formik.handleSubmit}>
                <RadioGroup name="answer" onChange={formik.handleChange}>
                    <List>
                        {choices}
                    </List>
                </RadioGroup>
                <Button fullWidth variant="contained" type="submit">Submit</Button>
            </form>
        </Box>
    );
}

interface QuestionProps {
    question: IQuestionRecord,
    input?: IVariantInput,
    onAnswer: AnswerCallback
    onContinue: ContinueCallback
}

const Question: FC<QuestionProps> = ({question, input, onAnswer, onContinue}) => {
    const choices = input ? <Choices question={question} input={input} onContinue={onContinue}/> :
        <FormChoices question={question} onAnswer={onAnswer}/>;
    return (
        <Card>
            <CardContent>
                <Typography variant="h4">{question.text}</Typography>
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

const StatusMessage: FC<{variant: IVariantRecord}> = ({variant}) => {
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
const Status: FC<{variant: IVariantRecord}> = ({variant}) => {
    if (variant.status === VariantStatus.STARTED) {
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
const Timer: FC<{variant: IVariantRecord}> = ({variant}) => {
    if (variant.status !== VariantStatus.STARTED || !variant.end || Date.parse(variant.end) < Date.now()) {
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
const ShowVariant: FC<{ variant: IVariantRecord, onAnswer: AnswerCallback }> = ({variant, onAnswer}) => {
    const answered = Object.entries(variant.input).map(([index]) => {
        return +index;
    });
    const questioned = (question: IQuestionRecord) => {
        return !answered.includes(question.id);
    }

    const [page, setPage] = useState(1);
    const [activeQuestion, setActive] = useState(
        variant.questions?.find(questioned) ??
        variant.questions?.find(Boolean)
    );
    const [completed, setCompleted] = useState(variant.status !== VariantStatus.STARTED);
    const [completeModal, toggleModal] = useState(false);
    const closeModal = () => toggleModal(false);
    const openModal = () => toggleModal(true);

    useEffect(() => {
        if (!completed && variant.status !== VariantStatus.STARTED) {
            setCompleted(true);
            openModal();
        }
    }, [variant, completed]);

    const max = (variant.questions?.length || 0) / 10;

    const handleBack = () => setPage((page) => {
        return page > 1 ? page - 1 : page;
    });
    const handleNext = () => setPage((page) => {
        return page < max ? page + 1 : max;
    });
    const handleContinue = () => {
        const next = variant.questions?.find(questioned)
        if (next && variant.test.status !== TestStatus.FAILED) {
            setActive(next);
            return;
        }
        const index = variant.questions?.findIndex((question) => question.id === activeQuestion?.id);
        if (index === undefined) {
            return;
        }

        setActive(variant.questions?.[index + 1] ?? variant.questions?.[0]);
    }
    const getInput = (question: IQuestionRecord) => {
        const input = variant.input[question.id];
        if (!input && variant.test.status === TestStatus.FAILED) {
            return {
                submitted: "",
                correct: "",
                value: "",
            }
        }
        return input;
    }

    const buttons = variant.questions?.map((question, index) => {
        const active = question.id === activeQuestion?.id;
        let color: Color = "primary";
        if (answered.includes(question.id)) {
            const input = variant.input[question.id]
            color = input.correct === input.submitted ? "success" : "error";
        }
        const props: ButtonProps = {
            color,
            variant: active ? "contained" : "outlined",
            onClick: () => setActive(question),
        };

        return <Button key={question.id} {...props}>{index + 1}</Button>
    }).slice((page - 1) * 10, page * 10);
    if (max > 1) {
        buttons?.unshift(<Button onClick={handleBack} key="back" disabled={page === 1}>Back</Button>);
        buttons?.push(<Button onClick={handleNext} key="next" disabled={page === max}>Next</Button>);
    }

    const question = activeQuestion ?
        <Question key={activeQuestion.id} question={activeQuestion} onAnswer={onAnswer} onContinue={handleContinue}
                  input={getInput(activeQuestion)}/> : <></>
    return (
        <Box>
            <Box p={1} mb={2} component={Paper}>
                <ButtonGroup fullWidth disableElevation size="large">{buttons}</ButtonGroup>
            </Box>
            <Grid container columnSpacing={2}>
                <Grid item xs>
                    {question}
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

const Page: FC<{ variant: IVariantRecord, onAnswer: AnswerCallback }> = ({variant, onAnswer}) => {
    switch (variant.status) {
        case VariantStatus.CREATED:
            return <Navigate to={Router.linkTraining(variant.test.id)}/>;
        case VariantStatus.STARTED:
        case VariantStatus.PASSED:
        case VariantStatus.FAILED:
        case VariantStatus.EXPIRED:
            return <ShowVariant variant={variant} onAnswer={onAnswer}/>;
    }
}

interface AnswerCallback {
    (question: IQuestionRecord, answer: string): Promise<void>
}

interface ContinueCallback {
    (): void
}

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

const AsyncPage: FC<{ trainingId: number, variantId: number }> = ({trainingId, variantId}) => {
    const {user} = useUser();
    const api = useApi();
    const callback = async (user: number, training: number, variant: number) => {
        return api.getVariant(user, training, variant);
    };
    const result = useAsync(callback, [(user as ILoggedUser).id, trainingId, variantId]);
    const handleAnswer: AnswerCallback = async (question, answer) => {
        const record = await api.answerQuestion({
            user: (user as ILoggedUser).id,
            training: trainingId,
            variant: variantId,
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

    if (result.loading) {
        return <>Loading ...</>;
    }
    if (result.error) {
        return <>Error: {result.error}</>
    }
    if (!result.result) {
        return <NotFound/>
    }
    return (
        <Box component="main">
            <Container>
                <PageBreadcrumbs variant={result.result}/>
                <Page variant={result.result} onAnswer={handleAnswer}/>
            </Container>
        </Box>
    );
}

export const Variant: FC = () => {
    const {training, variant} = useParams();

    if (variant === undefined || training === undefined) {
        return <NotFound/>
    }

    return <AsyncPage trainingId={+training} variantId={+variant}/>;
}

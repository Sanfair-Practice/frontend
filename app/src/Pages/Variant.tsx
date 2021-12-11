import React, {FC, Fragment, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {NotFound} from "./NotFound";
import {IQuestionRecord, IVariantInput, IVariantRecord, VariantStatus} from "../Api/Backend";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {useAsync} from "react-async-hook";
import {ILoggedUser} from "../Models";
import {Router} from "../Helpers";
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Container,
    Divider,
    FormControlLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
    Typography
} from "@mui/material";
import {Check, Clear} from "@mui/icons-material"
import {ButtonProps} from "@mui/material/Button/Button";
import {useFormik} from "formik";
import * as Yup from "yup";

type Color = "primary" | "success" | "error" | "default";

const Choices: FC<{ question: IQuestionRecord, input: IVariantInput }> = ({question, input}) => {
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
        </Box>
    );
}
const FormChoices: FC<{ question: IQuestionRecord, onAnswer:AnswerCallback }> = ({question, onAnswer}) => {
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
                    <FormControlLabel value={key} label={value} control={<Radio />}/>
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

const Question: FC<{ question: IQuestionRecord, input?: IVariantInput, onAnswer:AnswerCallback }> = ({question, input, onAnswer}) => {
    const choices = input ? <Choices question={question} input={input}/> : <FormChoices question={question} onAnswer={onAnswer}/>;
    return (
        <>
            <Typography variant="h4">{question.text}</Typography>
            {choices}
        </>
    )
}

const EditVariant: FC<{ variant: IVariantRecord, onAnswer:AnswerCallback }> = ({variant, onAnswer}) => {
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

    const max = (variant.questions?.length || 0) / 10;

    const handleBack = () => setPage((page) => {
        return page > 1 ? page - 1 : page;
    });
    const handleNext = () => setPage((page) => {
        return page < max ? page + 1 : max;
    });

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
        <Question question={activeQuestion} onAnswer={onAnswer} input={variant.input[activeQuestion.id]}/> : <></>
    return (
        <Box>
            <Paper>
                <Box p={1}>
                    <ButtonGroup fullWidth disableElevation size="large">{buttons}</ButtonGroup>
                </Box>
            </Paper>
            <Box mt={1}>
                <Card>
                    <CardContent>
                        <Box p={1}>
                            {question}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}

const Page: FC<{ variant: IVariantRecord, onAnswer:AnswerCallback }> = ({variant, onAnswer}) => {
    switch (variant.status) {
        case VariantStatus.CREATED:
            return <Navigate to={Router.linkTraining(variant.test_id)}/>;
        case VariantStatus.STARTED:
            return <EditVariant variant={variant} onAnswer={onAnswer}/>;
        case VariantStatus.PASSED:
        case VariantStatus.FAILED:
        case VariantStatus.EXPIRED:
            return <EditVariant variant={variant} onAnswer={onAnswer}/>;
            break;
    }
    return <NotFound/>
}

interface AnswerCallback {
    (question: IQuestionRecord, answer:string): Promise<void>
}

const AsyncPage: FC<{ trainingId: number, variantId: number }> = ({trainingId, variantId}) => {
    const {user} = useUser();
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    const callback = async (user: number, training: number, variant: number) => {
        return api.getVariant(user, training, variant);
    };
    const result = useAsync(callback, [(user as ILoggedUser).id, trainingId, variantId]);
    const handleAnswer:AnswerCallback = async (question, answer) => {
        const record = await api.answerQuestion({
            user: (user as ILoggedUser).id,
            training: trainingId,
            variant: variantId,
            question: question.id,
            answer: answer
        });
        result.merge({result: record});
    }

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

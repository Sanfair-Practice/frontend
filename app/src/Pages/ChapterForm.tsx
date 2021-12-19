import React, {FC, useEffect} from "react";
import {AppDispatch, useUser} from "../Contexts";
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    Radio as MuiRadio,
    RadioGroup,
    RadioProps,
    Typography
} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from "yup";
import {IChapterRecord, ITestRecord, LoggedUser} from "../Api/Backend";
import {useDispatch, useSelector} from "react-redux";
import {selectError, fetchChapters, selectAll, Status, selectStatus} from "../Redux/Chapters";
import {createForChapters} from "../Redux/Trainings";

const Radio: FC<{ label: string } & RadioProps> = ({label, ...props}) => {
    return <FormControlLabel control={<MuiRadio {...props}/>} label={label}/>
}

interface ISubmit {
    onSubmit: (record: ITestRecord) => void
}

interface IForm extends ISubmit {
    chapters: Array<IChapterRecord>,
}

const Form: FC<IForm> = ({chapters, onSubmit}) => {
    const {user} = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const formik = useFormik<{ chapter: string }>({
        initialValues: {
            chapter: "",
        },
        validationSchema: Yup.object({
            chapter: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            const record = await dispatch(createForChapters({
                user: (user as LoggedUser).id,
                data: [values.chapter],
            })).unwrap();
            onSubmit(record);
        }
    });
    const checkboxes = chapters.map((chapter) => (
        <Grid key={chapter.id} item xs={3}>
            <Radio label={chapter.name} value={chapter.id} />
        </Grid>
    ));
    return (
        <form onSubmit={formik.handleSubmit}>
            <Typography gutterBottom variant="h4">Select Chapter for training</Typography>
            <FormControl error={Boolean(formik.touched.chapter && formik.errors.chapter)}>
                <RadioGroup name="chapter" onChange={formik.handleChange}>
                    <Box sx={{overflow: "auto", maxHeight: "250px"}}>
                        <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                            {checkboxes}
                        </Grid>
                    </Box>
                    <FormHelperText>{formik.errors.chapter}</FormHelperText>
                </RadioGroup>
            </FormControl>
            <Box sx={{py: 2}}>
                <Button color="primary" fullWidth size="large" type="submit" variant="contained">
                    Submit
                </Button>
            </Box>
        </form>
    )
}

export const ChapterForm: FC<ISubmit> = ({onSubmit}) => {
    const dispatch = useDispatch()
    const chapters = useSelector(selectAll);
    const status = useSelector(selectStatus)
    const error = useSelector(selectError)

    useEffect(() => {
        if (status === Status.IDLE) {
            dispatch(fetchChapters())
        }
    }, [status, dispatch]);

    if (status === Status.LOADING) {
        return <>Loading ...</>;
    }
    if (status === Status.FAILED) {
        return <>Error: {error}</>
    }
    if (chapters.length === 0) {
        return <>No chapters</>
    }

    return <Form chapters={chapters} onSubmit={onSubmit}/>
}

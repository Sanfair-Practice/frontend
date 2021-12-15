import React, {FC} from "react";
import {useApi, useUser} from "../Contexts";
import {useAsync} from "react-async-hook";
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
    const api = useApi();
    const {user} = useUser();
    const formik = useFormik<{ chapter: string }>({
        initialValues: {
            chapter: "",
        },
        validationSchema: Yup.object({
            chapter: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            const record = await api.createTrainingForChapters((user as LoggedUser).id, [values.chapter]);
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
    const api = useApi();
    const callback = async () => await api.getChapters();
    const chapters = useAsync(callback, []);
    if (chapters.loading) {
        return <>Loading ...</>;
    }
    if (chapters.error) {
        return <>Error: {chapters.error}</>
    }
    if (!chapters.result || chapters.result.length === 0) {
        return <>No chapters</>
    }

    return <Form chapters={chapters.result} onSubmit={onSubmit}/>
}

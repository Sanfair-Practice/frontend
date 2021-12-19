import React, {FC, useEffect} from "react";
import {useApi, useUser} from "../Contexts";
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
import {ISectionRecord, ITestRecord, LoggedUser} from "../Api/Backend";
import {useDispatch, useSelector} from "react-redux";
import {fetchSections, selectAll, selectError, selectStatus, Status} from "../Redux/Sections";

const Radio: FC<{ label: string } & RadioProps> = ({label, ...props}) => {
    return <FormControlLabel control={<MuiRadio {...props}/>} label={label}/>
}

interface ISubmit {
    onSubmit: (record: ITestRecord) => void
}

interface IForm extends ISubmit {
    sections: Array<ISectionRecord>,
}

const Form: FC<IForm> = ({sections, onSubmit}) => {
    const api = useApi();
    const {user} = useUser();
    const formik = useFormik<{ section: string }>({
        initialValues: {
            section: "",
        },
        validationSchema: Yup.object({
            section: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            const record = await api.createTrainingForSections((user as LoggedUser).id, [values.section]);
            onSubmit(record);
        }
    });
    const checkboxes = sections.map((section) => (
        <Grid key={section.id} item xs={3}>
            <Radio label={section.name} value={section.id}/>
        </Grid>
    ));
    return (
        <form onSubmit={formik.handleSubmit}>
            <Typography gutterBottom variant="h4">Select Section for training</Typography>
            <FormControl error={Boolean(formik.touched.section && formik.errors.section)}>
                <RadioGroup name="section" onChange={formik.handleChange}>
                    <Box sx={{overflow: "auto", maxHeight: "250px"}}>
                        <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                            {checkboxes}
                        </Grid>
                    </Box>
                    <FormHelperText>{formik.errors.section}</FormHelperText>
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

export const SectionForm: FC<ISubmit> = ({onSubmit}) => {
    const dispatch = useDispatch()
    const sections = useSelector(selectAll);
    const status = useSelector(selectStatus);
    const error = useSelector(selectError);

    useEffect(() => {
        if (status === Status.IDLE) {
            dispatch(fetchSections())
        }
    }, [status, dispatch]);


    if (status === Status.LOADING) {
        return <>Loading ...</>;
    }
    if (status === Status.FAILED) {
        return <>Error: {error}</>
    }
    if (sections.length === 0) {
        return <>No sections</>
    }

    return <Form sections={sections} onSubmit={onSubmit}/>
}

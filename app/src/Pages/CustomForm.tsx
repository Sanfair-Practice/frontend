import React, {FC, useEffect} from "react";
import {AppDispatch, useUser} from "../Contexts";
import {
    Box,
    Button,
    Checkbox as MuiCheckbox,
    CheckboxProps,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Grid,
    Typography
} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ISectionRecord, ITestRecord, LoggedUser} from "../Api/Backend";
import {useDispatch, useSelector} from "react-redux";
import {selectAll, selectError, selectStatus} from "../Redux/Sections";
import {fetchChapters, Status} from "../Redux/Chapters";
import {createForSections} from "../Redux/Trainings";

const Checkbox: FC<{ label: string } & CheckboxProps> = ({label, ...props}) => {
    return <FormControlLabel control={<MuiCheckbox {...props}/>} label={label}/>
}

interface ISubmit {
    onSubmit: (record: ITestRecord) => void
}

interface IForm extends ISubmit {
    sections: Array<ISectionRecord>,
}

const Form: FC<IForm> = ({sections, onSubmit}) => {
    const {user} = useUser();
    const dispatch = useDispatch<AppDispatch>();
    const formik = useFormik<{ sections: Array<string> }>({
        initialValues: {
            sections: [],
        },
        validationSchema: Yup.object({
            sections: Yup.array().min(1),
        }),
        onSubmit: async (values) => {
            const record = await dispatch(createForSections({
                user: (user as LoggedUser).id,
                data: values.sections,
            })).unwrap();
            onSubmit(record);
        }
    });
    const checkboxes = sections.map((section) => (
        <Grid key={section.id} item xs={3}>
            <Checkbox name="sections" label={section.name} value={section.id} onChange={formik.handleChange}/>
        </Grid>
    ));
    return (
        <form onSubmit={formik.handleSubmit}>
            <Typography gutterBottom variant="h4">Select Sections for training</Typography>
            <FormControl error={Boolean(formik.touched.sections && formik.errors.sections)}>
                    <FormGroup>
                    <Box sx={{overflow: "auto", maxHeight: "250px"}}>
                        <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                            {checkboxes}
                        </Grid>
                    </Box>
                    <FormHelperText>{formik.errors.sections}</FormHelperText>
                </FormGroup>
            </FormControl>
            <Box sx={{py: 2}}>
                <Button color="primary" fullWidth size="large" type="submit" variant="contained">
                    Submit
                </Button>
            </Box>
        </form>
    )
}

export const CustomForm: FC<ISubmit> = ({onSubmit}) => {
    const dispatch = useDispatch()
    const sections = useSelector(selectAll);
    const status = useSelector(selectStatus);
    const error = useSelector(selectError);

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
    if (sections.length === 0) {
        return <>No sections</>
    }

    return <Form sections={sections} onSubmit={onSubmit}/>
}

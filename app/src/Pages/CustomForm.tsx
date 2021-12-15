import React, {FC} from "react";
import {useApi, useUser} from "../Contexts";
import {useAsync} from "react-async-hook";
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
    const api = useApi();
    const {user} = useUser();
    const formik = useFormik<{ sections: Array<string> }>({
        initialValues: {
            sections: [],
        },
        validationSchema: Yup.object({
            sections: Yup.array().min(1),
        }),
        onSubmit: async (values) => {
            const record = await api.createTrainingForSections((user as LoggedUser).id, values.sections);
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
    const api = useApi();
    const callback = async () => await api.getSections();
    const sections = useAsync(callback, []);
    if (sections.loading) {
        return <>Loading ...</>;
    }
    if (sections.error) {
        return <>Error: {sections.error}</>
    }
    if (!sections.result || sections.result.length === 0) {
        return <>No sections</>
    }

    return <Form sections={sections.result} onSubmit={onSubmit}/>
}

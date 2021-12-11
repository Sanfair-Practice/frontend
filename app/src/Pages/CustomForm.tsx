import React, {FC} from "react";
import {useServiceContainer, useUser} from "../Contexts";
import {useAsync} from "react-async-hook";
import {Backend} from "../Api";
import {
    Box,
    Button,
    Checkbox as MuiCheckbox,
    CheckboxProps,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Grid
} from "@mui/material";
import {useFormik} from "formik";
import * as Yup from "yup";
import {ILoggedUser} from "../Models";

const Checkbox: FC<{ label: string } & CheckboxProps> = ({label, ...props}) => {
    return <FormControlLabel control={<MuiCheckbox {...props}/>} label={label}/>
}

interface ISubmit {
    onSubmit: (record: Backend.ITrainingRecord) => void
}

interface IForm extends ISubmit {
    sections: Array<Backend.ISectionRecord>,
}

const Form: FC<IForm> = ({sections, onSubmit}) => {
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    const {user} = useUser();
    const formik = useFormik<{ sections: Array<string> }>({
        initialValues: {
            sections: [],
        },
        validationSchema: Yup.object({
            sections: Yup.array().min(1),
        }),
        onSubmit: async (values) => {
            const record = await api.createTrainingForSections((user as ILoggedUser).id, values.sections);
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
            <FormControl error={Boolean(formik.touched.sections && formik.errors.sections)}>
                <FormLabel component="legend">Sections</FormLabel>
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
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
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

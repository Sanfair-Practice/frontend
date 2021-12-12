import React, {FC} from "react";
import {useServiceContainer, useUser} from "../Contexts";
import {useAsync} from "react-async-hook";
import {Backend} from "../Api";
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
import {ILoggedUser} from "../Models";

const Radio: FC<{ label: string } & RadioProps> = ({label, ...props}) => {
    return <FormControlLabel control={<MuiRadio {...props}/>} label={label}/>
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
    const formik = useFormik<{ section: string }>({
        initialValues: {
            section: "",
        },
        validationSchema: Yup.object({
            section: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            const record = await api.createTrainingForSections((user as ILoggedUser).id, [values.section]);
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

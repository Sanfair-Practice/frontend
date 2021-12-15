import {Box, Button, Container, Link, Paper, TextField, Typography} from "@mui/material";
import React, {FC} from "react";
import {Link as RouteLink, useNavigate} from "react-router-dom";
import MuiPhoneNumber from "material-ui-phone-number";
import * as Yup from "yup";
import {useFormik, FormikErrors} from "formik";
import {useApi, useUser} from "../Contexts";
import {Router} from "../Helpers";
import {IRegistrationProfile, ValidationError} from "../Api/Backend";

export const SignUp: FC = () => {
    const api = useApi();
    const {setUser} = useUser();
    const navigate = useNavigate();
    const formik = useFormik<IRegistrationProfile>({
        initialValues: {
            first_name: "",
            last_name: "",
            phone: "",
            passport: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
        validationSchema: Yup.object({
            first_name: Yup
                .string()
                .max(255)
                .required("First name is required"),
            last_name: Yup
                .string()
                .max(255)
                .required("Last name is required"),
            phone: Yup
                .string()
                .max(255)
                .required("Phone is required"),
            passport: Yup
                .string()
                .max(255)
                .required("Passport is required"),
            email: Yup
                .string()
                .email("Must be a valid email")
                .max(255)
                .required("Email is required"),
            password: Yup
                .string()
                .max(255)
                .required("Password is required"),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
        }),
        onSubmit: async (values, actions) => {
            try {
                const record = await api.register(values);
                setUser(record);
                navigate(Router.linkHome());
            } catch (e) {
                if (! (e instanceof ValidationError)) {
                    throw e
                }
                actions.setErrors((e.errors as FormikErrors<IRegistrationProfile>));

            }
        }
    });

    return (
        <Box component="main" m={2}>
            <Container maxWidth="sm" component={Paper}>
                <Box pt={2}>
                    <Typography gutterBottom color="textPrimary" variant="h4">Create a new account</Typography>
                </Box>
                <form onSubmit={formik.handleSubmit}>

                    <TextField
                        fullWidth
                        label="First name"
                        margin="normal"
                        name="first_name"
                        type="text"
                        variant="outlined"

                        error={Boolean(formik.touched.first_name && formik.errors.first_name)}
                        helperText={formik.touched.first_name && formik.errors.first_name}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.first_name}
                    />
                    <TextField
                        fullWidth
                        label="Last name"
                        margin="normal"
                        name="last_name"
                        type="text"
                        variant="outlined"

                        error={Boolean(formik.touched.last_name && formik.errors.last_name)}
                        helperText={formik.touched.last_name && formik.errors.last_name}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.last_name}
                    />
                    <MuiPhoneNumber
                        fullWidth
                        name="phone"
                        label="Phone"
                        variant="outlined"
                        onlyCountries={["by"]}
                        defaultCountry={"by"}

                        error={Boolean(formik.touched.phone && formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        onBlur={formik.handleBlur}
                        onChange={e => formik.setFieldValue("phone", e)}
                        value={formik.values.phone}
                    />

                    <TextField
                        fullWidth
                        label="Passport"
                        margin="normal"
                        name="passport"
                        type="text"
                        variant="outlined"

                        error={Boolean(formik.touched.passport && formik.errors.passport)}
                        helperText={formik.touched.passport && formik.errors.passport}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.passport}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        name="email"
                        type="email"
                        variant="outlined"

                        error={Boolean(formik.touched.email && formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.email}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        margin="normal"
                        name="password"
                        type="password"
                        variant="outlined"

                        error={Boolean(formik.touched.password && formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.password}
                    />
                    <TextField
                        fullWidth
                        label="Confirm password"
                        margin="normal"
                        name="password_confirmation"
                        type="password"
                        variant="outlined"

                        error={Boolean(formik.touched.password_confirmation && formik.errors.password_confirmation)}
                        helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.password_confirmation}
                    />
                    <Box mt={2}>
                        <Button fullWidth type="submit" variant="contained" size="large">Sign Up</Button>
                    </Box>
                </form>
                <Box mt={2} pb={2}>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                        Have an account?
                        {" "}
                        <Link variant="subtitle2" component={RouteLink} to={Router.linkSignIn()}>Sign In</Link>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

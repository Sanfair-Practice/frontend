import {Box, Button, Container, Link, Paper, TextField, Typography} from "@mui/material";
import React, {FC} from "react";
import {Link as RouteLink} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useApi} from "../Contexts";
import {LoggedUser} from "../Models";
import {useUser} from "../Contexts";
import {Router} from "../Helpers";

export const SignIn: FC = () => {
    const api = useApi();
    const {setUser} = useUser();
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup
                .string()
                .email("Must be a valid email")
                .max(255)
                .required("Email is required"),
            password: Yup
                .string()
                .max(255)
                .required("Password is required"),
        }),
        onSubmit: async (values) => {
            try {

                const record = await api.login(values);
                const user = LoggedUser.fromRecord(record);
                setUser(user);
            } catch (e) {
                console.error(e);
            }
        }
    });

    return(
        <Box component="main" m={2}>
            <Container maxWidth="sm" component={Paper}>
                <Box pt={2}>
                    <Typography gutterBottom color="textPrimary" variant="h4">Sign in</Typography>
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
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
                    <Box mt={2}>
                        <Button fullWidth type="submit" variant="contained" size="large">Sign In</Button>
                    </Box>
                </form>
                <Box mt={2} pb={2}>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                        {"Don't have an account?"}
                        {" "}
                        <Link variant="subtitle2" component={RouteLink} to={Router.linkSignUp()}>Sign Up</Link>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

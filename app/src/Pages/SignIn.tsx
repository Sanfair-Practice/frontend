import {Box, Button, Container, Link, TextField, Typography} from "@mui/material";
import React, {FC} from "react";
import {Link as RouteLink} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Backend} from "../Api"
import {useServiceContainer} from "../Contexts";
import {LoggedUser} from "../Models";
import {useUser} from "../Contexts";

export const SignIn: FC = () => {
    const api: Backend.Api = useServiceContainer().resolve<Backend.Api>("backendApi");
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
        <Box component="main"
             sx={{
                 alignItems: "center",
                 display: "flex",
                 flexGrow: 1,
                 minHeight: "100%"
             }}
        >
            <Container maxWidth="sm">
                <form onSubmit={formik.handleSubmit}>
                    <Box sx={{my: 3}}>
                        <Typography color="textPrimary" variant="h4">
                            Sign in
                        </Typography>
                    </Box>
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
                    <Box sx={{py: 2}}>
                        <Button
                            color="primary"
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                        >
                            Sign In Now
                        </Button>
                    </Box>
                    <Typography
                        color="textSecondary"
                        variant="body2"
                    >
                        Don&apos;t have an account?
                        {" "}
                        <Link variant="subtitle2" component={RouteLink} to={"/sign-up"}>Sign Up</Link>
                    </Typography>
                </form>
            </Container>
        </Box>
    );
}

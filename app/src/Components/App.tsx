import {Home} from "../Pages/Home"
import {SignIn} from "../Pages/SignIn"
import {NotFound} from "../Pages/NotFound"
import {SignUp} from "../Pages/SignUp"
import React, {FC} from "react";
import {Route, Routes} from "react-router";
import {BrowserRouter as Router} from "react-router-dom";
import {Authenticated, Guest} from "./Auth"
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {Navigation} from "./Navigation";
import {useApi, useUser} from "../Contexts";
import {Router as AppRouter} from "../Helpers";
import {Training} from "../Pages/Training";
import {Variant} from "../Pages/Variant";


const theme = createTheme({
    palette: {
        background: {
            default: "#e8e8e8"
        }
    },
});

export const App: FC = () => {
    const {user} = useUser();
    const api = useApi();
    api.updateAuthorization(user?.token);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <Navigation/>
                <Routes>
                    <Route element={<Authenticated/>}>
                        <Route path={AppRouter.routes.HOME} element={<Home/>}/>
                        <Route path={AppRouter.routes.TRAINING} element={<Training/>}/>
                        <Route path={AppRouter.routes.VARIANT} element={<Variant/>}/>
                    </Route>
                    <Route element={<Guest/>}>
                        <Route path={AppRouter.routes.SIGN_IN} element={<SignIn/>}/>
                        <Route path={AppRouter.routes.SIGN_UP} element={<SignUp/>}/>
                    </Route>
                    <Route path={AppRouter.routes.NOT_FOUND} element={<NotFound/>}/>
                </Routes>
            </Router>
        </ThemeProvider>

    )
};

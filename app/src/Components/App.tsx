import {Home} from "../Pages/Home"
import {SignIn} from "../Pages/SignIn"
import {NotFound} from "../Pages/NotFound"
import {SignUp} from "../Pages/SignUp"
import React, {FC} from "react";
import {Route, Routes} from "react-router";
import {BrowserRouter as Router} from "react-router-dom";
import {Authenticated, Guest} from "./Auth"
import {CssBaseline} from "@mui/material";
import {Navigation} from "./Navigation";
import {useServiceContainer, useUser} from "../Contexts";
import {Backend} from "../Api";
import {Router as AppRouter} from "../Helpers";
import {Training} from "../Pages/Training";
import {Variant} from "../Pages/Variant";

export const App: FC = () => {
    const {user} = useUser();
    const api = useServiceContainer().resolve<Backend.Api>("backendApi");
    api.updateAuthorization(user?.token);

    return (
        <Router>
            <CssBaseline>
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
            </CssBaseline>
        </Router>
    )
};

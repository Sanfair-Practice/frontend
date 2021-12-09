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

export const App: FC = () => (
    <Router>
        <CssBaseline>
            <Navigation/>
            <Routes>
                <Route element={<Authenticated/>}>
                    <Route path='/' element={<Home/>}/>
                </Route>
                <Route element={<Guest/>}>
                    <Route path='/sign-in' element={<SignIn/>}/>
                    <Route path='/sign-up' element={<SignUp/>}/>
                </Route>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </CssBaseline>
    </Router>
);

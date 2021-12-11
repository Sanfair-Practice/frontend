import React, {FC} from "react";
import {useUser} from "../Contexts";
import {Navigate, Outlet} from "react-router";
import {Router} from "../Helpers"

export const Authenticated: FC = () => {
    const {user} = useUser();
    if (!user) {
        return <Navigate to={Router.linkSignIn()}/>
    }

    return <Outlet />;
}
export const Guest: FC = () => {
    const {user} = useUser();
    if (user) {
        return <Navigate to={Router.linkHome()}/>
    }

    return <Outlet />;
}

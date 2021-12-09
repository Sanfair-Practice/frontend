import React, {FC} from "react";
import {useUser} from "../Contexts";
import {Navigate, Outlet} from "react-router";

export const Authenticated: FC = () => {
    const {user} = useUser();
    if (!user) {
        return <Navigate to="/sign-in"/>
    }

    return <Outlet />;
}
export const Guest: FC = () => {
    const {user} = useUser();
    if (user) {
        return <Navigate to="/"/>
    }

    return <Outlet />;
}

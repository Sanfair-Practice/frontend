import React, {FC} from "react";
import {useUser} from "../Contexts";
import {Outlet} from "react-router";
import {AccessDenied} from "../Pages/AccessDenied";
import {SignIn} from "../Pages/SignIn";

export const Authenticated: FC = () => {
    const {user} = useUser();
    if (!user) {
        return <SignIn />
    }

    return <Outlet />;
}
export const Guest: FC = () => {
    const {user} = useUser();
    if (user) {
        return <AccessDenied />
    }

    return <Outlet />;
}

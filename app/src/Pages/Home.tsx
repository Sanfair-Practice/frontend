import React, {FC} from "react";
import {Navigate} from "react-router";
import {useUser} from "../Contexts";

export const Home: FC = () => {
    const {user} = useUser();
    if (!user) {
        return <Navigate to={"/sign-in"} state={{ from: location }}/>;
    }

    return (
        <>
            <h1>My React and TypeScript App!! {new Date().toLocaleDateString()}</h1>
        </>
    );
};

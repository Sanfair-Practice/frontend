import {useUser} from "../Contexts";
import {AppBar, Box, Button, Container, Toolbar} from "@mui/material";
import {Link as RouteLink} from "react-router-dom";
import React, {FC} from "react";

export const Navigation: FC = () => {
    const {user, setUser} = useUser();

    const handleSignOut = () => {
        setUser(undefined);
    }

    const mainLinks = [];
    mainLinks.push(<Button key="home" component={RouteLink} to={"/"} sx={{color: "white"}}> Home </Button>);

    const secondaryLinks = [];
    if (user) {
        secondaryLinks.push(<Button key="sign-out"  sx={{color: "white"}} onClick={handleSignOut}> Sign out </Button>);
    }
    else {
        secondaryLinks.push(<Button key="sign-in" component={RouteLink} to={"/sign-in"} sx={{color: "white"}}> Sign in </Button>);
        secondaryLinks.push(<Button key="sign-up"  component={RouteLink} to={"/sign-up"} sx={{color: "white"}}> Sign up </Button>);
    }

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{flexGrow: 1}}> {mainLinks} </Box>
                    <Box sx={{flexGrow: 0}}> {secondaryLinks} </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

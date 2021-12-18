import React, {FC} from "react";
import {Box, CircularProgress, Stack} from "@mui/material";

export interface LoaderProps {
    fullHeight?: boolean
}

export const Loader: FC<LoaderProps> = ({fullHeight, children}) => {
    const stackProps = {
        justifyContent: "center",
        alignItems: "center",
        ...(fullHeight ? {height: "100%"} : {})
    }
    return (
        <Stack {...stackProps}>
            <CircularProgress sx={{mb: 2}}/>
            {children}
        </Stack>
    )
}

export const ModalLoader: FC<LoaderProps> = (props) => {
    return (
        <Box position="fixed" width="100%" height="100%" zIndex={1000}>
            <Loader {...props}/>
        </Box>
    )
}

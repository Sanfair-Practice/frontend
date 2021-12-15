import React, {FC} from "react";
import {CircularProgress, Modal, Stack} from "@mui/material";

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
        <Modal open={true} hideBackdrop>
            <Loader {...props}/>
        </Modal>
    )
}

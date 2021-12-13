import {Box, Modal as ModalBase} from "@mui/material";
import React, {FC} from "react";
import {ModalProps} from "@mui/material/Modal/Modal";

export const Modal: FC<ModalProps> = ({children, ...props}) => (
    <ModalBase {...props} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Box bgcolor="background.paper" p={4} maxWidth={{md: "50%"}}>
            {children}
        </Box>
    </ModalBase>
)

import {Box, Container, Typography} from "@mui/material";
import React, {FC} from "react";

export const AccessDenied: FC = () => (
    <Container maxWidth="md">
        <Box p={2} mt={2}>
            <Typography align="center" color="textPrimary" variant="h2" gutterBottom>
                403: You do not have access to this page
            </Typography>
            <Typography align="center" color="textPrimary" variant="subtitle2" gutterBottom>
                You either tried some shady route or you came here by mistake.
                Whichever it is, try using the navigation
            </Typography>
        </Box>
    </Container>
);


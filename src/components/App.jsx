import React from 'react';

import {
    Container,
    Divider,
    Typography, Stack, useColorScheme
} from '@mui/material';
import CssBaseline from "@mui/material/CssBaseline";
import {styled, StyledEngineProvider, ThemeProvider} from "@mui/material/styles";
import theme from '../theme.jsx';
import NavBar from "./NavBar.jsx";

const PageContainer = styled(Container)(({theme}) => ({
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create(['all'], {duration: '0.2s'})
}));

function MyApp() {
    const { mode, setMode } = useColorScheme();
    return (
        <PageContainer maxWidth={false} className="flex flex-col min-h-screen px-sm" disableGutters>
            <NavBar />
            <Divider />
            <Stack className="flex-grow" direction="row">
                <Stack className="p-2 justify-center relative" direction="row">
                    <Stack>
                        <Typography>TEST</Typography>
                    </Stack>
                    <Divider className="absolute right-0" orientation="vertical" />
                </Stack>
                <Stack className="p-2">
                    <Typography>
                        PAGE CONTENT
                    </Typography>
                </Stack>
            </Stack>
        </PageContainer>
    );
}

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StyledEngineProvider injectFirst>
                <MyApp />
            </StyledEngineProvider>
        </ThemeProvider>
    );
}
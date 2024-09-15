import React from 'react';

import {AppBar, Button, Stack, CssBaseline, Container, Divider} from '@mui/material';
import ThemeSwitch from "./ThemeSwitch.jsx";
import {ThemeProvider, useColorScheme} from "@mui/material/styles";
import theme from './theme.jsx';
import { useTheme } from '@emotion/react';
import Person from '@mui/icons-material/Person';

function NavBar() {
    const theme = useTheme(); 
    const { mode, setMode } = useColorScheme();
    const isDark = () => mode === 'dark'; 
    const changeMode = () => setMode(isDark() ? 'light' : 'dark'); 
    if (mode === undefined) return null; 
    return (
        <AppBar sx={{bgcolor: theme.palette.background.default}} style={{ backgroundImage: 'none', boxShadow: 'none', paddingTop: '10px', paddingBottom: '10px' }} position="static">
            <Stack direction="row" style={{flexGrow: 1}}>
                        
            </Stack>
            <Stack direction="row" className="items-center" style={{flexGrow: 1, justifyContent: 'end'}}>
                <ThemeSwitch onClick={changeMode} checked={isDark()} />
                <Button color="inherit" size="lg" startIcon={<Person />}>Log In</Button>
            </Stack>
        </AppBar>
    );
}

function MyApp() {
    const theme = useTheme(); 
    return (
        <Container maxWidth={false} style={{backgroundColor: theme.palette.background.default, minHeight: '100vh'}} className='px-sm' disableGutters>
            <NavBar />
            <Divider sx={{ color: 'red' }} />
        </Container>
    );
}

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MyApp />
        </ThemeProvider>
    );
}
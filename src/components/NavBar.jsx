import React, {useContext} from "react";
import {AppBar, Button, IconButton, Stack, Toolbar, useColorScheme} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ThemeSwitch from "./ThemeSwitch.jsx";
import Person from "@mui/icons-material/Person";

export default function NavBar() {
    const { mode, setMode } = useColorScheme();
    const isDark = () => mode === 'dark';
    const changeMode = () => setMode(isDark() ? 'light' : 'dark');
    return (
        <AppBar className="shadow-none bg-none" sx={{bgcolor: 'transparent'}} position="static">
            <Toolbar>
                <Stack direction="row" className="flex-grow">
                    <IconButton color="inherit">
                        <MenuIcon />
                    </IconButton>
                </Stack>
                <Stack direction="row" className="flex-grow items-center justify-end">
                    <ThemeSwitch onClick={changeMode} size="small" checked={isDark()} />
                    <Button color="inherit" className="py-3" startIcon={<Person />}>Log In</Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
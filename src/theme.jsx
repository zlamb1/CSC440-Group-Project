import { createTheme } from "@mui/material";

const mainColor = '#4a4db6';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
    colorSchemes: {
        light: {
            palette: {
                text: {
                    primary: '#e3f4fb',
                },
                primary: {
                    main: mainColor,
                    dark: '#3b3ba0',
                    light: '#7e84cc',
                    contrastText: '#e3f4fb'
                },
                background: {
                    default: mainColor
                },
            },
        },
        dark: true,
    },
});

export default theme; 
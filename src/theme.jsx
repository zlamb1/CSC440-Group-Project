import { createTheme } from "@mui/material";

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
    palette: {
        // change primary, secondary, etc. colors here
    }
});

export default createTheme(theme, {
    palette: {
        background: {
            default: theme.palette.primary.dark
        }
    }
}); 
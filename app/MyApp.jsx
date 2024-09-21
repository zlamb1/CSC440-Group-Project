import {StyledEngineProvider, ThemeProvider} from "@mui/material/styles";
import theme from "./theme";

export default function MyApp() {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <h1 className="text-red-300">Hello, world!</h1>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
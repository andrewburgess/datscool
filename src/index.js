import React from "react"
import ReactDOM from "react-dom"
import { ThemeProvider, createGlobalStyle } from "styled-components"

import App from "./components/App"
import Theme from "./style"

const GlobalStyle = createGlobalStyle`
    html {
        font-family: "Roboto Mono", monospace;
        font-size: 16px;
    }
`

ReactDOM.render(
    <ThemeProvider theme={Theme}>
        <React.Fragment>
            <GlobalStyle />
            <App />
        </React.Fragment>
    </ThemeProvider>,
    document.getElementById("root")
)

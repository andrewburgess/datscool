import React from "react"
import styled from "styled-components"

import PeerCount from "./PeerCount"
import Site from "./Site"
import Toolbar from "./Toolbar"
import { SitesProvider } from "../context/sites-context"

function App(props) {
    return (
        <SitesProvider>
            <div className={props.className}>
                <Toolbar />
                <Site />
                <PeerCount />
            </div>
        </SitesProvider>
    )
}

export default styled(App)``

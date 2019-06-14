import React, { useContext, useState } from "react"
import styled from "styled-components"

import PeerCount from "./PeerCount"
import Site from "./Site"
import { SitesContext } from "../context/sites-context"
import Toolbar from "./Toolbar"
import Welcome from "./Welcome"

function App(props) {
    const [started, setStarted] = useState(false)
    const [sites] = useContext(SitesContext)

    if (sites.currentSite && !started) {
        setStarted(true)
    }

    return (
        <div className={props.className}>
            <Toolbar />
            {!started && <Welcome />}
            <Site started={started} />
            <PeerCount />
        </div>
    )
}

export default styled(App)``

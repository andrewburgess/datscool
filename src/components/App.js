import React from "react"
import styled from "styled-components"

import PeerCount from "./PeerCount"
import Toolbar from "./Toolbar"

function App(props) {
    return (
        <div className={props.className}>
            <Toolbar />
            <PeerCount />
        </div>
    )
}

export default styled(App)``

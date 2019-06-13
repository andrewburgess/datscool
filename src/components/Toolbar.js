import React, { useContext } from "react"
import styled from "styled-components"

import Button from "./Button"
import SeedButton from "./SeedButton"
import { LOAD_NEXT_SITE, SitesContext } from "../context/sites-context"

const Toolbar = (props) => {
    const [siteState, siteDispatch] = useContext(SitesContext)
    return (
        <div className={props.className}>
            <SeedButton />
            <Button
                disabled={siteState.loading || siteState.isEmpty}
                onClick={(event) => {
                    event.preventDefault()
                    siteDispatch({ type: LOAD_NEXT_SITE })
                }}
                type="button"
            >
                DatsCool
            </Button>
        </div>
    )
}

export default styled(Toolbar)`
    align-items: center;
    background-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: row;
    height: 2vh;
    justify-content: space-between;
    min-height: 48px;
    padding: 0 2rem;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: ${(props) => props.theme.layers.toolbar};
`

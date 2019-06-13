import classnames from "classnames"
import { get } from "lodash"
import React, { useContext, useEffect, useRef } from "react"
import styled from "styled-components"

import { LOAD_NEXT_SITE_COMPLETE, SitesContext } from "../context/sites-context"

const SiteLoading = (props) => {
    return <div className={props.className}>LOADING...</div>
}

const StyledSiteLoading = styled(SiteLoading)`
    align-items: center;
    bottom: 0;
    display: flex;
    font-size: 4rem;
    height: 100%;
    justify-content: center;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 64px;
    transition: opacity 0.2s;
    width: 100%;
    z-index: ${(props) => props.theme.layers.site};

    &.loading {
        opacity: 1;
    }
`

const Site = (props) => {
    const [siteState, siteDispatch] = useContext(SitesContext)
    const iframe = useRef(null)

    useEffect(() => {
        if (!iframe.current) {
            return
        }

        const ref = iframe.current

        const onSiteLoad = () => {
            ref.removeEventListener("load", onSiteLoad)
            siteDispatch({
                type: LOAD_NEXT_SITE_COMPLETE
            })
        }

        ref.addEventListener("load", onSiteLoad)

        return () => ref.removeEventListener("load", onSiteLoad)
    })

    const loading = siteState.loading || !siteState.currentSite

    if (siteState.isEmpty) {
        return null
    }

    return (
        <React.Fragment>
            <iframe
                className={classnames(props.className, {
                    loading
                })}
                ref={iframe}
                src={get(siteState, "currentSite.url", "about:blank")}
                title="DatsCool"
            />
            <StyledSiteLoading className={classnames({ loading: siteState.loading })} />
        </React.Fragment>
    )
}

export default styled(Site)`
    bottom: 0;
    height: 100%;
    left: 0;
    opacity: 1;
    position: fixed;
    right: 0;
    top: 64px;
    transition: opacity 0.2s;
    width: 100%;
    z-index: ${(props) => props.theme.layers.site};

    &.loading {
        opacity: 0;
    }
`

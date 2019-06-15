import classnames from "classnames"
import { darken } from "polished"
import { get } from "lodash"
import React, { useContext } from "react"
import { MdOpenInNew } from "react-icons/md"
import styled from "styled-components"

import AddSite from "./AddSite"
import Button from "./Button"
import SeedButton from "./SeedButton"
import { LOAD_NEXT_SITE, SitesContext } from "../context/sites-context"

const Toolbar = (props) => {
    const [siteState, siteDispatch] = useContext(SitesContext)
    return (
        <div className={props.className}>
            <div className="toolbar">
                <SeedButton />
                <Button
                    disabled={siteState.loading || siteState.isEmpty}
                    className="datscool"
                    onClick={(event) => {
                        event.preventDefault()
                        siteDispatch({ type: LOAD_NEXT_SITE })
                    }}
                    type="button"
                >
                    DatsCool
                </Button>
                <AddSite />
            </div>
            <div className={classnames("current-site", { show: siteState.currentSite && !siteState.isEmpty })}>
                <div className="url" title={get(siteState, "currentSite.url", "")}>
                    <a
                        href={get(siteState, "currentSite.url", "#")}
                        rel="noopener noreferrer"
                        target="_blank"
                        title={"open in new tab: " + get(siteState, "currentSite.url", "")}
                    >
                        <MdOpenInNew /> {get(siteState, "currentSite.url", "")}
                    </a>
                </div>
            </div>
        </div>
    )
}

export default styled(Toolbar)`
    box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: ${(props) => props.theme.layers.toolbar};

    .current-site {
        align-items: center;
        background-color: ${(props) => darken(0.1, props.theme.colors.primary)};
        display: flex;
        flex-direction: row;
        font-size: 0.8rem;
        height: 0;
        justify-content: center;
        left: 0;
        transition: height 0.4s;
        width: 100%;

        &.show {
            height: 24px;
        }

        a {
            color: #ff63dd;
            padding: 0 1em;
            text-decoration: none;

            svg {
                vertical-align: middle;
            }

            &:visited {
                color: #ff63dd;
            }

            &:hover {
                color: #f78adf;
            }
        }

        .url {
            text-align: center;
            width: 70%;
        }
    }

    .toolbar {
        align-items: center;
        background-color: ${(props) => props.theme.colors.primary};

        display: flex;
        flex-direction: row;
        height: 48px;
        justify-content: space-between;
        padding: 0 2rem;

        width: 100%;
    }

    .datscool {
        background-color: #f032c7;
        border: 4px solid #f75dd5;

        &:hover {
            background-color: #ff63dd;
            border: 4px solid #f78adf;
        }
    }
`

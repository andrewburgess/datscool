import classnames from "classnames"
import React, { useContext, useEffect, useState } from "react"
import { MdBlock, MdShare } from "react-icons/md"
import styled from "styled-components"

import Button from "./Button"
import { SitesContext } from "../context/sites-context"

const SeedButton = (props) => {
    const [sites] = useContext(SitesContext)
    const [isSeeding, setIsSeeding] = useState(false)

    useEffect(() => {
        if (!window.experimental || !window.experimental.library || !sites.currentSiteKey) {
            return
        }

        const checkSeedStatus = async () => {
            const isSeeding = await window.experimental.library.get(sites.currentSiteKey)

            setIsSeeding(isSeeding.isSaved)
        }

        checkSeedStatus()
    }, [sites.currentSiteKey])

    if (!window.experimental || !window.experimental.library) {
        return <div />
    }

    const addSeed = async (event) => {
        event.preventDefault()
        const archive = new window.DatArchive(sites.currentSiteKey)
        const info = await archive.getInfo()
        const settings = await window.experimental.library.requestAdd(info.url)
        setIsSeeding(settings.isSaved)
    }

    const removeSeed = async (event) => {
        event.preventDefault()

        const archive = new window.DatArchive(sites.currentSiteKey)
        const info = await archive.getInfo()
        const settings = await window.experimental.library.requestRemove(info.url)
        setIsSeeding(settings.isSaved)
    }

    return (
        <Button
            className={classnames(props.className, { seeding: isSeeding })}
            disabled={sites.loading || sites.isEmpty || !sites.currentSiteKey}
            onClick={isSeeding ? removeSeed : addSeed}
            type="button"
        >
            <MdShare /> {isSeeding ? "STOP" : "SEED"}
            {isSeeding && <MdBlock className="cancel" />}
        </Button>
    )
}

export default styled(SeedButton)`
    background-color: #00509b;
    border: 4px solid #2d75b8;
    position: relative;

    &:hover {
        background-color: #2c82d3;
        border: 4px solid #3e8ed8;
    }

    &.seeding {
        background-color: #8d040f;
        border: 4px solid #a31a26;

        &:hover {
            background-color: #da1626;
            border: 4px solid #e23c4a;
        }
    }

    .cancel {
        fill: #f00;
        left: 2em;
        opacity: 0.9;
        position: absolute;
    }
`

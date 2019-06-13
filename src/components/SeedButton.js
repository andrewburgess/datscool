import React, { useContext, useEffect, useState } from "react"
import { MdBlock, MdShare } from "react-icons/md"
import styled from "styled-components"

import Button from "./Button"
import { SitesContext } from "../context/sites-context"

const SeedButton = (props) => {
    const [sites] = useContext(SitesContext)
    const [isSeeding, setIsSeeding] = useState(false)

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
            className={props.className}
            disabled={sites.loading || sites.isEmpty || !sites.currentSiteKey}
            onClick={isSeeding ? removeSeed : addSeed}
            type="button"
        >
            <MdShare />
            {isSeeding && <MdBlock className="cancel" />}
        </Button>
    )
}

export default styled(SeedButton)`
    position: relative;

    .cancel {
        fill: #f00;
        opacity: 0.6;
        position: absolute;
    }
`

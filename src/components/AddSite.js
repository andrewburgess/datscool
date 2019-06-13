import React, { useState } from "react"
import { createPortal } from "react-dom"
import { MdAdd } from "react-icons/md"
import styled from "styled-components"

import AddSiteDialog from "./AddSiteDialog"
import Button from "./Button"

const AddSite = (props) => {
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <Button className={props.className} onClick={() => setShowModal(true)} type="button">
                <MdAdd />
            </Button>
            {showModal &&
                createPortal(
                    <AddSiteDialog onClose={() => setShowModal(false)} />,
                    document.getElementById("modal-root")
                )}
        </>
    )
}

export default styled(AddSite)``

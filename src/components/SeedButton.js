import React from "react"
import { MdShare } from "react-icons/md"
import styled from "styled-components"

import Button from "./Button"

const SeedButton = (props) => (
    <Button className={props.className} type="button">
        <MdShare />
    </Button>
)

export default styled(SeedButton)``

import React, { useContext } from "react"
import { MdRefresh } from "react-icons/md"
import styled from "styled-components"

import Button from "./Button"
import { reset, SitesContext } from "../context/sites-context"

const Welcome = (props) => {
    const [, dispatch] = useContext(SitesContext)
    return (
        <div className={props.className}>
            <h1>YOU'VE SEEN THEM ALL</h1>
            <p>it looks like you've seen all of the sites that have been added!</p>
            <p>why don't you go make something cool and then submit it 😎</p>
            <p>you can also reset your seen list and start over</p>
            <Button onClick={() => reset(dispatch)} type="button">
                <MdRefresh /> RESET
            </Button>
        </div>
    )
}

export default styled(Welcome)`
    left: 50%;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 30rem;
    z-index: ${(props) => props.theme.layers.site};

    h1 {
        font-size: 4rem;
        font-weight: 300;
        margin: 0 0 2rem 0;
        text-align: center;
        text-transform: uppercase;
    }

    p {
        line-height: 1.6;
        margin: 1rem 0 1.5rem 0;
        text-align: center;
    }

    ${Button} {
        background-color: #8d040f;
        border: 4px solid #a31a26;
        margin: 2rem auto 0 auto;

        &:hover {
            background-color: #da1626;
            border: 4px solid #e23c4a;
        }
    }
`

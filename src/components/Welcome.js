import React from "react"
import styled from "styled-components"

const Welcome = (props) => (
    <div className={props.className}>
        <div className="description">
            <h1>DATSCOOL</h1>
            <p>it's like stumbleupon, but p2p</p>
            <p>happy trails!</p>
        </div>
        <p className="tooltip datscool">Click this to see a random page</p>
        <p className="tooltip add">Add a new site here</p>
        <p className="tooltip seed">Seed any sites that catch your interest</p>
    </div>
)

export default styled(Welcome)`
    margin-left: auto;
    margin-right: auto;
    margin-top: calc(2vh + 48px);
    width: 60rem;

    .description {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .tooltip {
        font-size: 0.8rem;
        min-width: 120px;
        position: absolute;
        text-transform: uppercase;
        top: 56px;
        width: 25vw;
    }

    .datscool {
        left: 50%;
        transform: translateX(-50%);
    }

    .add {
        right: 32px;
        text-align: right;
    }

    .seed {
        left: 32px;
        text-align: left;
    }

    h1 {
        font-size: 4rem;
        font-weight: 300;
        margin: 1rem 0 2rem 0;
        text-align: center;
    }

    p {
        margin: 1em 0;
        text-align: center;
    }
`

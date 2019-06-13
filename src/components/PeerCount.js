import React, { useEffect, useState } from "react"
import { MdPeople } from "react-icons/md"
import styled from "styled-components"

const PeerCount = (props) => {
    const [peerCount, setPeerCount] = useState(0)

    useEffect(() => {
        const checkPeerCount = async () => {
            const list = await window.experimental.datPeers.list()
            setPeerCount(list.length)
        }

        if (!window.experimental || !window.experimental.datPeers) {
            return null
        }

        checkPeerCount()
    }, [])

    useEffect(() => {
        const onPeerConnected = () => setPeerCount(peerCount + 1)
        const onPeerDisconnected = () => setPeerCount(peerCount - 1)

        if (!window.experimental || !window.experimental.datPeers) {
            return null
        }

        window.experimental.datPeers.addEventListener("connect", onPeerConnected)
        window.experimental.datPeers.addEventListener("disconnect", onPeerDisconnected)

        return () => {
            window.experimental.datPeers.removeEventListener("connect", onPeerConnected)
            window.experimental.datPeers.removeEventListener("disconnect", onPeerDisconnected)
        }
    }, [peerCount])

    return (
        <div className={props.className}>
            <span>{peerCount}</span>
            <MdPeople className="icon" />
        </div>
    )
}

export default styled(PeerCount)`
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    bottom: 16px;
    display: flex;
    flex-direction: row;
    padding: 0.5rem;
    position: fixed;
    right: 16px;
    z-index: ${(props) => props.theme.layers.peers};

    & > span {
        color: rgba(0, 0, 0, 0.4);
        font-weight: 900;
        margin-right: 0.25rem;
    }

    & > .icon {
        fill: rgba(0, 0, 0, 0.4);
    }
`

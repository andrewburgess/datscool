import classnames from "classnames"
import { truncate } from "lodash"
import React, { useContext, useRef, useState } from "react"
import { MdClose } from "react-icons/md"
import styled from "styled-components"

import Button from "./Button"
import { addSite, SitesContext } from "../context/sites-context"

const AddSiteDialog = (props) => {
    const form = useRef(null)
    const [input, setInput] = useState("")
    const [isValid, setIsValid] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [sites, dispatch] = useContext(SitesContext)

    const onChange = (event) => {
        const value = event.target.value
        setInput(value)
        setErrorMessage("")
        setSuccessMessage("")

        try {
            new URL(value)
            setIsValid(true)
        } catch (e) {
            setIsValid(false)
        }
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (!isValid) {
            return
        }

        try {
            await addSite(input, dispatch)

            setSuccessMessage(`${truncate(input, { length: 40 })} submitted successfully!`)

            setTimeout(() => setSuccessMessage(""), 2000)
            setInput("")

            if (form && form.current) {
                form.current.getElementsByTagName("input")[0].focus()
            }
        } catch (err) {
            setSuccessMessage("")
            if (err.invalidDomainName) {
                setErrorMessage(`${truncate(input, { length: 40 })} is not a valid dat url`)
            } else {
                setErrorMessage(`An error occurred: ${err.message}`)
            }
        }
    }

    return (
        <div className={props.className}>
            <div className="modal">
                <Button className="close" onClick={() => props.onClose()} type="button">
                    <MdClose />
                </Button>
                <form disabled={sites.isSubmitting} onSubmit={onSubmit} ref={form}>
                    <input
                        className={classnames({ error: !!sites.submitErrorMessage })}
                        disabled={sites.isSubmitting}
                        id="url"
                        name="url"
                        onChange={onChange}
                        placeholder="dat://something-or-other/"
                        type="url"
                        value={input}
                    />
                    <Button
                        className="add-button"
                        disabled={!input || !isValid || sites.isSubmitting}
                        id="add-site"
                        onClick={onSubmit}
                        type="submit"
                    >
                        Add Site
                    </Button>
                    <div
                        className={classnames("message", {
                            error: errorMessage,
                            success: successMessage
                        })}
                    >
                        {errorMessage || successMessage}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default styled(AddSiteDialog)`
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${(props) => props.theme.layers.modal};

    &:before {
        background-color: rgba(0, 0, 0, 0.7);
        bottom: 0;
        content: "";
        display: block;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
    }

    .modal {
        align-items: center;
        background-color: #470068;
        border-radius: 16px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
        display: flex;
        left: calc(50% - 25vw);
        min-height: 40vh;
        padding: 2em;
        position: fixed;
        top: calc(50% - 20vh);
        width: 50vw;
    }

    .close {
        background-color: #a00;
        border: none;
        border-radius: 24px;
        height: 48px;
        padding: 0;
        position: absolute;
        right: -16px;
        top: -16px;
        width: 48px;

        & > svg {
            margin: 0;
        }
    }

    form {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
    }

    input {
        background-color: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 0.25em;
        font-family: "Roboto Mono", monospace;
        font-size: 1.5rem;
        padding: 0.75em 0.5em;
        text-align: center;
        width: 90%;
    }

    input,
    .add-button {
        color: #fff;
        margin: 1em;
    }

    .add-button {
        background-color: #12751f;
        border: 4px solid #308a3c;
        font-size: 2em;
        height: auto;
        padding: 1rem 4rem;

        &:hover {
            background-color: #23b136;
            border: 4px solid #54cf64;
        }
    }

    .message {
        bottom: 4rem;
        font-size: 1.5em;
        font-weight: 700;
        left: 0;
        padding: 0 1em;
        position: absolute;
        text-align: center;
        width: 100%;

        &.error {
            color: rgb(255, 4, 4);
        }

        &.success {
            color: rgba(4, 164, 4);
        }
    }
`

import styled from "styled-components"

export default styled.button`
    align-items: center;
    border-radius: 1rem;
    color: #fff;
    cursor: pointer;
    display: flex;
    font-size: 1rem;
    font-weight: 900;
    height: 36px;
    justify-content: center;
    padding: 0 2rem;
    text-transform: uppercase;
    transition: background-color 0.2s, border 0.2s;

    &[disabled] {
        background-color: #666 !important;
        border: 4px solid #999 !important;
        cursor: not-allowed;
        opacity: 0.5;
    }
`

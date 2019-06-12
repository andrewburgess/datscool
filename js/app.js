function getIframe() {
    return document.getElementById("site")
}

const onSiteLoad = function() {
    const iframe = getIframe()

    iframe.removeEventListener("load", onSiteLoad)
    iframe.classList.add("loaded")
}

function loadNextSite() {
    const iframe = getIframe()

    iframe.classList.remove("loaded")
    iframe.addEventListener("load", onSiteLoad)

    iframe.src = "dat://pfrazee.hashbase.io/blog/unwalled-garden"
}

function initialize() {
    const nextButton = document.getElementById("datscool")

    nextButton.addEventListener("click", () => loadNextSite())
}

document.addEventListener("DOMContentLoaded", () => initialize())

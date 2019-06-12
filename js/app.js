const _ = window._

const ADD_SITE = "add:site"
const LAST_UPDATE_KEY = "last-update"
const LOCAL_SITES_KEY = "local-sites"
const VISITED_SITES_KEY = "visited-sites"

class App {
    constructor() {
        this.$addButton = document.getElementById("add")
        this.$addSeed = document.getElementById("seed")
        this.$addSite = document.getElementById("add-site")
        this.$addSiteForm = document.getElementById("add-site-form")
        this.$addSiteModal = document.getElementById("add-site-modal")
        this.$closeModal = document.getElementById("close-modal")
        this.$iframe = document.getElementById("site")
        this.$next = document.getElementById("datscool")
        this.$peerCount = document.getElementById("peer-count")
        this.$removeSeed = document.getElementById("remove-seed")

        this.$addButton.addEventListener("click", () => this.showAddSiteModal())
        this.$addSeed.addEventListener("click", () => this.addSeed())
        this.$addSite.addEventListener("click", (event) => this.addSite(event))
        this.$addSiteForm.addEventListener("submit", (event) => this.addSite(event))
        this.$closeModal.addEventListener("click", () => this.closeAddSiteModal())
        this.$next.addEventListener("click", () => this.loadNextSite())
        this.$removeSeed.addEventListener("click", () => this.removeSeed())

        this.peerCount = 0

        this.onMessageReceived = this.onMessageReceived.bind(this)
        this.onPeerConnected = this.onPeerConnected.bind(this)
        this.onPeerDisconnected = this.onPeerDisconnected.bind(this)
        this.onSiteLoad = this.onSiteLoad.bind(this)

        this.initialize()
    }

    async addSeed() {
        const settings = await experimental.library.requestAdd(this.currentArchiveInfo.url)
        if (settings.isSaved) {
            this.$addSeed.classList.add("hidden")
            this.$removeSeed.classList.remove("hidden")
        }
    }

    async addSite(event) {
        event.preventDefault()
        event.stopPropagation()

        if (this.$addSiteForm.hasAttribute("disabled")) {
            return
        }

        const $error = document.getElementById("add-error-message")
        $error.innerHTML = ""

        const formData = new FormData(this.$addSiteForm)
        const url = formData.get("url")

        this.disableForm()

        try {
            const name = await DatArchive.resolveName(url)
            const parsedUrl = new URL(url)
            const key = `dat://${name}${parsedUrl.pathname}`

            this.insertLocalSite(key, url)
            this.broadcastSite(key, url, new Date().toISOString())

            this.enableForm()
            const inputs = this.$addSiteForm.getElementsByTagName("input")
            for (let input of inputs) {
                input.value = ""
            }
        } catch (err) {
            if (err.invalidDomainName) {
                $error.innerHTML = `<code>${_.truncate(url, {
                    length: 40
                })}</code><br />is not a valid <code>dat</code> url`
                this.enableForm()
                this.$addSiteForm.getElementsByTagName("input")[0].focus()
            }
            console.error(err)
        }
    }

    async broadcastSite(key, url, added) {
        await experimental.datPeers.broadcast({
            type: ADD_SITE,
            payload: {
                added,
                key,
                url
            }
        })
    }

    async checkSeedCapability() {
        if (experimental && experimental.library) {
            // Check if the user will let us read the library
            try {
                await experimental.library.list({ isSaved: true })
                // If we make it here, we're good?
                this.canSeed = true
            } catch (e) {
                // Assume user denied us
                console.error(e)
                document.removeChild(this.$addSeed)
                document.removeChild(this.$removeSeed)
                this.canSeed = false
            }
        } else {
            document.removeChild(this.$addSeed)
            document.removeChild(this.$removeSeed)

            this.canSeed = false
        }
    }

    closeAddSiteModal() {
        this.$addSiteModal.classList.remove("visible")

        const inputs = this.$addSiteForm.getElementsByTagName("input")
        for (let input of inputs) {
            input.value = ""
        }

        this.enableForm()
    }

    disableForm() {
        this.$addSite.setAttribute("disabled", "disabled")
        this.$addSiteForm.setAttribute("disabled", "disabled")
        const inputs = this.$addSiteForm.getElementsByTagName("input")
        for (let input of inputs) {
            input.setAttribute("disabled", "disabled")
        }
    }

    enableForm() {
        this.$addSite.removeAttribute("disabled")
        this.$addSiteForm.removeAttribute("disabled")
        const inputs = this.$addSiteForm.getElementsByTagName("input")
        for (let input of inputs) {
            input.removeAttribute("disabled")
        }
    }

    async enableMessaging() {
        if (!experimental || !experimental.datPeers) {
            alert("This app needs the experimental feature datPeers")
        }

        experimental.datPeers.addEventListener("connect", this.onPeerConnected)
        experimental.datPeers.addEventListener("disconnect", this.onPeerDisconnected)
        experimental.datPeers.addEventListener("message", this.onMessageReceived)

        const peers = await experimental.datPeers.list()
        this.peerCount = this.peerCount + peers.length
        this.updatePeerCount()
    }

    async initialize() {
        if (!localStorage.getItem(LAST_UPDATE_KEY)) {
            localStorage.setItem(LAST_UPDATE_KEY, "")
        }

        if (!localStorage.getItem(LOCAL_SITES_KEY)) {
            localStorage.setItem(LOCAL_SITES_KEY, "{}")
        }

        if (!localStorage.getItem(VISITED_SITES_KEY)) {
            localStorage.setItem(VISITED_SITES_KEY, "[]")
        }

        await this.checkSeedCapability()
        await this.enableMessaging()
        await this.loadSites()

        this.onLoaded()
    }

    insertLocalSite(key, url, date) {
        if (!date) {
            date = new Date().toISOString()
        }

        const local = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))
        if (!local[key]) {
            local[key] = {
                added: date,
                url: url
            }
        }
        localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(local))

        this.sites.push(local[key])
        this.sites = _.uniqBy(this.sites, "url")
    }

    loadNextSite() {
        this.$iframe.src = "about:blank"

        this.$iframe.classList.remove("loaded")
        this.$iframe.addEventListener("load", this.onSiteLoad)

        this.nextSite = _.sample(this.sites)

        if (!this.nextSite) {
            alert("No more sites!")
            return
        }

        this.sites.splice(this.sites.indexOf(this.nextSite), 1)

        this.$iframe.src = this.nextSite.url

        this.$next.setAttribute("disabled", "disabled")
        this.$addSeed.setAttribute("disabled", "disabled")
        this.$removeSeed.setAttribute("disabled", "disabled")
    }

    async loadSites() {
        const archive = new DatArchive(window.location)
        const sitesFile = await archive.readFile("/data/sites.json")
        this.sites = JSON.parse(sitesFile)

        const lastUpdate = new Date(localStorage.getItem(LAST_UPDATE_KEY) || 0)
        const localSites = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))
        const visitedSites = JSON.parse(localStorage.getItem(VISITED_SITES_KEY))

        this.sites = _.uniqBy(
            _.filter({ ...this.sites, ...localSites }, (value, key) => {
                const added = new Date(value.added)
                return added > lastUpdate
            }),
            "url"
        )

        this.sites = _.differenceWith(this.sites, visitedSites, (left, right) => {
            return left.url === right
        })
    }

    onLoaded() {
        this.$addButton.removeAttribute("disabled")
        this.$next.removeAttribute("disabled")
    }

    onMessageReceived(event) {
        const message = event.message
        const payload = message.payload

        switch (message.type) {
            case ADD_SITE:
                this.insertLocalSite(payload.key, payload.url, payload.added)
                break
        }
    }

    onPeerConnected(event) {
        console.log(`${event.peer.id} connected`)

        this.peerCount++
        this.updatePeerCount()
    }

    onPeerDisconnected(event) {
        console.log(`${event.peer.id} disconnected`)

        this.peerCount--
        this.updatePeerCount()
    }

    async onSiteLoad() {
        this.$iframe.removeEventListener("load", this.onSiteLoad)
        this.$iframe.classList.add("loaded")

        this.$next.removeAttribute("disabled")

        this.currentArchive = new DatArchive(this.$iframe.src)
        this.currentArchiveInfo = await this.currentArchive.getInfo()

        const visited = JSON.parse(localStorage.getItem(VISITED_SITES_KEY))
        visited.push(this.nextSite.url)
        localStorage.setItem(VISITED_SITES_KEY, JSON.stringify(visited))

        if (this.canSeed && experimental && experimental.library) {
            const isSeeding = await experimental.library.get(this.currentArchiveInfo.url)

            if (isSeeding.isSaved) {
                this.$addSeed.classList.add("hidden")
                this.$removeSeed.classList.remove("hidden")
            } else {
                this.$addSeed.classList.remove("hidden")
                this.$removeSeed.classList.add("hidden")
            }

            this.$addSeed.removeAttribute("disabled")
            this.$removeSeed.removeAttribute("disabled")
        }
    }

    async removeSeed() {
        const settings = await experimental.library.requestRemove(this.currentArchiveInfo.url)
        if (!settings.isSaved) {
            this.$addSeed.classList.remove("hidden")
            this.$removeSeed.classList.add("hidden")
        }
    }

    async showAddSiteModal() {
        this.$addSiteModal.classList.add("visible")
    }

    updatePeerCount() {
        this.$peerCount.innerText = this.peerCount
    }
}

document.addEventListener("DOMContentLoaded", () => new App())

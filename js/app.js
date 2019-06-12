const _ = window._

const LAST_UPDATE_KEY = "last-update"
const LOCAL_SITES_KEY = "local-sites"
const VISITED_SITES_KEY = "visited-sites"

class App {
    constructor() {
        this.$add = document.getElementById("add")
        this.$addSeed = document.getElementById("seed")
        this.$iframe = document.getElementById("site")
        this.$next = document.getElementById("datscool")
        this.$removeSeed = document.getElementById("remove-seed")

        this.$add.addEventListener("click", () => this.addSite())
        this.$addSeed.addEventListener("click", () => this.addSeed())
        this.$next.addEventListener("click", () => this.loadNextSite())
        this.$removeSeed.addEventListener("click", () => this.removeSeed())

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

    async addSite() {}

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

    async enableMessaging() {
        if (!experimental || !experimental.datPeers) {
            alert("This app needs the experimental feature datPeers")
        }

        experimental.datPeers.addEventListener("connect", this.onPeerConnected)
        experimental.datPeers.addEventListener("disconnect", this.onPeerDisconnected)
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
        this.$add.removeAttribute("disabled")
        this.$next.removeAttribute("disabled")
    }

    onPeerConnected(peer) {
        console.log(`${peer} connected`)
    }

    onPeerDisconnected(peer) {
        console.log(`${peer} disconnected`)
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
}

document.addEventListener("DOMContentLoaded", () => new App())

class App {
    constructor() {
        this.$iframe = document.getElementById("site")
        this.$next = document.getElementById("datscool")
        this.$removeSeed = document.getElementById("remove-seed")
        this.$addSeed = document.getElementById("seed")

        this.$next.addEventListener("click", () => this.loadNextSite())
        this.$removeSeed.addEventListener("click", () => this.removeSeed())
        this.$addSeed.addEventListener("click", () => this.addSeed())

        this.onSiteLoad = this.onSiteLoad.bind(this)

        this.checkSeedCapability()
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

    loadNextSite() {
        this.$iframe.classList.remove("loaded")
        this.$iframe.addEventListener("load", this.onSiteLoad)

        this.$iframe.src = "dat://pfrazee.hashbase.io/blog/unwalled-garden"

        this.$addSeed.setAttribute("disabled", "disabled")
        this.$removeSeed.setAttribute("disabled", "disabled")
    }

    async onSiteLoad() {
        this.$iframe.removeEventListener("load", this.onSiteLoad)
        this.$iframe.classList.add("loaded")

        this.currentArchive = new DatArchive(this.$iframe.src)
        this.currentArchiveInfo = await this.currentArchive.getInfo()

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

    async addSeed() {
        const settings = await experimental.library.requestAdd(this.currentArchiveInfo.url)
        if (settings.isSaved) {
            this.$addSeed.classList.add("hidden")
            this.$removeSeed.classList.remove("hidden")
        }
    }
}

document.addEventListener("DOMContentLoaded", () => new App())

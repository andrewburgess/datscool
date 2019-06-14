import { each, isEmpty, keys, omit, sample } from "lodash"
import React, { createContext, useEffect, useReducer } from "react"

export const ADD_SITE = "sites:add"
export const ADD_SITE_COMPLETE = "sites:add:complete"
export const ADD_SITE_ERROR = "sites:add:error"
export const INSERT_SITE = "sites:insert-site"
export const LOCAL_SITES_KEY = "local-sites"
export const LOAD_NEXT_SITE = "sites:load-next"
export const LOAD_NEXT_SITE_COMPLETE = "sites:loaded-next"
export const LOAD_SITES = "sites:load"
export const LOAD_SITES_COMPLETE = "sites:loaded"
export const RECEIVE_SITES = "sites:receive"
export const REQUEST_SITES = "sites:request"
export const VISITED_SITES_KEY = "visited-sites"

if (!localStorage.getItem(LOCAL_SITES_KEY)) {
    localStorage.setItem(LOCAL_SITES_KEY, "{}")
}

if (!localStorage.getItem(VISITED_SITES_KEY)) {
    localStorage.setItem(VISITED_SITES_KEY, "[]")
}

const SitesContext = createContext([{}, () => {}])

async function normalizeUrl(url) {
    const name = await window.DatArchive.resolveName(url)
    const parsedUrl = new URL(url)
    return `dat://${name}${parsedUrl.pathname}`
}

export const addSite = async (url, dispatch) => {
    dispatch({ type: ADD_SITE, payload: url })

    try {
        const key = await normalizeUrl(url)
        const newSite = {
            added: new Date().toISOString(),
            key,
            url
        }

        dispatch({
            type: INSERT_SITE,
            payload: newSite
        })

        if (window.experimental && window.experimental.datPeers) {
            await window.experimental.datPeers.broadcast({
                type: INSERT_SITE,
                payload: {
                    added: new Date().toISOString(),
                    key,
                    url
                }
            })
        }

        dispatch({
            type: ADD_SITE_COMPLETE
        })
    } catch (err) {
        console.error(err)
        dispatch({
            type: ADD_SITE_ERROR
        })
        throw err
    }
}

const sendSites = async (peer) => {
    const local = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))
    await peer.send({
        type: RECEIVE_SITES,
        payload: local
    })
}

const reducer = (state, action) => {
    switch (action.type) {
        case ADD_SITE:
            return {
                ...state,
                isSubmitting: true,
                submitErrorMessage: ""
            }
        case ADD_SITE_COMPLETE:
            return {
                ...state,
                isSubmitting: false,
                submitErrorMessage: ""
            }
        case ADD_SITE_ERROR:
            return {
                ...state,
                isSubmitting: false
            }
        case INSERT_SITE:
            const date = action.payload.added || new Date().toISOString()
            const local = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))

            const newSite = {
                added: date,
                url: action.payload.url
            }

            if (!local[action.payload.key]) {
                local[action.payload.key] = newSite
            }

            localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(local))

            return {
                ...state,
                isEmpty: false,
                sites: {
                    ...state.sites,
                    [action.payload.key]: newSite
                }
            }
        case LOAD_NEXT_SITE:
            if (state.loading) {
                return state
            }

            const nextKey = sample(keys(state.sites))

            if (!nextKey) {
                return {
                    ...state,
                    isEmpty: true
                }
            }

            const nextSite = state.sites[nextKey]

            const nextSites = {
                ...omit(state.sites, nextKey)
            }

            const visited = JSON.parse(localStorage.getItem(VISITED_SITES_KEY))
            visited.push(nextKey)
            localStorage.setItem(VISITED_SITES_KEY, JSON.stringify(visited))

            return {
                ...state,
                currentSite: nextSite,
                currentSiteKey: nextKey,
                loading: true,
                sites: nextSites
            }
        case LOAD_NEXT_SITE_COMPLETE:
            return {
                ...state,
                loading: false
            }
        case LOAD_SITES:
            return {
                ...state,
                loading: true
            }
        case LOAD_SITES_COMPLETE:
            return {
                ...state,
                isEmpty: keys(action.payload).length === 0,
                loading: false,
                sites: action.payload
            }
        case RECEIVE_SITES: {
            const local = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))

            const sites = {
                ...local,
                ...action.payload
            }

            localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(sites))

            const visitedSites = JSON.parse(localStorage.getItem(VISITED_SITES_KEY))
            each(visitedSites, (visited) => {
                delete sites[visited]
            })

            return {
                ...state,
                sites: {
                    ...state.sites,
                    ...sites
                }
            }
        }
        default:
            return state
    }
}

const SitesProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, {
        currentSite: null,
        currentSiteKey: null,
        isEmpty: false,
        isSubmitting: false,
        loading: false,
        sites: {},
        submitErrorMessage: ""
    })

    useEffect(() => {
        const loadSites = async () => {
            dispatch({
                type: LOAD_SITES
            })

            const archive = new window.DatArchive(window.location)
            const sitesFile = await archive.readFile("/data/sites.json")
            const rawSites = JSON.parse(sitesFile)

            const localSites = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))
            const visitedSites = JSON.parse(localStorage.getItem(VISITED_SITES_KEY))

            const sites = { ...rawSites, ...localSites }

            each(visitedSites, (visited) => {
                delete sites[visited]
            })

            each(rawSites, (rawSite, rawSiteKey) => {
                delete localSites[rawSiteKey]
            })

            localStorage.setItem(LOCAL_SITES_KEY, JSON.stringify(localSites))

            // Request sites from remote peers
            if (window.experimental && window.experimental.datPeers) {
                await window.experimental.datPeers.broadcast({
                    type: REQUEST_SITES
                })
            }

            dispatch({
                type: LOAD_SITES_COMPLETE,
                payload: sites
            })
        }

        loadSites()
    }, [])

    useEffect(() => {
        if (!window.experimental || !window.experimental.datPeers) {
            return
        }

        const onPeerConnected = async (event) => {
            await event.peer.send({
                type: REQUEST_SITES
            })
        }

        const onMessageReceived = (event) => {
            const message = event.message
            if (!message.type) {
                return
            }

            if (message.type === REQUEST_SITES) {
                sendSites(event.peer, message.payload)
            } else {
                dispatch(message)
            }
        }

        window.experimental.datPeers.addEventListener("connect", onPeerConnected)
        window.experimental.datPeers.addEventListener("message", onMessageReceived)

        return () => {
            window.experimental.datPeers.removeEventListener("message", onMessageReceived)
            window.experimental.datPeers.removeEventListener("connect", onPeerConnected)
        }
    }, [])

    useEffect(() => {
        let interval = 0

        const updateArchive = async () => {
            const archive = new window.DatArchive(window.location)
            const info = await archive.getInfo()

            if (!info.isOwner) {
                return
            }

            interval = setInterval(async () => {
                const local = JSON.parse(localStorage.getItem(LOCAL_SITES_KEY))

                if (isEmpty(local)) {
                    return
                }

                // Clear out sites in local storage
                localStorage.setItem(LOCAL_SITES_KEY, "{}")

                const sitesFile = await archive.readFile("/data/sites.json")
                let sites = JSON.parse(sitesFile)

                sites = {
                    ...sites,
                    ...local
                }

                await archive.writeFile("/data/sites.json", JSON.stringify(sites, null, 2), "utf8")

                if (archive.commit && typeof archive.commit === "function") {
                    await archive.commit()
                }
            }, 1000 * 60 * 60)
        }

        updateArchive()

        return () => clearInterval(interval)
    }, [])

    return <SitesContext.Provider value={[state, dispatch]}>{props.children}</SitesContext.Provider>
}

export { SitesContext, SitesProvider }

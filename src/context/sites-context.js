import { each, keys, omit, sample } from "lodash"
import React, { createContext, useEffect, useReducer } from "react"

export const ADD_SITE = "sites:add"
export const ADD_SITE_COMPLETE = "sites:add:complete"
export const ADD_SITE_ERROR = "sites:add:error"
export const INSERT_SITE = "sites:insert-site"
export const LAST_UPDATE_KEY = "last-update"
export const LOCAL_SITES_KEY = "local-sites"
export const LOAD_NEXT_SITE = "sites:load-next"
export const LOAD_NEXT_SITE_COMPLETE = "sites:loaded-next"
export const LOAD_SITES = "sites:load"
export const LOAD_SITES_COMPLETE = "sites:loaded"
export const VISITED_SITES_KEY = "visited-sites"

if (!localStorage.getItem(LAST_UPDATE_KEY)) {
    localStorage.setItem(LAST_UPDATE_KEY, "")
}

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

        const onMessageReceived = (event) => {
            const message = event.message
            if (!message.type) {
                return
            }

            dispatch(message)
        }

        window.experimental.datPeers.addEventListener("message", onMessageReceived)

        return () => window.experimental.datPeers.removeEventListener("message", onMessageReceived)
    }, [])

    return <SitesContext.Provider value={[state, dispatch]}>{props.children}</SitesContext.Provider>
}

export { SitesContext, SitesProvider }

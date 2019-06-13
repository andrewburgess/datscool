import { each } from "lodash"
import React, { createContext, useEffect, useReducer } from "react"

export const LAST_UPDATE_KEY = "last-update"
export const LOCAL_SITES_KEY = "local-sites"
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

const reducer = (state, action) => {
    switch (action.type) {
        case LOAD_SITES:
            return {
                ...state,
                loading: true
            }
        case LOAD_SITES_COMPLETE:
            return {
                ...state,
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
        loading: false,
        sites: {}
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

    return <SitesContext.Provider value={[state, dispatch]}>{props.children}</SitesContext.Provider>
}

export { SitesContext, SitesProvider }

import { useState } from 'react'
import dayjs from 'dayjs'
import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { DynamicTabType, InitTabType, ParsedTabsData } from './Types'

const FALLBACK_TAB = 1

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const getNewTabComponentKey = (id) => {
        return `${id}-${dayjs().toString()}`
    }

    const populateTabData = (
        id: string,
        name: string,
        url: string,
        isSelected: boolean,
        title: string,
        position: number,
        showNameOnSelect: boolean,
        iconPath = '',
        dynamicTitle = '',
        isAlive = false,
    ) => {
        return {
            id,
            name,
            url,
            isSelected,
            title: title || name,
            isDeleted: false,
            position,
            iconPath,
            dynamicTitle,
            showNameOnSelect,
            isAlive,
            lastSyncMoment: dayjs(),
            componentKey: getNewTabComponentKey(id),
        } as DynamicTabType
    }

    /**
     * To serialize tab data and store it in localStorage. The stored data can be retrieved
     * when initializing tabs to maintain their state across page loads.
     *
     * @param {DynamicTabType[]} _tabs - Array of tab data
     * @param {ParsedTabsData} [parsedTabsData] - (Optional) previously parsed tab data.
     * @returns {string} - JSON string representing tab data
     */
    const stringifyData = (_tabs: DynamicTabType[], parsedTabsData?: ParsedTabsData) => {
        let _parsedTabsData: typeof parsedTabsData

        if (parsedTabsData) {
            _parsedTabsData = parsedTabsData
        } else {
            const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            try {
                _parsedTabsData = JSON.parse(persistedTabsData)
            } catch (err) {
                noop()
            }
        }

        return JSON.stringify({
            ..._parsedTabsData,
            key: persistanceKey,
            data: _tabs,
        })
    }

    /**
     * Populates tab data for initializing a new tab.
     *
     * @param {InitTabType} _initTab - Data for initializing the new tab
     * @returns {DynamicTabType} - Tab data for initialization
     */
    const populateInitTab = (_initTab: InitTabType) => {
        const title = _initTab.kind ? `${_initTab.kind}/${_initTab.name}` : _initTab.name
        const _id = `${_initTab.idPrefix}-${title}`
        return populateTabData(
            _id,
            _initTab.name,
            _initTab.url,
            _initTab.isSelected,
            title,
            _initTab.position,
            _initTab.showNameOnSelect,
            _initTab.iconPath,
            _initTab.dynamicTitle,
            !!_initTab.isAlive,
        )
    }

    /**
     * This function initializes the tabs with an array of InitTabType objects.
     * It allows for reinitializing tabs,removing specific tabs, and ensuring
     * that tabs are not duplicated. It uses localStorage to store and retrieve tab data.
     *
     * @param {InitTabType[]} initTabsData - An array of initial tab data
     * @param {boolean} [reInit=false] - If true, re-initialize the tabs
     * @param {string[]} [tabsToRemove] - An array of tab IDs to be removed
     * @returns {DynamicTabType[]} - An array of initialized tabs
     */
    const initTabs = (initTabsData: InitTabType[], reInit?: boolean, tabsToRemove?: string[]) => {
        let _tabs: DynamicTabType[] = []
        let parsedTabsData: ParsedTabsData
        setTabs((prevTabs) => {
            if (!reInit) {
                /* FIXME: graceful handling of data upon finding old persisted-tabs-data */
                const persistedTabsData = localStorage.getItem('persisted-tabs-data')
                try {
                    parsedTabsData = JSON.parse(persistedTabsData)
                    _tabs = persistedTabsData ? parsedTabsData.data : prevTabs
                } catch (err) {
                    _tabs = prevTabs
                }
            }
            _tabs.forEach((_tab) => {
                // eslint-disable-next-line no-param-reassign
                _tab.isSelected = false
            })
            if (_tabs.length > 0) {
                if (tabsToRemove?.length) {
                    _tabs = _tabs.filter((_tab) => tabsToRemove.indexOf(_tab.id) === -1)
                }
                const tabNamesSet = _tabs.map((_tab) => _tab.name)
                const initTabsNotInTabs = initTabsData.filter((_initTab) => {
                    const index = tabNamesSet.indexOf(_initTab.name)
                    if (index === -1) {
                        return true
                    }
                    _tabs[index].isSelected = _initTab.isSelected
                    /* NOTE: dynamic title might get updated between re-initialization */
                    _tabs[index].dynamicTitle = _initTab.dynamicTitle
                    return false
                })
                _tabs = _tabs.concat(initTabsNotInTabs.map((_initTab) => populateInitTab(_initTab)))
            } else {
                initTabsData.forEach((_initTab) => {
                    _tabs.push(populateInitTab(_initTab))
                })
            }
            // eslint-disable-next-line no-unused-expressions
            _tabs.some((_tab) => _tab.isSelected) || (_tabs[FALLBACK_TAB].isSelected = true)
            _tabs.sort((a, b) => {
                /* NOTE: to mitigate Integer overflow using this comparison */
                if (a.position < b.position) {
                    return -1
                }
                if (a.position === b.position) {
                    return 0
                }
                return 1
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs, parsedTabsData))
            return _tabs
        })
    }

    /**
     * This function allows adding new tabs. It checks if a tab with a similar title already exists,
     * and if so, it updates the existing tab. Otherwise, it adds a new tab to the collection.
     *
     * @param {string} idPrefix - Prefix for generating tab IDs
     * @param {string} kind - Kind of tab
     * @param {string} name - Name of the tab
     * @param {string} url - URL for the tab
     * @param {boolean} [position] - Specify the tabs position. If position is POS_INFY it's a dynamic tab.
     * @param {string} [iconPath] - Path to the tab's icon
     * @param {string} [dynamicTitle] - Dynamic title for the tab
     * @param {boolean} [showNameOnSelect] - Whether to show the tab name when selected
     * @param {boolean} [isAlive] - indicates if showNameOnSelect tabs have been selected once
     * @returns {boolean} True if the tab was successfully added
     * @returns {Promise<boolean>} - A promise resolving if the tab was found. If tab is not found a new tab is added
     */
    const addTab = (
        idPrefix: string,
        kind: string,
        name: string,
        url: string,
        showNameOnSelect = false,
        position = Number.MAX_SAFE_INTEGER,
    ): Promise<boolean> => {
        if (!name || !url || !kind) {
            return Promise.resolve(false)
        }
        // @ts-expect-error available on all modern browsers
        const { promise, resolve } = Promise.withResolvers<boolean>()

        const title = `${kind}/${name}`
        const _id = `${idPrefix}-${title}`

        setTabs((prevTabs) => {
            let found = false
            const _tabs = prevTabs.map((tab) => {
                const matched = tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id
                found = found || matched
                return matched
                    ? {
                          ...tab,
                          url,
                          isSelected: true,
                      }
                    : {
                          ...tab,
                          isSelected: false,
                      }
            })

            if (!found) {
                _tabs.push(populateTabData(_id, name, url, true, title, position, showNameOnSelect))
            }
            resolve(!found)
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })

        return promise
    }

    /**
     * This function removes a tab by its identifier (id). If the removed tab was selected,
     * it ensures that another tab becomes selected.
     *
     * @param {string} id - The identifier of the tab to be removed
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was removed
     */
    const removeTabByIdentifier = (id: string): Promise<string> => {
        // @ts-expect-error available on all modern browsers
        const { promise, resolve } = Promise.withResolvers<string>()

        setTabs((prevTabs) => {
            let selectedRemoved = false

            /* NOTE: wasnt this asynchronous? why expect pushURL to not be null? */
            const _tabs = prevTabs.filter((tab) => {
                if (tab.id === id) {
                    selectedRemoved = tab.isSelected
                    return false
                }
                return true
            })
            if (selectedRemoved) {
                /* NOTE: inconsistent behaviour b/w stopTab(line 248) & here */
                _tabs[FALLBACK_TAB].isSelected = true
                resolve(_tabs[FALLBACK_TAB].url)
            } else {
                resolve('')
            }
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })

        return promise
    }

    /**
     * Stops or deactivate a tab by its title.
     *
     * @param {string} title - The title of the tab to be stopped
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was stopped
     */
    const stopTabByIdentifier = (id: string): Promise<string> => {
        // @ts-expect-error available on all modern browsers
        const { promise, resolve } = Promise.withResolvers<string>()

        setTabs((prevTabs) => {
            let selectedRemoved = false

            const _tabs = prevTabs.map((tab) => {
                if (tab.id === id) {
                    selectedRemoved = tab.isSelected
                    return {
                        ...tab,
                        isSelected: false,
                        isAlive: false,
                    }
                }
                return tab
            })
            if (selectedRemoved) {
                _tabs[FALLBACK_TAB].isSelected = true
                resolve(_tabs[FALLBACK_TAB].url)
            } else {
                resolve('')
            }
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })

        return promise
    }

    /**
     * This function is used to mark a tab as active based on its identifier (id or title).
     * It can also update the URL associated with the tab
     *
     * @param {string} idPrefix - Prefix for generating tab IDs
     * @param {string} name - Name of the tab
     * @param {string} kind - Kind of tab
     * @param {string} [url] - URL for the tab
     * @returns {boolean} - True if the tab was found and marked as active
     */
    const markTabActiveByIdentifier = (idPrefix: string, name: string, kind?: string, url?: string): boolean => {
        if (!name) {
            return false
        }

        let isTabFound = false
        let title = name
        if (kind) {
            title = `${kind}/${name}`
        }

        const _id = `${idPrefix}-${title}`

        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                const isMatch = tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id
                isTabFound = isMatch || isTabFound
                return {
                    ...tab,
                    isSelected: isMatch,
                    url: (isMatch && url) || tab.url,
                    ...((isMatch && tab.showNameOnSelect && { isAlive: true }) || {}),
                }
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
        return isTabFound
    }

    /**
     * This function is used to mark a tab as active based on its Id
     *
     * @param {string} id - Tab Id
     * @returns {boolean} - True if the tab was found and marked as active
     */
    const markTabActiveById = (id: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                const isMatch = tab.id === id
                return {
                    ...tab,
                    isSelected: isMatch,
                    ...((isMatch && tab.showNameOnSelect && { isAlive: true }) || {}),
                }
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
    }

    /**
     * This function marks a tab as deleted by its identifier.
     *
     * @param {string} idPrefix - Prefix for generating tab IDs
     * @param {string} name - Name of the tab
     * @param {string} kind - Kind of tab
     */
    const markTabResourceDeletedByIdentifier = (idPrefix: string, name: string, kind?: string) => {
        let title = name
        if (kind) {
            title = `${kind}/${name}`
        }

        const _id = `${idPrefix}-${title}`
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                return tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id
                    ? {
                          ...tab,
                          isDeleted: true,
                      }
                    : tab
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
    }

    /**
     * Updates the URL of a tab by its identifier.
     *
     * @param {string} id - Identifier of the tab to update
     * @param {string} url - New URL for the tab
     * @param {string} [dynamicTitle] - Dynamic title for the tab
     */
    const updateTabUrl = (id: string, url: string, dynamicTitle?: string, retainSearchParams = false) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                return tab.id === id
                    ? {
                          ...tab,
                          url: retainSearchParams ? `${url}?${tab.url.split('?')[1] || ''}` : url,
                          dynamicTitle: dynamicTitle || tab.dynamicTitle,
                      }
                    : tab
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
    }

    /* TODO: reuse this */
    const getTabId = (idPrefix: string, name: string) => {
        return `${idPrefix}-${name}`
    }

    const updateTabComponentKey = (id: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                return tab.id === id
                    ? {
                          ...tab,
                          componentKey: getNewTabComponentKey(id),
                      }
                    : tab
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
    }

    const updateTabLastSyncMoment = (id: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                return tab.id === id
                    ? {
                          ...tab,
                          lastSyncMoment: dayjs(),
                      }
                    : tab
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
    }

    return {
        tabs,
        initTabs,
        addTab,
        removeTabByIdentifier,
        markTabActiveByIdentifier,
        markTabActiveById,
        markTabResourceDeletedByIdentifier,
        updateTabUrl,
        getTabId,
        updateTabComponentKey,
        updateTabLastSyncMoment,
        stopTabByIdentifier,
    }
}

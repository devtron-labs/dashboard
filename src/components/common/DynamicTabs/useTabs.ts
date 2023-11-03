import { useState } from 'react'
import { DynamicTabType, InitTabType } from './Types'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const populateTabData = (
        id: string,
        name: string,
        url: string,
        isSelected: boolean,
        title: string,
        positionFixed: boolean,
        iconPath: string,
        dynamicTitle: string,
        showNameOnSelect: boolean,
    ) => {
        return {
            id,
            name,
            url,
            isSelected,
            title: title || name,
            isDeleted: false,
            positionFixed,
            iconPath,
            dynamicTitle,
            showNameOnSelect,
        } as DynamicTabType
    }

    /**
     * To serialize tab data and store it in localStorage. The stored data can be retrieved
     * when initializing tabs to maintain their state across page loads.
     * 
     * @param {DynamicTabType[]} _tabs - Array of tab data
     * @param {Record<string, any>} [parsedTabsData] - (Optional) previously parsed tab data.
     * @returns {string} - JSON string representing tab data
     */
    const stringifyData = (_tabs: any[], parsedTabsData?: Record<string, any>) => {
        let _parsedTabsData: Record<string, any> = {}

        if (parsedTabsData) {
            _parsedTabsData = parsedTabsData
        } else {
            const persistedTabsData = localStorage.getItem('persisted-tabs-data')
            try {
                _parsedTabsData = JSON.parse(persistedTabsData)
            } catch (err) {}
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
     * @param {number} idx - Index to determine if the tab should be selected 
     * @returns {DynamicTabType} - Tab data for initialization
     */
    const populateInitTab = (_initTab: InitTabType, idx: number) => {
        const url = `${_initTab.url}${_initTab.url.endsWith('/') ? '' : '/'}`
        const title = _initTab.kind ? `${_initTab.kind}/${_initTab.name}` : _initTab.name
        const _id = `${_initTab.idPrefix}-${title}`
        return populateTabData(
            _id,
            title,
            url,
            idx === 0,
            title,
            _initTab.positionFixed,
            _initTab.iconPath,
            _initTab.dynamicTitle,
            _initTab.showNameOnSelect,
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
        let parsedTabsData: Record<string, any> = {}
        setTabs((prevTabs) => {
            if (!reInit) {
                const persistedTabsData = localStorage.getItem('persisted-tabs-data')
                try {
                    parsedTabsData = JSON.parse(persistedTabsData)
                    _tabs = persistedTabsData ? parsedTabsData.data : prevTabs
                } catch (err) {
                    _tabs = prevTabs
                }
            }
            if (_tabs.length > 0) {
                if (tabsToRemove?.length) {
                    _tabs = _tabs.filter((_tab) => tabsToRemove.indexOf(_tab.id) === -1)
                }
                const tabNames = _tabs.map((_tab) => _tab.name)
                initTabsData.forEach((_initTab, idx) => {
                    if (!tabNames.includes(_initTab.name)) {
                        _tabs.push(populateInitTab(_initTab, idx))
                    }
                })
            } else {
                initTabsData.forEach((_initTab, idx) => {
                    _tabs.push(populateInitTab(_initTab, idx))
                })
            }
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
     * @param {boolean} [positionFixed] - Whether the tab's position is fixed 
     * @param {string} [iconPath] - Path to the tab's icon 
     * @param {string} [dynamicTitle] - Dynamic title for the tab 
     * @param {boolean} [showNameOnSelect] - Whether to show the tab name when selected 
     * @returns {boolean} True if the tab was successfully added
     */
    const addTab = (
        idPrefix: string,
        kind: string,
        name: string,
        url: string,
        positionFixed?: boolean,
        iconPath?: string,
        dynamicTitle?: string,
        showNameOnSelect?: boolean,
    ): boolean => {
        if (!name || !url || !kind) return

        const title = `${kind}/${name}`
        let alreadyAdded = false
        const _id = `${idPrefix}-${title}`

        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                tab.isSelected = false
                if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                    tab.isSelected = true
                    tab.url = url
                    alreadyAdded = true
                }
                return tab
            })

            if (!alreadyAdded) {
                _tabs.push(
                    populateTabData(
                        _id,
                        title,
                        url,
                        true,
                        title,
                        positionFixed,
                        iconPath,
                        dynamicTitle,
                        showNameOnSelect,
                    ),
                )
            }
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
        return true
    }

    /**
     * This function removes a tab by its identifier (id). If the removed tab was selected,
     * it ensures that another tab becomes selected.
     * 
     * @param {string} id - The identifier of the tab to be removed 
     * @returns {string} - URL of the tab to navigate to after removal
     */
    const removeTabByIdentifier = (id: string): string => {
        let pushURL = ''
        let selectedRemoved = false
        setTabs((prevTabs) => {
            const _tabs = prevTabs.filter((tab) => {
                if (tab.id === id) {
                    selectedRemoved = tab.isSelected
                    return false
                }
                return true
            })

            if (selectedRemoved) {
                _tabs[0].isSelected = true
                pushURL = _tabs[0].url
            }

            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
        return pushURL
    }

    /**
     * Stops or deactivate a tab by its title.
     * 
     * @param {string} title - The title of the tab to be stopped 
     * @returns {string} - URL of the tab to navigate to after stopping
     */
    const stopTabByIdentifier = (title: string): string => {
        let pushURL = ''
        let selectedRemoved = false

        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                if (tab.title.toLowerCase() === title.toLowerCase()) {
                    selectedRemoved = tab.isSelected
                    return {
                        ...tab,
                        url: tab.url.split('?')[0],
                        isSelected: false,
                    }
                } else return tab
            })
            if (selectedRemoved) {
                _tabs[0].isSelected = true
                pushURL = _tabs[0].url
            }
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })

        return pushURL
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
    const markTabActiveByIdentifier = (idPrefix: string, name: string, kind?: string, url?: string) => {
        if (!name) return

        let isTabFound = false
        let title = name
        if (kind) {
            title = kind + '/' + name
        }

        const _id = `${idPrefix}-${title}`

        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                tab.isSelected = false
                if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                    tab.isSelected = true
                    tab.url = url || tab.url
                    isTabFound = true
                }
                return tab
            })
            localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
            return _tabs
        })
        return isTabFound
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
            title = kind + '/' + name
        }

        const _id = `${idPrefix}-${title}`
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                if (tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id) {
                    tab.isDeleted = true
                }
                return tab
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
    const updateTabUrl = (id: string, url: string, dynamicTitle?: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                if (tab.id === id) {
                    tab.url = url
                    tab.dynamicTitle = dynamicTitle || ''
                }
                return tab
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
        markTabResourceDeletedByIdentifier,
        updateTabUrl,
        stopTabByIdentifier,
    }
}

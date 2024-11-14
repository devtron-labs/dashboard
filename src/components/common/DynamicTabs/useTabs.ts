/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import dayjs from 'dayjs'
import { noop, InitTabType, DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import { AddTabParamsType, ParsedTabsData, PopulateTabDataPropsType } from './Types'
import { FALLBACK_TAB, TAB_DATA_LOCAL_STORAGE_KEY } from './constants'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const getNewTabComponentKey = (id) => `${id}-${dayjs().toString()}`

    const getIdFromIdPrefixAndTitle = ({
        idPrefix,
        title,
    }: Pick<AddTabParamsType, 'idPrefix'> & Pick<PopulateTabDataPropsType, 'title'>) => `${idPrefix}-${title}`

    const getTitleFromKindAndName = ({ kind, name }: Pick<InitTabType, 'kind' | 'name'>) =>
        kind ? `${kind}/${name}` : name

    const populateTabData = ({
        id,
        name,
        url,
        isSelected,
        title,
        position,
        showNameOnSelect,
        iconPath = '',
        dynamicTitle = '',
        isAlive = false,
        hideName = false,
        tippyConfig,
    }: PopulateTabDataPropsType): DynamicTabType => ({
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
        hideName,
        isAlive,
        lastSyncMoment: dayjs(),
        componentKey: getNewTabComponentKey(id),
        tippyConfig,
    })

    const getTabDataFromLocalStorage = () => localStorage.getItem(TAB_DATA_LOCAL_STORAGE_KEY)

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
            const persistedTabsData = getTabDataFromLocalStorage()
            try {
                _parsedTabsData = JSON.parse(persistedTabsData)
            } catch {
                noop()
            }
        }

        return JSON.stringify({
            ..._parsedTabsData,
            key: persistanceKey,
            data: _tabs,
        })
    }

    const updateTabsInLocalStorage = (_tabs: DynamicTabType[]) => {
        localStorage.setItem(TAB_DATA_LOCAL_STORAGE_KEY, stringifyData(_tabs))
    }

    /**
     * Populates tab data for initializing a new tab.
     *
     * @param {InitTabType} _initTab - Data for initializing the new tab
     * @returns {DynamicTabType} - Tab data for initialization
     */
    const populateInitTab = (_initTab: InitTabType) => {
        const title = getTitleFromKindAndName({
            kind: _initTab.kind,
            name: _initTab.name,
        })

        const _id = getIdFromIdPrefixAndTitle({
            idPrefix: _initTab.idPrefix,
            title,
        })

        return populateTabData({
            id: _id,
            name: _initTab.name,
            url: _initTab.url,
            isSelected: _initTab.isSelected,
            title,
            position: _initTab.position,
            showNameOnSelect: _initTab.showNameOnSelect,
            iconPath: _initTab.iconPath,
            dynamicTitle: _initTab.dynamicTitle,
            isAlive: !!_initTab.isAlive,
            hideName: _initTab.hideName,
            tippyConfig: _initTab.tippyConfig,
        })
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

        setTabs((_prevTabs) => {
            const prevTabs = structuredClone(_prevTabs)

            if (!reInit) {
                const persistedTabsData = getTabDataFromLocalStorage()
                try {
                    parsedTabsData = JSON.parse(persistedTabsData)
                    _tabs = persistedTabsData ? parsedTabsData.data : prevTabs
                } catch {
                    _tabs = prevTabs
                }
            }
            if (_tabs.length > 0) {
                _tabs = _tabs.map((_tab, index) => ({
                    ..._tab,
                    isSelected: false,
                    /* NOTE: following lines migrate old tab data to new */
                    lastSyncMoment: dayjs(),
                    position: 'positionFixed' in _tab && _tab.positionFixed ? index : Number.MAX_SAFE_INTEGER,
                    ...(_tab.componentKey
                        ? { componentKey: _tab.componentKey }
                        : { componentKey: getNewTabComponentKey(_tab.id) }),
                    ...(_tab.isAlive ? { isAlive: _tab.isAlive } : { isAlive: false }),
                }))
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
                    _tabs[index].isAlive = _initTab.isAlive
                    _tabs[index].position = _initTab.position
                    return false
                })
                _tabs = _tabs.concat(initTabsNotInTabs.map((_initTab) => populateInitTab(_initTab)))
            } else {
                initTabsData.forEach((_initTab) => {
                    _tabs.push(populateInitTab(_initTab))
                })
            }
            if (!_tabs.some((_tab) => _tab.isSelected)) {
                _tabs[FALLBACK_TAB].isSelected = true
            }
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
            localStorage.setItem(TAB_DATA_LOCAL_STORAGE_KEY, stringifyData(_tabs, parsedTabsData))
            return _tabs
        })
    }

    /**
     * This function allows adding new tabs. It checks if a tab with a similar title already exists,
     * and if so, it updates the existing tab. Otherwise, it adds a new tab to the collection.
     *
     * @returns {boolean} True if the tab was successfully added
     * @returns {Promise<boolean>} - A promise resolving if the tab was found. If tab is not found a new tab is added
     */
    const addTab = ({
        idPrefix,
        kind,
        name,
        url,
        showNameOnSelect = false,
        position = Number.MAX_SAFE_INTEGER,
        iconPath = '',
        dynamicTitle = '',
        tippyConfig = null,
    }: AddTabParamsType): Promise<boolean> => {
        if (!name || !url || !kind) {
            return Promise.resolve(false)
        }

        return new Promise((resolve) => {
            const title = getTitleFromKindAndName({
                kind,
                name,
            })
            const _id = getIdFromIdPrefixAndTitle({
                idPrefix,
                title,
            })

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
                    _tabs.push(
                        populateTabData({
                            id: _id,
                            name,
                            url,
                            isSelected: true,
                            title,
                            position,
                            showNameOnSelect,
                            iconPath,
                            dynamicTitle,
                            tippyConfig,
                        }),
                    )
                }
                resolve(!found)
                updateTabsInLocalStorage(_tabs)
                return _tabs
            })
        })
    }

    /**
     * This function removes a tab by its identifier (id). If the removed tab was selected,
     * it ensures that another tab becomes selected.
     *
     * @param {string} id - The identifier of the tab to be removed
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was removed
     */
    const removeTabByIdentifier = (id: string): Promise<string> =>
        new Promise((resolve) => {
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
                updateTabsInLocalStorage(_tabs)
                return _tabs
            })
        })

    /**
     * Stops or deactivate a tab by its title.
     *
     * @param {string} title - The title of the tab to be stopped
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was stopped
     */
    const stopTabByIdentifier = (id: string): Promise<string> =>
        new Promise((resolve) => {
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
                updateTabsInLocalStorage(_tabs)
                return _tabs
            })
        })

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

        const _id = getIdFromIdPrefixAndTitle({
            idPrefix,
            title,
        })

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
            updateTabsInLocalStorage(_tabs)
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
        if (!id) {
            return
        }
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                const isMatch = tab.id === id
                return {
                    ...tab,
                    isSelected: isMatch,
                    ...((isMatch && tab.showNameOnSelect && { isAlive: true }) || {}),
                }
            })
            updateTabsInLocalStorage(_tabs)
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

        const _id = getIdFromIdPrefixAndTitle({
            idPrefix,
            title,
        })
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) =>
                tab.title.toLowerCase() === title.toLowerCase() && tab.id === _id
                    ? {
                          ...tab,
                          isDeleted: true,
                      }
                    : tab,
            )
            updateTabsInLocalStorage(_tabs)
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
            const _tabs = prevTabs.map((tab) =>
                tab.id === id
                    ? {
                          ...tab,
                          url: retainSearchParams ? `${url}?${tab.url.split('?')[1] || ''}` : url,
                          dynamicTitle: dynamicTitle || tab.dynamicTitle,
                      }
                    : tab,
            )
            updateTabsInLocalStorage(_tabs)
            return _tabs
        })
    }

    const getTabId = (idPrefix: string, name: string, kind: string) => {
        const title = getTitleFromKindAndName({
            kind,
            name,
        })

        return getIdFromIdPrefixAndTitle({
            idPrefix,
            title,
        })
    }

    const updateTabComponentKey = (id: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) =>
                tab.id === id
                    ? {
                          ...tab,
                          componentKey: getNewTabComponentKey(id),
                      }
                    : tab,
            )
            updateTabsInLocalStorage(_tabs)
            return _tabs
        })
    }

    const updateTabLastSyncMoment = (id: string) => {
        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) =>
                tab.id === id
                    ? {
                          ...tab,
                          lastSyncMoment: dayjs(),
                      }
                    : tab,
            )
            updateTabsInLocalStorage(_tabs)
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

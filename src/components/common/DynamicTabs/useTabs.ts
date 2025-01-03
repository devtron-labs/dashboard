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

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { noop, InitTabType, DynamicTabType } from '@devtron-labs/devtron-fe-common-lib'
import { AddTabParamsType, ParsedTabsData, PopulateTabDataPropsType, UpdateTabUrlParamsType } from './Types'
import { FALLBACK_TAB, TAB_DATA_LOCAL_STORAGE_KEY, TAB_DATA_VERSION } from './constants'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const tabIdToTabMap = useMemo(
        () =>
            tabs.reduce((acc, tab) => {
                acc[tab.id] = tab

                return acc
            }, {}),
        [tabs],
    )

    const getNewTabComponentKey = (id: DynamicTabType['id']): string => `${id}-${dayjs().toString()}`

    const getTabById = (id: DynamicTabType['id']): DynamicTabType | null => tabIdToTabMap[id] ?? null

    const getIdFromIdPrefixAndTitle = ({
        idPrefix,
        title,
    }: Pick<AddTabParamsType, 'idPrefix'> & Pick<PopulateTabDataPropsType, 'title'>): string => `${idPrefix}-${title}`

    const getTitleFromKindAndName = ({ kind, name }: Pick<InitTabType, 'kind' | 'name'>): string =>
        kind ? `${kind}/${name}` : name

    const getlastActiveTabIdFromTabs = (
        _tabs: DynamicTabType[],
        id: DynamicTabType['id'],
    ): DynamicTabType['lastActiveTabId'] | null => {
        const selectedTabId = _tabs.find((tab) => tab.isSelected)?.id ?? null

        return selectedTabId !== id ? selectedTabId : null
    }

    const populateTabData = ({
        id,
        name,
        url,
        isSelected,
        title,
        type,
        showNameOnSelect,
        iconPath = '',
        dynamicTitle = '',
        isAlive = false,
        hideName = false,
        tippyConfig,
        lastActiveTabId,
        shouldRemainMounted,
    }: PopulateTabDataPropsType): DynamicTabType => ({
        id,
        name,
        url,
        isSelected,
        title: title || name,
        isDeleted: false,
        type,
        iconPath,
        dynamicTitle,
        showNameOnSelect,
        hideName,
        isAlive,
        lastSyncMoment: dayjs(),
        componentKey: getNewTabComponentKey(id),
        tippyConfig,
        lastActiveTabId,
        shouldRemainMounted,
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
    const stringifyData = (_tabs: DynamicTabType[], parsedTabsData?: ParsedTabsData): string => {
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
            version: TAB_DATA_VERSION,
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
    const populateInitTab = (_initTab: InitTabType): DynamicTabType => {
        const title = getTitleFromKindAndName({
            kind: _initTab.kind,
            name: _initTab.name,
        })

        const _id =
            _initTab.id ??
            getIdFromIdPrefixAndTitle({
                idPrefix: _initTab.idPrefix,
                title,
            })

        return populateTabData({
            id: _id,
            name: _initTab.name,
            url: _initTab.url,
            isSelected: _initTab.isSelected,
            title,
            type: _initTab.type,
            showNameOnSelect: _initTab.showNameOnSelect,
            iconPath: _initTab.iconPath,
            dynamicTitle: _initTab.dynamicTitle,
            isAlive: !!_initTab.isAlive,
            hideName: _initTab.hideName,
            tippyConfig: _initTab.tippyConfig,
            lastActiveTabId: null,
            shouldRemainMounted: _initTab.shouldRemainMounted,
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
        let tabDataVersion = TAB_DATA_VERSION
        let parsedTabsData: ParsedTabsData

        setTabs((prevTabs) => {
            if (!reInit) {
                const persistedTabsData = getTabDataFromLocalStorage()
                try {
                    parsedTabsData = JSON.parse(persistedTabsData)
                    _tabs = persistedTabsData ? parsedTabsData.data : prevTabs
                    tabDataVersion = parsedTabsData?.version
                } catch {
                    _tabs = prevTabs
                }
            }
            if (_tabs.length > 0) {
                _tabs = _tabs.map((_tab) => {
                    // Backward compatibility with position
                    const type =
                        _tab.type ??
                        ('position' in _tab && _tab.position === Number.MAX_SAFE_INTEGER ? 'dynamic' : 'fixed')

                    return {
                        ..._tab,
                        isSelected: false,
                        /* NOTE: following lines migrate old tab data to new */
                        lastSyncMoment: dayjs(),
                        ...(_tab.componentKey
                            ? { componentKey: _tab.componentKey }
                            : { componentKey: getNewTabComponentKey(_tab.id) }),
                        ...(_tab.isAlive ? { isAlive: _tab.isAlive } : { isAlive: false }),
                        type,
                        id:
                            tabDataVersion !== TAB_DATA_VERSION && type === 'fixed' && _tab.id
                                ? _tab.id.split('-')[0]
                                : _tab.id,
                    }
                })
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
                    _tabs[index].isAlive = _initTab.isAlive
                    _tabs[index].tippyConfig = _initTab.tippyConfig
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
                if (a.type === b.type) {
                    return 0
                }

                // Fixed tabs are always before dynamic tabs
                if (a.type === 'fixed') {
                    return -1
                }

                return 1
            })

            localStorage.setItem(TAB_DATA_LOCAL_STORAGE_KEY, stringifyData(_tabs, parsedTabsData))
            return [..._tabs]
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
        type = 'dynamic',
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
                    const matched = tab.id === _id
                    found = found || matched
                    return matched
                        ? {
                              ...tab,
                              dynamicTitle,
                              tippyConfig,
                              iconPath,
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
                            type,
                            showNameOnSelect,
                            iconPath,
                            dynamicTitle,
                            tippyConfig,
                            lastActiveTabId: getlastActiveTabIdFromTabs(prevTabs, _id),
                            shouldRemainMounted: false,
                        }),
                    )
                }
                resolve(!found)
                updateTabsInLocalStorage(_tabs)
                return _tabs
            })
        })
    }

    const removeOrStopTabByIdentifier = (id: DynamicTabType['id'], type: 'stop' | 'remove'): Promise<string> =>
        new Promise((resolve) => {
            setTabs((prevTabs) => {
                const tabToBeRemoved = prevTabs.find((tab) => tab.id === id) ?? ({} as DynamicTabType)

                if (tabToBeRemoved.isSelected) {
                    const switchFromTabIndex = tabs.findIndex((tab) => tab.id === tabToBeRemoved.lastActiveTabId)
                    const fallbackTabIndex =
                        // The id and lastActiveTabId can be same when the same tab is clicked again
                        switchFromTabIndex > -1 && tabToBeRemoved.id !== tabToBeRemoved.lastActiveTabId
                            ? switchFromTabIndex
                            : FALLBACK_TAB
                    // Cannot use structured clone since using it reloads the whole data
                    // eslint-disable-next-line no-param-reassign
                    prevTabs[fallbackTabIndex].isSelected = true
                    resolve(prevTabs[fallbackTabIndex].url)
                } else {
                    resolve('')
                }

                const updatedTabsState =
                    type === 'stop'
                        ? prevTabs.map((tab) => {
                              if (tab.id === id) {
                                  return {
                                      ...tab,
                                      isSelected: false,
                                      isAlive: false,
                                  }
                              }

                              return tab
                          })
                        : prevTabs.filter((tab) => tab.id !== id)

                updateTabsInLocalStorage(updatedTabsState)
                return updatedTabsState
            })
        })

    /**
     * This function removes a tab by its identifier (id). If the removed tab was selected,
     * it ensures that another tab becomes selected.
     *
     * @param {string} id - The identifier of the tab to be removed
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was removed
     */
    const removeTabByIdentifier = (id: DynamicTabType['id']): Promise<string> =>
        removeOrStopTabByIdentifier(id, 'remove')

    /**
     * Stops or deactivate a tab by its title.
     *
     * @param {string} title - The title of the tab to be stopped
     * @returns {Promise<string>} - A promise resolving the url that need be pushed if a selectedTab was stopped
     */
    const stopTabByIdentifier = (id: DynamicTabType['id']): Promise<string> => removeOrStopTabByIdentifier(id, 'stop')

    /**
     * This function is used to mark a tab as active based on its Id
     *
     * @param {string} id - Tab Id
     * @param {string} [url] - URL for the tab
     * @returns {boolean} - True if the tab was found and marked as active
     */
    const markTabActiveById = (id: DynamicTabType['id'], url?: DynamicTabType['url']): boolean => {
        if (!id) {
            return false
        }
        let isTabFound = false

        setTabs((prevTabs) => {
            const _tabs = prevTabs.map((tab) => {
                const isMatch = tab.id === id
                isTabFound = isMatch || isTabFound

                return {
                    ...tab,
                    isSelected: isMatch,
                    url: (isMatch && url) || tab.url,
                    ...(isMatch && {
                        lastActiveTabId: getlastActiveTabIdFromTabs(prevTabs, tab.id),
                        ...(tab.showNameOnSelect && {
                            isAlive: true,
                        }),
                    }),
                }
            })
            updateTabsInLocalStorage(_tabs)
            return _tabs
        })

        return isTabFound
    }

    /**
     * Updates the URL of a tab by its identifier.
     *
     * @param {string} id - Identifier of the tab to update
     * @param {string} url - New URL for the tab
     * @param {string} [dynamicTitle] - Dynamic title for the tab
     */
    const updateTabUrl = ({ id, url, dynamicTitle, retainSearchParams = false }: UpdateTabUrlParamsType) => {
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

    const getTabId = (
        idPrefix: AddTabParamsType['idPrefix'],
        name: DynamicTabType['name'],
        kind: AddTabParamsType['kind'],
    ): string => {
        const title = getTitleFromKindAndName({
            kind,
            name,
        })

        return getIdFromIdPrefixAndTitle({
            idPrefix,
            title,
        })
    }

    const updateTabComponentKey = (id: DynamicTabType['id']) => {
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

    const updateTabLastSyncMoment = (id: DynamicTabType['id']) => {
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
        markTabActiveById,
        updateTabUrl,
        getTabId,
        getTabById,
        updateTabComponentKey,
        updateTabLastSyncMoment,
        stopTabByIdentifier,
    }
}

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

import { useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { DynamicTabType, InitTabType, noop } from '@devtron-labs/devtron-fe-common-lib'

import { MONITORING_DASHBOARD_TAB_ID, RESOURCE_RECOMMENDER_TAB_ID } from '@Components/ResourceBrowser/Constants'

import { FALLBACK_TAB, TAB_DATA_LOCAL_STORAGE_KEY, TAB_DATA_VERSION } from './constants'
import { AddTabParamsType, ParsedTabsData, PopulateTabDataPropsType, UseTabsReturnType } from './types'

export function useTabs(persistenceKey: string, fallbackTabIndex = FALLBACK_TAB): UseTabsReturnType {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const previousActiveTabIdRef = useRef<string>(null)

    const tabIdToTabMap = useMemo(
        () =>
            tabs.reduce((acc, tab) => {
                acc[tab.id] = tab

                return acc
            }, {}),
        [tabs],
    )

    const getNewTabComponentKey = (id: DynamicTabType['id']): string => `${id}-${dayjs().toString()}`

    const getTabById: UseTabsReturnType['getTabById'] = (id) => tabIdToTabMap[id] ?? null

    const getIdFromIdPrefixAndTitle = ({
        idPrefix,
        title,
    }: Pick<AddTabParamsType, 'idPrefix'> & Pick<PopulateTabDataPropsType, 'title'>): string => `${idPrefix}-${title}`

    const getTitleFromKindAndName = ({ kind, name }: Pick<InitTabType, 'kind' | 'name'>): string =>
        kind ? `${kind}/${name}` : name

    const populateTabData = ({
        id,
        name,
        url,
        isSelected,
        title,
        type,
        showNameOnSelect,
        dynamicTitle = '',
        isAlive = false,
        hideName = false,
        tippyConfig,
        shouldRemainMounted,
        isAlpha,
        defaultUrl,
    }: PopulateTabDataPropsType): DynamicTabType => ({
        id,
        name,
        url,
        isSelected,
        title: title || name,
        type,
        dynamicTitle,
        showNameOnSelect,
        hideName,
        isAlive,
        lastSyncMoment: dayjs(),
        componentKey: getNewTabComponentKey(id),
        tippyConfig,
        shouldRemainMounted,
        isAlpha: isAlpha || false,
        defaultUrl: defaultUrl || null,
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
            version: TAB_DATA_VERSION,
            data: { ..._parsedTabsData?.data, [persistenceKey]: _tabs },
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
        const title =
            _initTab.title ||
            getTitleFromKindAndName({
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
            dynamicTitle: _initTab.dynamicTitle,
            isAlive: !!_initTab.isAlive,
            hideName: _initTab.hideName,
            tippyConfig: _initTab.tippyConfig,
            shouldRemainMounted: _initTab.shouldRemainMounted,
            isAlpha: _initTab.isAlpha,
            defaultUrl: _initTab.defaultUrl,
        })
    }

    /**
     * This function initializes the tabs with an array of InitTabType objects.
     * It allows for reinitializing tabs,removing specific tabs, and ensuring
     * that tabs are not duplicated. It uses localStorage to store and retrieve tab data.
     */
    const initTabs: UseTabsReturnType['initTabs'] = (
        initTabsData,
        reInit,
        tabsToRemove,
        overrideSelectionStatus = false,
    ) => {
        let _tabs: DynamicTabType[] = []
        let parsedTabsData: ParsedTabsData

        setTabs((prevTabs) => {
            if (!reInit) {
                const persistedTabsData = getTabDataFromLocalStorage()

                try {
                    parsedTabsData = JSON.parse(persistedTabsData)
                    const storedResourceRecommenderTab = (parsedTabsData.data[persistenceKey] ?? []).find(
                        (tab) => tab.id === RESOURCE_RECOMMENDER_TAB_ID,
                    )

                    parsedTabsData.data[persistenceKey] = (parsedTabsData.data[persistenceKey] ?? []).filter(
                        (tab) => tab.id !== RESOURCE_RECOMMENDER_TAB_ID,
                    )
                    const resourceRecommenderInitTab = initTabsData.find(
                        (tab) => tab.id === RESOURCE_RECOMMENDER_TAB_ID,
                    ) as DynamicTabType

                    // Simple migration to remove resource recommender tab from localStorage and add it next to monitoring tab
                    // This is to ensure the order of tabs is maintained
                    if (resourceRecommenderInitTab) {
                        // Adding resource recommender next to monitoring tab
                        const monitoringTabIndex = parsedTabsData.data[persistenceKey].findIndex(
                            (tab) => tab.id === MONITORING_DASHBOARD_TAB_ID,
                        )

                        if (monitoringTabIndex > -1) {
                            parsedTabsData.data[persistenceKey].splice(
                                monitoringTabIndex + 1,
                                0,
                                storedResourceRecommenderTab || resourceRecommenderInitTab,
                            )
                        }
                    }

                    _tabs = parsedTabsData ? parsedTabsData.data[persistenceKey] ?? [] : prevTabs
                } catch {
                    _tabs = prevTabs
                }
            }
            if (_tabs.length > 0) {
                _tabs = _tabs.map((_tab) => ({
                    ..._tab,
                    // NOTE: if reInit && overrideSelectionStatus is false, we need to retain the current selection
                    // if reInit is true, we need to remove old selection and use the provided initTabs' selection
                    // or fallback if user has sent all initTabs with isSelected false
                    ...(reInit || overrideSelectionStatus ? { isSelected: false } : {}),
                    lastSyncMoment: dayjs(),
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

                    if (reInit || overrideSelectionStatus) {
                        _tabs[index].isSelected = _initTab.isSelected
                    }
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
                _tabs[fallbackTabIndex].isSelected = true
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
     */
    const addTab: UseTabsReturnType['addTab'] = ({
        idPrefix,
        kind,
        name,
        url,
        showNameOnSelect = false,
        type = 'dynamic',
        dynamicTitle = '',
        tippyConfig = null,
    }) => {
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

                    if (tab.isSelected && !matched) {
                        previousActiveTabIdRef.current = tab.id
                    }

                    return matched
                        ? {
                              ...tab,
                              dynamicTitle,
                              tippyConfig,
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
                            dynamicTitle,
                            tippyConfig,
                            shouldRemainMounted: false,
                            isAlpha: false,
                            defaultUrl: null,
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
                    const previousSelectedTabIndex = prevTabs.findIndex(
                        (tab) => tab.id === previousActiveTabIdRef.current,
                    )
                    previousActiveTabIdRef.current = null
                    const newSelectedTabIndex =
                        previousSelectedTabIndex > -1 ? previousSelectedTabIndex : fallbackTabIndex
                    // Cannot use structured clone since using it reloads the whole data
                    // eslint-disable-next-line no-param-reassign
                    prevTabs[newSelectedTabIndex].isSelected = true
                    resolve(prevTabs[newSelectedTabIndex].url)
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
                                      url: tab.defaultUrl || tab.url,
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
     */
    const removeTabByIdentifier: UseTabsReturnType['removeTabByIdentifier'] = (id) =>
        removeOrStopTabByIdentifier(id, 'remove')

    /**
     * Stops or deactivate a tab by its title.
     */
    const stopTabByIdentifier: UseTabsReturnType['stopTabByIdentifier'] = (id) =>
        removeOrStopTabByIdentifier(id, 'stop')

    /**
     * This function is used to mark a tab as active based on its Id
     */
    const markTabActiveById: UseTabsReturnType['markTabActiveById'] = (id, url): Promise<boolean> =>
        new Promise((resolve) => {
            if (!id) {
                resolve(false)
                return
            }

            setTabs((prevTabs) => {
                let isTabFound = false
                let previousActiveTab = null

                const _tabs = prevTabs.map((tab) => {
                    const isMatch = tab.id === id
                    isTabFound = isMatch || isTabFound

                    if (tab.isSelected && !isMatch) {
                        previousActiveTab = tab
                    }

                    return {
                        ...tab,
                        isSelected: isMatch,
                        url: (isMatch && url) || tab.url,
                        ...(isMatch &&
                            tab.showNameOnSelect && {
                                isAlive: true,
                            }),
                    }
                })

                if (isTabFound && previousActiveTab) {
                    previousActiveTabIdRef.current = previousActiveTab.id
                }

                resolve(isTabFound)
                updateTabsInLocalStorage(_tabs)
                return _tabs
            })
        })

    /**
     * Updates the URL of a tab by its identifier.
     */
    const updateTabUrl: UseTabsReturnType['updateTabUrl'] = ({ id, url, dynamicTitle, retainSearchParams = false }) => {
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

    const getTabId: UseTabsReturnType['getTabId'] = (idPrefix, name, kind) => {
        const title = getTitleFromKindAndName({
            kind,
            name,
        })

        return getIdFromIdPrefixAndTitle({
            idPrefix,
            title,
        })
    }

    const updateTabComponentKey: UseTabsReturnType['updateTabComponentKey'] = (id) => {
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

    const updateTabLastSyncMoment: UseTabsReturnType['updateTabLastSyncMoment'] = (id) => {
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

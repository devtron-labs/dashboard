import { useState } from 'react'
import { DynamicTabType } from './DynamicTabs.type'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState<DynamicTabType[]>([])

    const populateTabData = (
        name: string,
        url: string,
        isSelected: boolean,
        title?: string,
        positionFixed?: boolean,
    ) => {
        let tab = {} as DynamicTabType
        tab.name = name
        tab.url = url
        tab.isSelected = isSelected
        tab.title = title || name
        tab.isDeleted = false
        tab.positionFixed = positionFixed
        return tab
    }

    const stringifyData = (_tabs: any[]) => {
        return JSON.stringify({
            key: persistanceKey,
            data: _tabs,
        })
    }

    const populateInitTab = (_initTab: DynamicTabType, idx: number) => {
        const url = `${_initTab.url}${_initTab.url.endsWith('/') ? '' : '/'}`
        const title = _initTab.kind ? `${_initTab.kind}/${_initTab.name}` : _initTab.name
        return populateTabData(title, url, idx === 0, title, _initTab.positionFixed)
    }

    const initTabs = (initTabsData: DynamicTabType[]) => {
        const persistedTabs = localStorage.getItem('persisted-tabs-data')
        let _tabs: DynamicTabType[]
        try {
            _tabs = persistedTabs ? JSON.parse(persistedTabs).data : tabs
        } catch (err) {
            _tabs = tabs
        }

        if (_tabs.length > 0) {
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

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    const addTab = (kind: string, name: string, url: string, positionFixed?: boolean) => {
        if (!name || !url || !kind) return

        const title = `${kind}/${name}`
        let alreadyAdded = false
        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                tab.isSelected = true
                tab.url = url
                alreadyAdded = true
            }
            return tab
        })

        if (!alreadyAdded) {
            _tabs.push(populateTabData(title, url, true, title, positionFixed))
        }

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return true
    }

    const removeTabByIdentifier = (title: string): string => {
        let pushURL = ''
        let selectedRemoved = false
        const _tabs = tabs.filter((tab) => {
            if (tab.title.toLowerCase() == title.toLowerCase()) {
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
        setTabs(_tabs)
        return pushURL
    }

    const markTabActiveByIdentifier = (name: string, kind?: string, url?: string) => {
        if (!name) return

        let isTabFound = false
        let title = name
        if (kind) {
            title = kind + '/' + name
        }

        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                tab.isSelected = true
                tab.url = url || tab.url
                isTabFound = true
            }
            return tab
        })

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return isTabFound
    }

    const markTabResourceDeletedByIdentifier = (name: string, kind?: string) => {
        let title = name
        if (kind) {
            title = kind + '/' + name
        }

        const _tabs = tabs.map((tab) => {
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                tab.isDeleted = true
            }
            return tab
        })
        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    const updateTabUrl = (name: string, url: string) => {
        const _tabs = tabs.map((tab) => {
            if (tab.name === name) {
                tab.url = url
            }
            return tab
        })
        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    return {
        tabs,
        initTabs,
        addTab,
        removeTabByIdentifier,
        markTabActiveByIdentifier,
        markTabResourceDeletedByIdentifier,
        updateTabUrl,
    }
}

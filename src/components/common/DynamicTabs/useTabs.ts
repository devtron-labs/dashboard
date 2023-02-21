import { useState } from 'react'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState([])

    const populateTabData = (
        tabName: string,
        tabUrl: string,
        isSelected: boolean,
        title?: string,
        positionFixed?: boolean,
    ) => {
        let tab = {} as any
        tab.name = tabName
        tab.url = tabUrl
        tab.isSelected = isSelected
        tab.title = title || tabName
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

    const populateInitTab = (
        _initTab: { tabName: string; url: string; kind?: string; positionFixed?: boolean },
        idx: number,
    ) => {
        const url = `${_initTab.url}${_initTab.url.endsWith('/') ? '' : '/'}`
        const title = _initTab.kind ? `${_initTab.kind}/${_initTab.tabName}` : _initTab.tabName
        return populateTabData(title, url, idx === 0, title, _initTab.positionFixed)
    }

    const initTabs = (initTabsData: { tabName: string; url: string; kind?: string; positionFixed?: boolean }[]) => {
        const persistedTabs = localStorage.getItem('persisted-tabs-data')
        let _tabs
        try {
            _tabs = persistedTabs ? JSON.parse(persistedTabs).data : tabs
        } catch (err) {
            _tabs = tabs
        }

        if (_tabs.length > 0) {
            initTabsData.forEach((_initTab, idx) => {
                if (_tabs.findIndex((_tab) => _tab.tabName === _initTab.tabName) !== -1) {
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

    const addTab = (tabKind: string, tabName: string, tabURL: string, positionFixed?: boolean) => {
        if (!tabName || !tabURL || !tabKind) return

        const title = `${tabKind}/${tabName}`
        let alreadyAdded = false
        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                tab.isSelected = true
                tab.url = tabURL
                alreadyAdded = true
            }
            return tab
        })

        if (!alreadyAdded) {
            _tabs.push(populateTabData(title, tabURL, true, title, positionFixed))
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

    const markTabActiveByIdentifier = (tabName: string, tabKind?: string, tabUrl?: string) => {
        if (!tabName) return

        let isTabFound = false
        let title = tabName
        if (tabKind) {
            title = tabKind + '/' + tabName
        }

        const _tabs = tabs.map((tab) => {
            tab.isSelected = false
            if (tab.title.toLowerCase() === title.toLowerCase()) {
                tab.isSelected = true
                tab.url = tabUrl || tab.url
                isTabFound = true
            }
            return tab
        })

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
        return isTabFound
    }

    const markTabResourceDeletedByIdentifier = (tabName: string, tabKind?: string) => {
        let title = tabName
        if (tabKind) {
            title = tabKind + '/' + tabName
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

    const updateTabUrl = (tabName: string, url: string) => {
        const _tabs = tabs.map((tab) => {
            if (tab.name === tabName) {
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

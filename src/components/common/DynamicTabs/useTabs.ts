import { useEffect, useState } from 'react'

export function useTabs(persistanceKey: string) {
    const [tabs, setTabs] = useState([])

    // useEffect(() => {
    //     try {
    //         const persistedTabs = localStorage.getItem('persisted-tabs-data')
    //         if (persistedTabs) {
    //             setTabs(JSON.parse(persistedTabs).data)
    //         }
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }, [])

    const populateTabData = (tabName: string, tabUrl: string, isSelected: boolean, title?: string) => {
        let tab = {} as any
        tab.name = tabName
        tab.url = tabUrl
        tab.isSelected = isSelected
        tab.title = title || tabName
        tab.isDeleted = false
        return tab
    }

    const stringifyData = (_tabs: any[]) => {
        return JSON.stringify({
            key: persistanceKey,
            data: _tabs,
        })
    }

    const initTabs = (tabName: string, _url: string) => {
        const url = `${_url}${_url.endsWith('/') ? '' : '/'}`
        let _tabs
        try {
            const persistedTabs = localStorage.getItem('persisted-tabs-data')
            _tabs = persistedTabs ? JSON.parse(persistedTabs).data : tabs
        } catch (err) {
            _tabs = tabs
        }

        if (!_tabs.length) {
            _tabs.push(populateTabData(tabName, url, true, tabName))
        }

        localStorage.setItem('persisted-tabs-data', stringifyData(_tabs))
        setTabs(_tabs)
    }

    const addTab = (objectKind: string, objectName: string, tabURL: string) => {
        if (!objectName || !tabURL || !objectKind) return

        const title = objectKind + '/' + objectName
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
            _tabs.push(populateTabData(`${objectKind}/${objectName}`, tabURL, true, title))
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

    const markTabActiveByIdentifier = (objectName: string, objectKind?: string, tabUrl?: string) => {
        if (!objectName) return

        let isTabFound = false
        let title = objectName
        if (objectKind) {
            title = objectKind + '/' + objectName
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

    const markTabResourceDeletedByIdentifier = (objectName: string, objectKind?: string) => {
        let title = objectName
        if (objectKind) {
            title = objectKind + '/' + objectName
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

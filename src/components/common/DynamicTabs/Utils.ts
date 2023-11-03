import { TabsDataType } from './Types'

export const COMMON_TABS_SELECT_STYLES = {
    control: (base) => ({
        ...base,
        borderRadius: '4px 4px 0 0',
        borderBottom: 'none',
        boxShadow: 'none',
        cursor: 'text',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '2px 32px',
    }),
    menu: (base) => ({
        ...base,
        marginTop: 0,
        borderRadius: '0 0 4px 4px',
        width: '298px',
        marginLeft: '1px',
        overflow: 'hidden',
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: 'calc(100vh - 200px)',
        paddingTop: 0,
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
}

export const EMPTY_TABS_DATA = {
    fixedTabs: [],
    dynamicTabs: [],
}

export const initTabsData = (
    tabs: any[],
    setTabsData: React.Dispatch<React.SetStateAction<TabsDataType>>,
    setSelectedTab: React.Dispatch<React.SetStateAction<any>>,
    updateMenuState: () => void,
): void => {
    const fixedTabs = []
    const dynamicTabs = []
    for (const tab of tabs) {
        const tabOption = {
            ...tab,
            label: tab.name,
            value: tab.id,
        }
        if (tab.positionFixed) {
            fixedTabs.push(tabOption)
        } else {
            dynamicTabs.push(tabOption)
        }

        if (tabOption.isSelected) {
            setSelectedTab(tabOption)
        }
    }

    setTabsData({
        fixedTabs,
        dynamicTabs,
    })

    // Update menu state when dynamicTabs are not present
    if (dynamicTabs.length === 0) {
        updateMenuState()
    }
}

import { TabsDataType } from './DynamicTabs.type'

export const COMMON_TABS_SELECT_STYLES = {
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: 0,
        marginRight: '1px',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    container: (base) => ({
        ...base,
        marginLeft: '8px',
    }),
    valueContainer: () => ({
        height: '0px',
    }),
    singleValue: () => ({
        display: 'none',
    }),
    control: (base) => ({
        ...base,
        cursor: 'pointer',
        width: '24px',
        minHeight: '24px',
    }),
    menu: (base) => ({
        ...base,
        width: '300px',
        zIndex: 9,
    }),
    menuList: (base) => ({
        ...base,
        width: '300px',
        zIndex: 9,
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
): void => {
    const fixedTabs = []
    const dynamicTabs = []
    for (const tab of tabs) {
        const tabOption = {
            ...tab,
            label: tab.name,
            value: tab.title,
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
}

export const computeAndToggleMoreOptions = (
    tabsSectionRef: React.MutableRefObject<HTMLDivElement>,
    fixedContainerRef: React.MutableRefObject<HTMLDivElement>,
    dynamicWrapperRef: React.MutableRefObject<HTMLUListElement>,
) => {
    const moreButtonEle = tabsSectionRef.current?.querySelector('.more-tabs-option')
    if (!tabsSectionRef.current || !fixedContainerRef.current || !dynamicWrapperRef.current || !moreButtonEle) {
        return
    }

    const primaryItems = dynamicWrapperRef.current.querySelectorAll('li') as NodeListOf<HTMLLIElement>
    let stopWidth = 0
    const hiddenItems = []
    const primaryWidth = tabsSectionRef.current.offsetWidth - fixedContainerRef.current.offsetWidth

    // Compute the stop width & get hidden indices
    primaryItems.forEach((item, i) => {
        if (primaryWidth >= stopWidth + item.offsetWidth) {
            stopWidth += item.offsetWidth
        } else {
            hiddenItems.push(i)
        }
    })

    // Toggle the visibility of More button and items in Secondary
    if (!hiddenItems.length) {
        moreButtonEle.classList.add('hide-more-tabs-option')
    } else {
        moreButtonEle.classList.remove('hide-more-tabs-option')
    }
}

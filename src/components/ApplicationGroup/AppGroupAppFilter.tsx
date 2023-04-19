import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { appGroupAppSelectorStyle } from './AppGroup.utils'
import { AppGroupAppFilterContextType } from './AppGroup.types'
import { AppFilterTabs } from './Constants'
import { MenuList, Option, ValueContainer } from './AppGroupAppFilter.components'

export default function AppGroupAppFilter() {
    const {
        appListOptions,
        selectedAppList,
        setSelectedAppList,
        isMenuOpen,
        setMenuOpen,
        selectedFilterTab,
        setSelectedFilterTab,
        groupFilterOptions,
        selectedGroupFilter,
        setSelectedGroupFilter,
    }: AppGroupAppFilterContextType = useAppGroupAppFilterContext()
    const [appFilterAppInput, setAppFilterAppInput] = useState('')
    const [appFilterGroupInput, setAppFilterGroupInput] = useState('')

    const selectDefaultFilterTab = (): void => {
        let _filterTab = AppFilterTabs.GROUP_FILTER
        if ((!selectedGroupFilter[0] && selectedAppList.length > 0) || groupFilterOptions.length === 0) {
            _filterTab = AppFilterTabs.APP_FILTER
        }
        setSelectedFilterTab(_filterTab)
    }

    const handleOpenFilter = (): void => {
        selectDefaultFilterTab()
        setMenuOpen(true)
    }

    const handleCloseFilter = (): void => {
        setMenuOpen(false)
    }

    const clearAppFilterInput = () => {
        if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
            setAppFilterAppInput('')
        } else {
            setAppFilterGroupInput('')
        }
    }

    const onAppFilterInputChange = (value, action) => {
        if (action.action === 'input-change') {
            if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
                setAppFilterAppInput(value)
            } else {
                setAppFilterGroupInput(value)
            }
        }
    }

    const escHandler = (event: any) => {
        if (event.keyCode === 27 || event.key === 'Escape') {
            event.target.blur()
        }
    }

    const onChangeFilter = (selectedValue): void => {
        if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
            setSelectedAppList(selectedValue)
            setSelectedGroupFilter([])
        } else {
            const _selectedGroup = selectedValue.pop()
            setSelectedGroupFilter([_selectedGroup])
            if (_selectedGroup) {
                setSelectedAppList(appListOptions.filter((app) => _selectedGroup.appIds.indexOf(+app.value) >= 0))
            }
        }
    }

    return (
        <ReactSelect
            menuIsOpen={isMenuOpen}
            value={selectedFilterTab === AppFilterTabs.APP_FILTER ? selectedAppList : selectedGroupFilter}
            options={selectedFilterTab === AppFilterTabs.APP_FILTER ? appListOptions : groupFilterOptions}
            onChange={onChangeFilter}
            isMulti={true}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            onMenuOpen={handleOpenFilter}
            onMenuClose={handleCloseFilter}
            blurInputOnSelect={selectedFilterTab !== AppFilterTabs.APP_FILTER}
            inputValue={selectedFilterTab === AppFilterTabs.APP_FILTER ? appFilterAppInput : appFilterGroupInput}
            onBlur={clearAppFilterInput}
            onInputChange={onAppFilterInputChange}
            components={{
                IndicatorSeparator: null,
                ClearIndicator: null,
                Option: Option,
                ValueContainer: ValueContainer,
                MenuList: MenuList,
            }}
            placeholder={selectedFilterTab === AppFilterTabs.APP_FILTER ? 'Search applications' : 'Search filters'}
            styles={appGroupAppSelectorStyle}
            onKeyDown={escHandler}
        />
    )
}

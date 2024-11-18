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

import { useEffect, useRef, useState } from 'react'
import ReactSelect, { SelectInstance } from 'react-select'
import { useAppGroupAppFilterContext } from './AppGroupDetailsRoute'
import { appGroupAppSelectorStyle, getAppFilterLocalStorageKey, setFilterInLocalStorage } from './AppGroup.utils'
import { AppGroupAppFilterContextType, FilterParentType } from './AppGroup.types'
import { AppFilterTabs } from './Constants'
import { MenuList, Option, ValueContainer } from './AppGroupAppFilter.components'
import { OptionType, ReactSelectInputAction, useRegisterShortcut } from '@devtron-labs/devtron-fe-common-lib'

export default function AppGroupAppFilter() {
    const {
        resourceId,
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
        filterParentType,
    }: AppGroupAppFilterContextType = useAppGroupAppFilterContext()
    const appGroupFilterRef = useRef<SelectInstance<OptionType>>()
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
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
        if (action.action === ReactSelectInputAction.inputChange) {
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
            setFilterInLocalStorage({ filterParentType, resourceId, resourceList: selectedValue, groupList: [] })
        } else {
            const _selectedGroup = selectedValue.pop()
            setSelectedGroupFilter([_selectedGroup])
            if (_selectedGroup) {
                const updatedAppList = appListOptions.filter((app) => _selectedGroup.appIds.indexOf(+app.value) >= 0)
                setSelectedAppList(updatedAppList)
                setFilterInLocalStorage({
                    filterParentType,
                    resourceId,
                    resourceList: updatedAppList,
                    groupList: [_selectedGroup],
                })
            }
        }
    }

    const getPlaceHolder = (): string => {
        if (selectedFilterTab === AppFilterTabs.APP_FILTER) {
            return `Search ${filterParentType === FilterParentType.env ? 'applications' : 'environments'}`
        }
        return 'Search filters'
    }

    const handleFilterFocus = () => {
        appGroupFilterRef.current.focus()
        appGroupFilterRef.current.onMenuOpen()
    }

    const getAndSetItem = () => {
        const localStorageKey = getAppFilterLocalStorageKey(filterParentType)

        const localStorageValue = localStorage.getItem(localStorageKey)
        if (!localStorageValue) {
            return
        }
        try {
            const valueForCurrentResource = new Map(JSON.parse(localStorageValue)).get(resourceId)
            // local storage value for app list/ env list
            const localStorageResourceList = valueForCurrentResource?.[0] || []
            // local storage value for group filter
            const localStorageGroupList = valueForCurrentResource?.[1] || []

            const appListOptionsMap = appListOptions.reduce<Record<string, true>>((agg, curr) => {
                agg[curr.value] = true
                return agg
            }, {})

            const groupFilterOptionsMap = groupFilterOptions.reduce<Record<string, true>>((agg, curr) => {
                agg[curr.value] = true
                return agg
            }, {})

            // filtering local storage lists acc to new appList/ envList or groupFilterList as local values might be deleted or does not exist anymore
            const filteredLocalStorageResourceList = localStorageResourceList.filter(
                ({ value }) => appListOptionsMap[value],
            )
            const filteredLocalStorageGroupList = localStorageGroupList.filter(
                ({ value }) => groupFilterOptionsMap[value],
            )

            setSelectedAppList(filteredLocalStorageResourceList)
            setSelectedGroupFilter(filteredLocalStorageGroupList)
        } catch {
            localStorage.setItem(localStorageKey, '')
        }
    }

    useEffect(() => {
        if (!appListOptions || !groupFilterOptions) {
            return
        }

        getAndSetItem()
    }, [appListOptions, groupFilterOptions])

    useEffect(() => {
        registerShortcut({ keys: ['F'], callback: handleFilterFocus })

        return () => {
            unregisterShortcut(['F'])
        }
    }, [])

    return (
        <ReactSelect
            ref={appGroupFilterRef}
            menuIsOpen={isMenuOpen}
            value={selectedFilterTab === AppFilterTabs.APP_FILTER ? selectedAppList : selectedGroupFilter}
            options={selectedFilterTab === AppFilterTabs.APP_FILTER ? appListOptions : groupFilterOptions}
            onChange={onChangeFilter}
            isMulti
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
                Option,
                ValueContainer,
                MenuList,
            }}
            placeholder={getPlaceHolder()}
            styles={appGroupAppSelectorStyle}
            onKeyDown={escHandler}
        />
    )
}

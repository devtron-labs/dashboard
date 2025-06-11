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

import { ComponentProps, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { SelectInstance } from 'react-select'

import {
    ALL_NAMESPACE_OPTION,
    ComponentSizeType,
    Nodes,
    OptionType,
    SearchBar,
    SegmentedControl,
    SegmentedControlProps,
    SelectPicker,
    SelectPickerOptionType,
    useAsync,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as NamespaceIcon } from '@Icons/ic-env.svg'

import { URLS } from '../../../config'
import { convertToOptionsList, importComponentFromFELibrary } from '../../common'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { NAMESPACE_NOT_APPLICABLE_OPTION, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { ResourceFilterOptionsProps } from '../Types'
import Cache from './Cache'
import { K8sResourceListURLParams } from './types'

const FilterButton = importComponentFromFELibrary('FilterButton', null, 'function')

const ResourceFilterOptions = ({
    selectedResource,
    selectedNamespace,
    selectedCluster,
    searchText,
    setSearchText,
    isSearchInputDisabled,
    renderRefreshBar,
    areFiltersHidden = false,
    searchPlaceholder,
    eventType = 'warning',
    updateSearchParams,
}: ResourceFilterOptionsProps) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const location = useLocation()
    const { replace } = useHistory()
    const { clusterId, group } = useParams<K8sResourceListURLParams>()
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const namespaceFilterRef = useRef<SelectInstance<SelectPickerOptionType>>(null)

    const isEventListing = selectedResource?.gvk?.Kind === Nodes.Event

    const showShortcutKey = !isInputFocused && !searchText

    const [, namespaceByClusterIdList] = useAsync(
        () => Cache.get(`${clusterId}/namespaces`, () => namespaceListByClusterId(clusterId)),
        [clusterId],
    )

    const namespaceOptions = useMemo(
        () => [ALL_NAMESPACE_OPTION, ...convertToOptionsList(namespaceByClusterIdList?.result?.sort() || [])],
        [namespaceByClusterIdList],
    )

    const selectedNamespaceOption = useMemo(() => {
        if (selectedResource?.namespaced) {
            return namespaceOptions.find((option) => option.value === (selectedNamespace || ALL_NAMESPACE_OPTION.value))
        }
        return NAMESPACE_NOT_APPLICABLE_OPTION
    }, [selectedNamespace, selectedResource?.namespaced, namespaceOptions])

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    const handleShowFilterModal = () => {
        setShowFilterModal(true)
    }

    const handleFocusNamespaceFilter = () => {
        namespaceFilterRef.current?.focus()
        namespaceFilterRef.current?.openMenu('first')
    }

    const handleCloseFilterModal = () => {
        setShowFilterModal(false)
    }

    useEffect(() => {
        if (registerShortcut) {
            registerShortcut({ keys: ['R'], callback: handleInputShortcut })
            registerShortcut({ keys: ['F'], callback: handleShowFilterModal })
            registerShortcut({ keys: ['N'], callback: handleFocusNamespaceFilter })
        }
        return (): void => {
            unregisterShortcut(['F'])
            unregisterShortcut(['R'])
            unregisterShortcut(['N'])
        }
    }, [])

    const handleFilterKeyUp = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const handleOnChangeSearchText: ComponentProps<typeof SearchBar>['handleSearchChange'] = (text) => {
        setSearchText(text)
        if (!text) {
            searchInputRef.current?.focus()
        }
    }

    const handleNamespaceChange = (selected: OptionType): void => {
        if (selected.value === selectedNamespace) {
            return
        }
        const parsedUrlSearchParams = new URLSearchParams(location.search)
        parsedUrlSearchParams.set('namespace', selected.value)
        const url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${selectedResource.gvk.Kind.toLowerCase()}/${group}/v1?${parsedUrlSearchParams.toString()}`
        replace(url)
    }

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    const handleOnEventTypeChange: SegmentedControlProps['onChange'] = ({ value }) => {
        updateSearchParams({ eventType: value })
    }

    return (
        <>
            {typeof renderRefreshBar === 'function' && renderRefreshBar()}
            <div className="resource-filter-options-container flexbox dc__content-space pt-16 pr-20 pb-12 pl-20 w-100">
                <div className="flexbox dc__gap-8">
                    {isEventListing && (
                        <SegmentedControl
                            name="event-type-control"
                            value={eventType}
                            size={ComponentSizeType.small}
                            segments={[
                                {
                                    icon: 'ic-warning',
                                    ariaLabel: 'Warning Events',
                                    value: 'warning',
                                    tooltipProps: { content: 'Warning Events' },
                                },
                                {
                                    icon: 'ic-info-filled-color',
                                    ariaLabel: 'Normal Events',
                                    value: 'normal',
                                    tooltipProps: { content: 'Normal Events' },
                                },
                            ]}
                            onChange={handleOnEventTypeChange}
                        />
                    )}
                    <div className="resource-filter-options-container__search-box dc__position-rel">
                        <SearchBar
                            inputProps={{
                                placeholder: searchPlaceholder || `Search ${selectedResource?.gvk?.Kind || ''}`,
                                disabled: isSearchInputDisabled,
                                onBlur: handleInputBlur,
                                onFocus: handleInputFocus,
                                ref: searchInputRef,
                                onKeyUp: handleFilterKeyUp,
                            }}
                            handleSearchChange={handleOnChangeSearchText}
                            initialSearchText={searchText}
                        />
                        {showShortcutKey && (
                            <ShortcutKeyBadge
                                shortcutKey="r"
                                rootClassName="resource-search-shortcut-key"
                                onClick={handleInputShortcut}
                            />
                        )}
                    </div>
                </div>
                {!areFiltersHidden && (
                    <div className="flexbox dc__gap-8 dc__zi-3">
                        {FilterButton && (
                            <FilterButton
                                clusterName={selectedCluster?.label || ''}
                                showModal={showFilterModal}
                                handleShowFilterModal={handleShowFilterModal}
                                handleCloseFilterModal={handleCloseFilterModal}
                            />
                        )}
                        <SelectPicker
                            selectRef={namespaceFilterRef}
                            inputId="resource-filter-select"
                            placeholder="Select Namespace"
                            options={namespaceOptions}
                            value={selectedNamespaceOption}
                            onChange={handleNamespaceChange}
                            isDisabled={!selectedResource?.namespaced}
                            icon={<NamespaceIcon className="fcn-6" />}
                            disabledTippyContent={NAMESPACE_NOT_APPLICABLE_TEXT}
                            shouldMenuAlignRight
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default ResourceFilterOptions

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
import { useParams } from 'react-router-dom'
import { SelectInstance } from 'react-select'

import {
    ALL_NAMESPACE_OPTION,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    GVK_FILTER_API_VERSION_QUERY_PARAM_KEY,
    GVK_FILTER_KIND_QUERY_PARAM_KEY,
    GVKOptionValueType,
    Icon,
    Nodes,
    noop,
    OptionType,
    ResourceRecommenderHeaderType,
    SearchBar,
    SegmentedControl,
    SegmentedControlProps,
    SelectPicker,
    SelectPickerOptionType,
    useAsync,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as NamespaceIcon } from '@Icons/ic-env.svg'
import { FILE_NAMES } from '@Components/common/ExportToCsv/constants'
import ExportToCsv from '@Components/common/ExportToCsv/ExportToCsv'

import { convertToOptionsList, importComponentFromFELibrary } from '../../common'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { NAMESPACE_NOT_APPLICABLE_OPTION, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { ResourceFilterOptionsProps } from '../Types'
import { K8sResourceListURLParams } from './types'

const FilterButton = importComponentFromFELibrary('FilterButton', null, 'function')
const getResourceRecommendationsCSVData = importComponentFromFELibrary(
    'getResourceRecommendationsCSVData',
    null,
    'function',
)
const ResourceRecommenderActionMenu = importComponentFromFELibrary('ResourceRecommenderActionMenu', null, 'function')

const ResourceFilterOptions = ({
    selectedResource,
    selectedNamespace,
    selectedCluster,
    searchText,
    setSearchText,
    isSearchInputDisabled,
    renderRefreshBar,
    searchPlaceholder,
    eventType = 'warning',
    updateSearchParams,
    filteredRows,
    gvkFilterConfig,
    isResourceListLoading,
    resourceRecommenderConfig,
    selectedAPIVersionGVKFilter,
    selectedKindGVKFilter,
    resourceLastScannedOnDetails,
}: ResourceFilterOptionsProps) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const { clusterId } = useParams<K8sResourceListURLParams>()
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const namespaceFilterRef = useRef<SelectInstance<SelectPickerOptionType>>(null)

    const isEventListing = selectedResource?.gvk?.Kind === Nodes.Event

    const { gvkOptions, areGVKOptionsLoading, reloadGVKOptions, gvkOptionsError } = gvkFilterConfig || {}

    const showShortcutKey = !isInputFocused && !searchText
    const isResourceRecommender = selectedResource?.gvk?.Kind === Nodes.ResourceRecommender

    const { showAbsoluteValuesInResourceRecommender = false, setShowAbsoluteValuesInResourceRecommender = noop } =
        resourceRecommenderConfig ?? {}

    const [, namespaceByClusterIdList] = useAsync(() => namespaceListByClusterId(clusterId), [clusterId])

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

        updateSearchParams(
            { namespace: selected.value === ALL_NAMESPACE_OPTION.value ? '' : selected.value },
            { redirectionMethod: 'replace' },
        )
    }

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    const handleOnEventTypeChange: SegmentedControlProps['onChange'] = ({ value }) => {
        updateSearchParams({ eventType: value })
    }

    const handleToggleShowAbsoluteValues = () => {
        setShowAbsoluteValuesInResourceRecommender((prevValue) => !prevValue)
    }

    const getIsGVKOptionSelected = (option: SelectPickerOptionType<GVKOptionValueType>): boolean => {
        if (!option.value) {
            return !selectedKindGVKFilter || !selectedAPIVersionGVKFilter
        }

        return option.value.kind === selectedKindGVKFilter && option.value.apiVersion === selectedAPIVersionGVKFilter
    }

    const handleGVKFilterChange = (option: SelectPickerOptionType<GVKOptionValueType> | null): void => {
        if (!option) {
            return
        }

        const { kind: kindValue, apiVersion } = option.value ?? {}

        updateSearchParams(
            { [GVK_FILTER_API_VERSION_QUERY_PARAM_KEY]: apiVersion, [GVK_FILTER_KIND_QUERY_PARAM_KEY]: kindValue },
            { redirectionMethod: 'replace' },
        )
    }

    const getResourcesToExport = (): Promise<Record<ResourceRecommenderHeaderType, string>[]> =>
        Promise.resolve(getResourceRecommendationsCSVData(filteredRows.map((row) => row.data)))

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

                <div className="flexbox dc__gap-8 dc__zi-3 dc__align-items-center">
                    {isResourceRecommender && (
                        <>
                            <div className="flexbox dc__align-items-center p-6">
                                <Checkbox
                                    isChecked={showAbsoluteValuesInResourceRecommender}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    onChange={handleToggleShowAbsoluteValues}
                                    dataTestId="resource-recommender-absolute-values-checkbox"
                                    rootClassName="mb-0"
                                >
                                    <span className="cn-9 fs-13 fw-4 lh-20">Show absolute values</span>
                                </Checkbox>
                            </div>

                            <div className="dc__divider h-20" />

                            <div className="dc__mxw-200">
                                <SelectPicker<GVKOptionValueType, false>
                                    inputId="resource-filter__gvk-select"
                                    placeholder="Select Resource Kind"
                                    options={gvkOptions || []}
                                    value={{
                                        label: selectedKindGVKFilter || 'All Kinds',
                                        value:
                                            selectedKindGVKFilter && selectedAPIVersionGVKFilter
                                                ? {
                                                      kind: selectedKindGVKFilter,
                                                      apiVersion: selectedAPIVersionGVKFilter,
                                                  }
                                                : null,
                                    }}
                                    isOptionSelected={getIsGVKOptionSelected}
                                    onChange={handleGVKFilterChange}
                                    isLoading={areGVKOptionsLoading}
                                    optionListError={gvkOptionsError}
                                    reloadOptionList={reloadGVKOptions}
                                />
                            </div>
                        </>
                    )}

                    {FilterButton && !isResourceRecommender && (
                        <FilterButton
                            clusterName={selectedCluster?.label || ''}
                            showModal={showFilterModal}
                            handleShowFilterModal={handleShowFilterModal}
                            handleCloseFilterModal={handleCloseFilterModal}
                        />
                    )}

                    <div className="dc__mxw-200">
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

                    {isResourceRecommender && ResourceRecommenderActionMenu && getResourceRecommendationsCSVData && (
                        <ResourceRecommenderActionMenu {...resourceLastScannedOnDetails}>
                            <ExportToCsv
                                fileName={FILE_NAMES.ResourceRecommendations}
                                disabled={isResourceListLoading}
                                apiPromise={getResourcesToExport}
                                triggerElementClassname="bg__hover dc__transparent flexbox dc__gap-8 px-8 py-6 w-100"
                                hideExportResultModal
                            >
                                <span className="mt-2 flex dc__no-shrink">
                                    <Icon name="ic-download" size={16} color="N800" />
                                </span>
                                <span className="cn-9 fs-13 fw-4 lh-1-5">Export CSV</span>
                            </ExportToCsv>
                        </ResourceRecommenderActionMenu>
                    )}
                </div>
            </div>
        </>
    )
}

export default ResourceFilterOptions

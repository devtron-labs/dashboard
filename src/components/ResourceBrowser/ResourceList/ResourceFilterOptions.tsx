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

import {
    ALL_NAMESPACE_OPTION,
    Checkbox,
    CHECKBOX_VALUE,
    GVK_FILTER_API_VERSION_QUERY_PARAM_KEY,
    GVK_FILTER_KIND_QUERY_PARAM_KEY,
    GVKOptionValueType,
    Nodes,
    OptionType,
    ResourceRecommenderHeaderType,
    ResourceRecommenderHeaderWithRecommendation,
    SearchBar,
    SelectPicker,
    SelectPickerOptionType,
    useAsync,
    useRegisterShortcut,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as NamespaceIcon } from '@Icons/ic-env.svg'
import { FILE_NAMES, RESOURCE_RECOMMENDATIONS_HEADERS } from '@Components/common/ExportToCsv/constants'
import ExportToCsv from '@Components/common/ExportToCsv/ExportToCsv'

import { URLS } from '../../../config'
import { convertToOptionsList, importComponentFromFELibrary } from '../../common'
import { ShortcutKeyBadge } from '../../common/formFields/Widgets/Widgets'
import { NAMESPACE_NOT_APPLICABLE_OPTION, NAMESPACE_NOT_APPLICABLE_TEXT } from '../Constants'
import { namespaceListByClusterId } from '../ResourceBrowser.service'
import { ResourceFilterOptionsProps, URLParams } from '../Types'

const FilterButton = importComponentFromFELibrary('FilterButton', null, 'function')

const ResourceFilterOptions = ({
    selectedResource,
    selectedNamespace,
    selectedCluster,
    setSelectedNamespace,
    searchText,
    isOpen,
    setSearchText,
    isSearchInputDisabled,
    renderRefreshBar,
    updateK8sResourceTab,
    areFiltersHidden = false,
    searchPlaceholder,
    showAbsoluteValuesInResourceRecommender,
    setShowAbsoluteValuesInResourceRecommender,
    gvkOptions,
    resourceList,
    areGVKOptionsLoading,
    reloadGVKOptions,
    gvkOptionsError,
    isResourceListLoading,
}: ResourceFilterOptionsProps) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const location = useLocation()
    const { replace } = useHistory()
    const { searchParams } = useSearchString()
    const { clusterId, namespace, group } = useParams<URLParams>()
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const showShortcutKey = !isInputFocused && !searchText
    const isResourceRecommender = selectedResource?.gvk?.Kind === Nodes.ResourceRecommender

    const selectedAPIVersionGVKFilter = searchParams[GVK_FILTER_API_VERSION_QUERY_PARAM_KEY]
    const selectedKindGVKFilter = searchParams[GVK_FILTER_KIND_QUERY_PARAM_KEY]

    const [, namespaceByClusterIdList] = useAsync(() => namespaceListByClusterId(clusterId), [clusterId])

    const namespaceOptions = useMemo(
        () => [ALL_NAMESPACE_OPTION, ...convertToOptionsList(namespaceByClusterIdList?.result?.sort() || [])],
        [namespaceByClusterIdList],
    )

    const handleInputShortcut = () => {
        searchInputRef.current?.focus()
    }

    const handleShowFilterModal = () => {
        setShowFilterModal(true)
    }

    useEffect(() => {
        if (registerShortcut && isOpen) {
            registerShortcut({ keys: ['R'], callback: handleInputShortcut })
            registerShortcut({ keys: ['F'], callback: handleShowFilterModal })
        }
        return (): void => {
            unregisterShortcut(['F'])
            unregisterShortcut(['R'])
        }
    }, [isOpen])

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
        if (selected.value === selectedNamespace?.value) {
            return
        }
        const url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${selected.value}/${selectedResource.gvk.Kind.toLowerCase()}/${group}${location.search}`
        updateK8sResourceTab({ url })
        replace(url)
        setSelectedNamespace(selected)
    }

    useEffect(() => {
        if (!isOpen || namespace === selectedNamespace.value || namespaceOptions.length === 1) {
            return
        }
        const matchedOption = namespaceOptions.find((option) => option.value === namespace)
        handleNamespaceChange(!matchedOption ? (ALL_NAMESPACE_OPTION as any) : matchedOption)
    }, [namespace, namespaceOptions])

    const handleInputBlur = () => setIsInputFocused(false)

    const handleInputFocus = () => setIsInputFocused(true)

    const handleToggleShowAbsoluteValues = () => {
        setShowAbsoluteValuesInResourceRecommender((prev) => !prev)
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

        const newSearchParams = new URLSearchParams(location.search)
        if (!option.value) {
            newSearchParams.delete(GVK_FILTER_API_VERSION_QUERY_PARAM_KEY)
            newSearchParams.delete(GVK_FILTER_KIND_QUERY_PARAM_KEY)
        } else {
            const { kind, apiVersion } = option.value
            newSearchParams.set(GVK_FILTER_API_VERSION_QUERY_PARAM_KEY, apiVersion)
            newSearchParams.set(GVK_FILTER_KIND_QUERY_PARAM_KEY, kind)
        }

        replace({
            pathname: location.pathname,
            search: newSearchParams.toString(),
        })
    }

    const getResourcesToExport = (): Promise<Record<ResourceRecommenderHeaderType, string>[]> =>
        Promise.resolve(
            (resourceList?.data || []).map((resource) =>
                RESOURCE_RECOMMENDATIONS_HEADERS.reduce<Record<ResourceRecommenderHeaderType, string>>(
                    (acc, { key: headerKey }) => {
                        const metadata =
                            resource?.additionalMetadata?.[headerKey as ResourceRecommenderHeaderWithRecommendation]
                        if (metadata) {
                            acc[headerKey] =
                                `${metadata.current?.value} -> ${metadata.recommended?.value} ${metadata.delta}%`
                        } else {
                            acc[headerKey as string] = resource?.[headerKey] || ''
                        }

                        return acc
                    },
                    {} as Record<ResourceRecommenderHeaderType, string>,
                ),
            ),
        )

    return (
        <>
            {typeof renderRefreshBar === 'function' && renderRefreshBar()}
            <div className="resource-filter-options-container flexbox dc__content-space pt-16 pr-20 pb-12 pl-20 w-100">
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
                {!areFiltersHidden && (
                    <div className="flexbox dc__gap-8 dc__zi-3 dc__align-items-center">
                        {isResourceRecommender && (
                            <>
                                <div className="flexbox dc__align-items-center p-6">
                                    <Checkbox
                                        isChecked={showAbsoluteValuesInResourceRecommender}
                                        value={CHECKBOX_VALUE.CHECKED}
                                        onChange={handleToggleShowAbsoluteValues}
                                        dataTestId="resource-recommender-absolute-values-checkbox"
                                        rootClassName="mb-0 "
                                    >
                                        <span className="cn-9 fs-13 fw-4 lh-20">Show absolute values</span>
                                    </Checkbox>
                                </div>

                                <div className="dc__divider h-20" />

                                <SelectPicker<GVKOptionValueType, false>
                                    inputId="resource-filter__gvk-select"
                                    placeholder="Select Resource Kind"
                                    options={gvkOptions}
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
                            </>
                        )}

                        {FilterButton && !isResourceRecommender && (
                            <FilterButton
                                clusterName={selectedCluster?.label || ''}
                                updateTabUrl={updateK8sResourceTab}
                                showModal={showFilterModal}
                                setShowModal={setShowFilterModal}
                            />
                        )}

                        <SelectPicker
                            inputId="resource-filter-select"
                            placeholder="Select Namespace"
                            options={namespaceOptions}
                            value={selectedResource?.namespaced ? selectedNamespace : NAMESPACE_NOT_APPLICABLE_OPTION}
                            onChange={handleNamespaceChange}
                            isDisabled={!selectedResource?.namespaced}
                            icon={<NamespaceIcon className="fcn-6" />}
                            disabledTippyContent={NAMESPACE_NOT_APPLICABLE_TEXT}
                            shouldMenuAlignRight
                        />

                        {isResourceRecommender && (
                            <ExportToCsv
                                fileName={FILE_NAMES.ResourceRecommendations}
                                showOnlyIcon
                                disabled={isResourceListLoading}
                                apiPromise={getResourcesToExport}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default ResourceFilterOptions

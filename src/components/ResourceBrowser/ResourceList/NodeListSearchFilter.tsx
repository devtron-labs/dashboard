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

import { KeyboardEvent, useEffect, useMemo, useRef } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { parse as parseQueryString, ParsedQuery, stringify as stringifyQueryString } from 'query-string'

import {
    FilterChips,
    GroupedFilterSelectPicker,
    OptionType,
    SearchBar,
    SelectPicker,
    useAsync,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { getClusterCapacity } from '@Components/ClusterNodes/clusterNodes.service'

import { DEFAULT_NODE_K8S_VERSION, NODE_K8S_VERSION_FILTER_KEY } from '../Constants'
import { ClusterDetailBaseParams, NODE_SEARCH_KEYS, NodeListSearchFilterType } from '../Types'
import ColumnSelector from './ColumnSelector'
import {
    NODE_LIST_SEARCH_FILTER_OPTIONS,
    NODE_SEARCH_KEY_PLACEHOLDER,
    NODE_SEARCH_KEY_TO_LABEL_PREFIX_MAP,
} from './constants'
import { NodeSearchListOptionType } from './types'
import { getNodeSearchKeysOptionsList } from './utils'

const NodeListSearchFilter = ({
    visibleColumns,
    setVisibleColumns,
    searchParams,
    allColumns,
    rows,
    searchKey,
    handleSearch,
}: NodeListSearchFilterType) => {
    // HOOKS
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const { search } = useLocation()
    const { push } = useHistory()

    // REFS
    const searchInputRef = useRef<HTMLInputElement | null>(null)

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    useEffect(() => {
        const handleSearchFocus = () => {
            searchInputRef.current?.focus()
        }

        if (registerShortcut) {
            registerShortcut({ keys: ['/'], callback: handleSearchFocus })
        }

        return () => {
            unregisterShortcut(['/'])
        }
    }, [])

    // CONSTANTS
    const isNodeSearchFilterApplied = searchParams[NODE_SEARCH_KEYS.LABEL] || searchParams[NODE_SEARCH_KEYS.NODE_GROUP]

    // ASYNC CALLS
    const [nodeK8sVersionsLoading, nodeK8sVersionOptions, nodeK8sVersionsError, refetchNodeK8sVersions] =
        useAsync(async () => {
            const {
                result: { nodeK8sVersions: versions },
            } = await getClusterCapacity(clusterId)

            return [
                DEFAULT_NODE_K8S_VERSION,
                ...(versions?.map((version) => ({
                    label: `K8s version: ${version}`,
                    value: version,
                })) || []),
            ]
        }, [clusterId])

    // CONFIGS
    const selectedK8sNodeVersion = searchParams[NODE_K8S_VERSION_FILTER_KEY] ?? ''

    const selectedK8sVersionOption = useMemo(
        () =>
            nodeK8sVersionOptions?.find((option) => option.value === selectedK8sNodeVersion) ??
            DEFAULT_NODE_K8S_VERSION,
        [nodeK8sVersionOptions, selectedK8sNodeVersion],
    )

    const { nodeGroups, labels } = useMemo(() => getNodeSearchKeysOptionsList(rows), [JSON.stringify(rows)])

    const appliedFilters = useMemo(() => {
        const nodeGroupMap = new Set(((searchParams[NODE_SEARCH_KEYS.NODE_GROUP] as string) || '').split(','))
        const labelMap = new Set(((searchParams[NODE_SEARCH_KEYS.LABEL] as string) || '').split(','))

        return {
            [NODE_SEARCH_KEYS.NODE_GROUP]: nodeGroups.filter(({ value }) => nodeGroupMap.has(value)),
            [NODE_SEARCH_KEYS.LABEL]: labels.filter(({ value }) => labelMap.has(value)),
        }
    }, [searchParams])

    // HANDLERS
    const handleQueryParamsUpdate = (callback: (queryObject: ParsedQuery) => ParsedQuery) => {
        if (!callback) {
            return
        }

        const queryObject = parseQueryString(search)
        const finalQueryString = stringifyQueryString(callback(queryObject))

        push(`?${finalQueryString}`)
    }

    const handleApplyNodeK8sVersion = (option: OptionType) => {
        handleQueryParamsUpdate((queryObject) => {
            const finalQueryObject = structuredClone(queryObject)

            if (option.value === DEFAULT_NODE_K8S_VERSION.value) {
                delete finalQueryObject[NODE_K8S_VERSION_FILTER_KEY]
            } else {
                finalQueryObject[NODE_K8S_VERSION_FILTER_KEY] = option.value
            }

            return finalQueryObject
        })
    }

    const handleSearchInputKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const handleSearchFilterChange =
        (nodeSearchKey: NODE_SEARCH_KEYS) => (filtersToApply: NodeSearchListOptionType[]) => {
            handleQueryParamsUpdate((queryObject) => {
                const updatedQueryObject = structuredClone(queryObject)

                if (filtersToApply.length) {
                    updatedQueryObject[nodeSearchKey] = filtersToApply.map(({ value }) => value).join(',')
                } else {
                    delete updatedQueryObject[nodeSearchKey]
                }

                return updatedQueryObject
            })
        }

    const getOptionValue = ({ value, label, identifier }: NodeSearchListOptionType) => `${identifier}/${value}/${label}`

    const handleRemoveFilter = (filterConfig: Partial<Record<NODE_SEARCH_KEYS, string[]>>) => {
        handleQueryParamsUpdate((queryObject) => {
            const updatedQueryObject = structuredClone(queryObject)

            Object.keys(filterConfig).forEach((filterKey) => {
                if (filterConfig[filterKey].length) {
                    updatedQueryObject[filterKey] = filterConfig[filterKey].join(',')
                } else {
                    delete updatedQueryObject[filterKey]
                }
            })

            return updatedQueryObject
        })
    }

    const handleClearFilters = () => {
        handleQueryParamsUpdate((queryObject) => {
            const updatedQueryObject = structuredClone(queryObject)

            Object.values(NODE_SEARCH_KEYS).forEach((keyValue) => {
                delete updatedQueryObject[keyValue]
            })

            return updatedQueryObject
        })
    }

    const getFormattedFilterLabel = (filterKey: NODE_SEARCH_KEYS) => NODE_SEARCH_KEY_TO_LABEL_PREFIX_MAP[filterKey]

    return (
        <>
            <div className="node-listing-search-container pt-16 px-20 dc__zi-5">
                <SearchBar
                    initialSearchText={searchKey}
                    handleSearchChange={handleSearch}
                    keyboardShortcut="/"
                    inputProps={{
                        ref: searchInputRef,
                        placeholder: 'Search Nodes',
                        onKeyUp: handleSearchInputKeyUp,
                    }}
                />

                <GroupedFilterSelectPicker<NODE_SEARCH_KEYS>
                    filterSelectPickerPropsMap={{
                        [NODE_SEARCH_KEYS.NODE_GROUP]: {
                            inputId: 'node-search-filter-node-groups',
                            placeholder: NODE_SEARCH_KEY_PLACEHOLDER[NODE_SEARCH_KEYS.NODE_GROUP],
                            options: [{ label: 'Node Groups', options: nodeGroups }],
                            getOptionValue,
                            appliedFilterOptions: appliedFilters[NODE_SEARCH_KEYS.NODE_GROUP],
                            handleApplyFilter: handleSearchFilterChange(NODE_SEARCH_KEYS.NODE_GROUP),
                            isDisabled: false,
                            isLoading: false,
                        },
                        [NODE_SEARCH_KEYS.LABEL]: {
                            inputId: 'node-search-filter-labels',
                            placeholder: NODE_SEARCH_KEY_PLACEHOLDER[NODE_SEARCH_KEYS.LABEL],
                            options: [{ label: 'Labels', options: labels }],
                            getOptionValue,
                            appliedFilterOptions: appliedFilters[NODE_SEARCH_KEYS.LABEL],
                            handleApplyFilter: handleSearchFilterChange(NODE_SEARCH_KEYS.LABEL),
                            isDisabled: false,
                            isLoading: false,
                        },
                    }}
                    id="node-list-search-filter"
                    options={NODE_LIST_SEARCH_FILTER_OPTIONS}
                    isFilterApplied={isNodeSearchFilterApplied}
                    width={150}
                />

                <SelectPicker
                    inputId="k8s-version-select"
                    optionListError={nodeK8sVersionsError}
                    reloadOptionList={refetchNodeK8sVersions}
                    isLoading={nodeK8sVersionsLoading}
                    options={nodeK8sVersionOptions ?? []}
                    onChange={handleApplyNodeK8sVersion}
                    value={selectedK8sVersionOption}
                />

                <div className="dc__border-left h-20 mt-6" />

                {allColumns.length ? (
                    <ColumnSelector
                        {...{
                            setVisibleColumns,
                            visibleColumns,
                            allColumns,
                        }}
                    />
                ) : (
                    <div className="shimmer h-32" />
                )}
            </div>
            <FilterChips<Partial<Record<NODE_SEARCH_KEYS, string[]>>>
                className="px-20 pb-12"
                filterConfig={{
                    [NODE_SEARCH_KEYS.NODE_GROUP]: appliedFilters[NODE_SEARCH_KEYS.NODE_GROUP].map(
                        ({ value }) => value,
                    ),
                    [NODE_SEARCH_KEYS.LABEL]: appliedFilters[NODE_SEARCH_KEYS.LABEL].map(({ value }) => value),
                }}
                onRemoveFilter={handleRemoveFilter}
                clearFilters={handleClearFilters}
                getFormattedLabel={getFormattedFilterLabel}
            />
        </>
    )
}

export default NodeListSearchFilter

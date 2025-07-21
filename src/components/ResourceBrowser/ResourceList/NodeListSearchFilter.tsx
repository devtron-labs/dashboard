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

import { useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { MultiValue, SelectInstance } from 'react-select'
import { parse as parseQueryString, ParsedQuery, stringify as stringifyQueryString } from 'query-string'

import {
    ComponentSizeType,
    Icon,
    OptionType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
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
import { getNodeListSearchOptions, getNodeSearchKeysOptionsList } from './utils'

const NodeListSearchFilter = ({
    visibleColumns,
    setVisibleColumns,
    searchParams,
    allColumns,
    rows,
}: NodeListSearchFilterType) => {
    // STATES
    const [nodeSearchKey, setNodeSearchKey] = useState<NODE_SEARCH_KEYS | null>(null)
    const [isNodeListSearchOpen, setIsNodeListSearchOpen] = useState(false)

    // HOOKS
    const { clusterId } = useParams<ClusterDetailBaseParams>()
    const { search } = useLocation()
    const { push } = useHistory()

    // REFS
    const searchFilterRef = useRef<SelectInstance<NodeSearchListOptionType, true>>()

    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()

    useEffect(() => {
        const handleFocusInput = () => {
            searchFilterRef.current?.focus()
            searchFilterRef.current?.openMenu('first')
        }

        if (registerShortcut) {
            registerShortcut({ keys: ['/'], callback: handleFocusInput })
        }

        return () => {
            unregisterShortcut(['/'])
        }
    }, [])

    useEffect(() => {
        // focusing select picker whenever secondary menu is opened or closed (handled via nodeSearchKey)
        if (nodeSearchKey || (!nodeSearchKey && isNodeListSearchOpen)) {
            searchFilterRef.current?.focus()
        }
    }, [nodeSearchKey, isNodeListSearchOpen])

    // CONSTANTS
    const isNodeSearchFilterApplied =
        searchParams[NODE_SEARCH_KEYS.NAME] ||
        searchParams[NODE_SEARCH_KEYS.LABEL] ||
        searchParams[NODE_SEARCH_KEYS.NODE_GROUP]

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

    const { nodeGroups, labels, nodeNames } = useMemo(() => getNodeSearchKeysOptionsList(rows), [JSON.stringify(rows)])

    const searchOptions = useMemo(
        () =>
            nodeSearchKey
                ? getNodeListSearchOptions({ labels, nodeGroups, nodeNames, nodeSearchKey })
                : [{ label: 'Filter by', options: NODE_LIST_SEARCH_FILTER_OPTIONS }],
        [nodeGroups, labels, nodeNames, nodeSearchKey],
    )

    const searchValue = useMemo(() => {
        const nameMap = new Set(((searchParams[NODE_SEARCH_KEYS.NAME] as string) || '').split(','))
        const nodeGroupMap = new Set(((searchParams[NODE_SEARCH_KEYS.NODE_GROUP] as string) || '').split(','))
        const labelMap = new Set(((searchParams[NODE_SEARCH_KEYS.LABEL] as string) || '').split(','))

        return [
            ...nodeNames.filter(({ value }) => nameMap.has(value)),
            ...nodeGroups.filter(({ value }) => nodeGroupMap.has(value)),
            ...labels.filter(({ value }) => labelMap.has(value)),
        ]
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

    const handleSearchFilterChange = (
        newValue: SelectPickerOptionType<NODE_SEARCH_KEYS> | MultiValue<NodeSearchListOptionType>,
    ) => {
        if (newValue && !Array.isArray(newValue) && !isNodeSearchFilterApplied) {
            setNodeSearchKey((newValue as SelectPickerOptionType<NODE_SEARCH_KEYS>).value)
            return
        }

        if (
            Array.isArray(newValue) &&
            newValue.length &&
            isNodeSearchFilterApplied &&
            !('identifier' in newValue[newValue.length - 1])
        ) {
            setNodeSearchKey(newValue[newValue.length - 1].value as NODE_SEARCH_KEYS)
            return
        }

        if (Array.isArray(newValue)) {
            handleQueryParamsUpdate((queryObject) => {
                const updatedQueryObject = structuredClone(queryObject)

                const queries = newValue.reduce<Record<string, string[]>>(
                    (acc, curr) => {
                        acc[curr.identifier].push(curr.value)
                        return acc
                    },
                    {
                        [NODE_SEARCH_KEYS.NAME]: [],
                        [NODE_SEARCH_KEYS.LABEL]: [],
                        [NODE_SEARCH_KEYS.NODE_GROUP]: [],
                    },
                )

                Object.values(NODE_SEARCH_KEYS).forEach((key) => {
                    if (queries[key]?.length) {
                        updatedQueryObject[key] = queries[key].join(',')
                    } else {
                        delete updatedQueryObject[key]
                    }
                })

                return updatedQueryObject
            })
        }
    }

    const handleSearchFilterKeyDown: SelectPickerProps['onKeyDown'] = (e) => {
        if (e.key === 'Backspace' && !isNodeSearchFilterApplied) {
            e.preventDefault()
            setNodeSearchKey(null)
        }
    }

    const handleMenuOpen = () => {
        setIsNodeListSearchOpen(true)
    }

    const handleMenuClose = () => {
        searchFilterRef.current?.blur()
        setIsNodeListSearchOpen(false)
        setNodeSearchKey(null)
    }

    const formatOptionLabel: SelectPickerProps<string>['formatOptionLabel'] = (
        option: NodeSearchListOptionType,
        metadata,
    ) =>
        metadata.context === 'value'
            ? `${NODE_SEARCH_KEY_TO_LABEL_PREFIX_MAP[option.identifier]}: ${option.label}`
            : null

    const getOptionValue = ({ value, label, identifier }: NodeSearchListOptionType) => `${identifier}/${value}/${label}`

    return (
        <div className="node-listing-search-container pt-16 px-20 pb-12 dc__zi-5">
            <SelectPicker
                selectRef={searchFilterRef}
                menuIsOpen={isNodeListSearchOpen}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
                options={searchOptions}
                isMulti={!!nodeSearchKey || isNodeSearchFilterApplied}
                showCheckboxForMultiSelect={!!nodeSearchKey}
                placeholder={NODE_SEARCH_KEY_PLACEHOLDER[nodeSearchKey] || 'Filter by Node, Labels or Node groups'}
                required
                inputId="node-list-search"
                isSearchable={!!nodeSearchKey}
                isClearable
                value={searchValue}
                onChange={handleSearchFilterChange}
                onKeyDown={handleSearchFilterKeyDown}
                getOptionValue={getOptionValue}
                closeMenuOnSelect={false}
                icon={<Icon name="ic-filter" color="N600" />}
                keyboardShortcut="/"
                formatOptionLabel={formatOptionLabel}
                size={ComponentSizeType.medium}
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
    )
}

export default NodeListSearchFilter

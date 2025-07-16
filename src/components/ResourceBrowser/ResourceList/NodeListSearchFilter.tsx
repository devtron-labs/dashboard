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

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { MultiValue, SelectInstance } from 'react-select'
import { parse as parseQueryString, ParsedQuery, stringify as stringifyQueryString } from 'query-string'

import {
    ComponentSizeType,
    Icon,
    OptionType,
    SelectPicker,
    SelectPickerProps,
    useAsync,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { getClusterCapacity } from '@Components/ClusterNodes/clusterNodes.service'

import { DEFAULT_NODE_K8S_VERSION, NODE_K8S_VERSION_FILTER_KEY } from '../Constants'
import { ClusterDetailBaseParams, NODE_SEARCH_KEYS, NodeListSearchFilterType } from '../Types'
import ColumnSelector from './ColumnSelector'
import { NODE_LIST_SEARCH_FILTER_OPTIONS, NODE_SEARCH_KEY_TO_LABEL_PREFIX_MAP } from './constants'
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
        // focusing select picker after custom option click
        if (nodeSearchKey) {
            searchFilterRef.current?.focus()
        }
    }, [nodeSearchKey])

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
        () => getNodeListSearchOptions({ labels, nodeGroups, nodeNames, nodeSearchKey }),
        [nodeGroups, labels, nodeNames, nodeSearchKey],
    )

    const searchValue = useMemo(() => {
        const queryObject = parseQueryString(search)

        const nameMap = new Set(((queryObject[NODE_SEARCH_KEYS.NAME] as string) || '').split(','))
        const nodeGroupMap = new Set(((queryObject[NODE_SEARCH_KEYS.NODE_GROUP] as string) || '').split(','))
        const labelMap = new Set(((queryObject[NODE_SEARCH_KEYS.LABEL] as string) || '').split(','))

        return [
            ...nodeNames.filter(({ value }) => nameMap.has(value)),
            ...nodeGroups.filter(({ value }) => nodeGroupMap.has(value)),
            ...labels.filter(({ value }) => labelMap.has(value)),
        ]
    }, [search])

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

    const handleFilterGroupSelection = (value: typeof nodeSearchKey) => () => {
        setNodeSearchKey(value)
    }

    const renderCustomOptions = () => (
        <>
            <div className="py-4 px-8 bg__menu--secondary fs-12 fw-6 lh-20 cn-9">
                {nodeSearchKey ? 'Match' : 'Filter by'}
            </div>
            <div>
                {NODE_LIST_SEARCH_FILTER_OPTIONS.map(({ label, value }) => (
                    <Fragment key={value}>
                        <button
                            className="dc__transparent dc__truncate dc__hover-n50 fs-13 fw-4 lh-20 cn-9 px-8 py-6 w-100 dc__align-left"
                            type="button"
                            onClick={handleFilterGroupSelection(value)}
                        >
                            {label}
                        </button>
                    </Fragment>
                ))}
            </div>
        </>
    )

    const handleSearchFilterChange = (newValue: MultiValue<NodeSearchListOptionType>) => {
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

    const handleMenuClose = () => {
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
        <div className="node-listing-search-container pt-16 pr-20 pb-12 pl-20 dc__zi-5">
            <SelectPicker<string, true>
                selectRef={searchFilterRef}
                onMenuClose={handleMenuClose}
                options={searchOptions}
                isMulti
                placeholder={
                    nodeSearchKey
                        ? 'Select match criteria using a combination of name, labels, or node groups'
                        : 'Filter by Node, Labels or Node Groups'
                }
                required
                inputId="node-list-search"
                isSearchable={!!nodeSearchKey}
                isClearable
                value={searchValue}
                onChange={handleSearchFilterChange}
                getOptionValue={getOptionValue}
                renderCustomOptions={renderCustomOptions}
                shouldRenderCustomOptions={!nodeSearchKey}
                icon={<Icon name="ic-filter" color={null} />}
                formatOptionLabel={formatOptionLabel}
                size={ComponentSizeType.small}
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

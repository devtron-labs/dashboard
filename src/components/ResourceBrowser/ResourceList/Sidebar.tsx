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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useLocation, useParams } from 'react-router-dom'
import ReactSelect, { GroupBase, InputActionMeta } from 'react-select'
import Select, { FormatOptionLabelMeta } from 'react-select/base'
import DOMPurify from 'dompurify'

import {
    capitalizeFirstLetter,
    GVKType,
    highlightSearchText,
    K8S_EMPTY_GROUP,
    Nodes,
    NodeType,
    ReactSelectInputAction,
    RESOURCE_BROWSER_ROUTES,
    TreeHeading,
    TreeItem,
    TreeNode,
    TreeView,
    URL_FILTER_KEYS,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { AggregationKeys } from '../../app/types'
import { KIND_SEARCH_COMMON_STYLES, ResourceBrowserTabsId, SIDEBAR_KEYS } from '../Constants'
import { K8sObjectOptionType, RBResourceSidebarDataAttributeType, SidebarType } from '../Types'
import { convertK8sObjectMapToOptionsList, convertResourceGroupListToK8sObjectList } from '../Utils'
import { KindSearchClearIndicator, KindSearchValueContainer } from './ResourceList.component'
import { K8sResourceListURLParams } from './types'

const Sidebar = ({ apiResources, selectedResource, updateK8sResourceTab, updateTabLastSyncMoment }: SidebarType) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const location = useLocation()
    const { push } = useHistory()
    const { clusterId, kind, group } = useParams<K8sResourceListURLParams>()
    const [searchText, setSearchText] = useState('')
    /* NOTE: apiResources prop will only change after a component mount/dismount */
    const list = convertResourceGroupListToK8sObjectList(apiResources || null, kind)
    const searchInputRef = useRef<Select<K8sObjectOptionType, false, GroupBase<K8sObjectOptionType>>>(null)
    const k8sObjectOptionsList = useMemo(
        () => convertK8sObjectMapToOptionsList(convertResourceGroupListToK8sObjectList(apiResources || null, kind)),
        [apiResources],
    )
    const sortedK8sObjectOptionsList = useMemo(() => {
        if (!searchText) {
            return k8sObjectOptionsList
        }
        const lowerSearchText = searchText.toLowerCase()
        // NOTE: need to make a new copy since sort modifies the array in place
        // and toSorted is a recent addition (Baseline 2023) thus lacking in typescript 4.6
        return [...k8sObjectOptionsList].sort((a, b) => {
            const isAMatched = !!a.dataset.shortNames?.includes(lowerSearchText)
            const isBMatched = !!b.dataset.shortNames?.includes(lowerSearchText)
            if (isAMatched && !isBMatched) {
                return -1
            }
            if (!isAMatched && isBMatched) {
                return 1
            }
            return 0
        })
    }, [searchText])

    const handleInputShortcut = (e?: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
        switch (e?.key) {
            case 'Escape':
            case 'Esc':
                searchInputRef.current?.blur()
                break
            default:
                searchInputRef.current?.focus()
        }
    }

    useEffect(() => {
        registerShortcut({ callback: handleInputShortcut, keys: ['K'] })

        return () => {
            unregisterShortcut(['K'])
        }
    }, [])

    const selectNode = (selectedKind: string, selectedGroup: string): void => {
        const params = new URLSearchParams(location.search)
        params.delete(URL_FILTER_KEYS.PAGE_NUMBER)
        params.delete(URL_FILTER_KEYS.SORT_BY)
        params.delete(URL_FILTER_KEYS.SORT_ORDER)
        if (selectedKind !== Nodes.Event.toLowerCase()) {
            params.delete('eventType')
        }
        const path = generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST, {
            clusterId,
            kind: selectedKind,
            group: selectedGroup || K8S_EMPTY_GROUP,
        })

        if (path === location.pathname) {
            return
        }

        const _url = `${path}?${params.toString()}`
        updateK8sResourceTab({ url: _url, dynamicTitle: capitalizeFirstLetter(selectedKind), retainSearchParams: true })
        updateTabLastSyncMoment(ResourceBrowserTabsId.k8s_Resources)

        push(_url)
    }

    useEffect(() => {
        /* NOTE: this effect accommodates for user navigating through browser history (push) */
        if (!k8sObjectOptionsList.length) {
            return
        }
        /* NOTE: match will never be null; due to node fallback */
        const lowercasedKind = kind.toLowerCase()
        const lowercasedGroup = group.toLowerCase()
        const match =
            k8sObjectOptionsList.find(
                (option) =>
                    option.dataset.kind.toLowerCase() === lowercasedKind &&
                    (option.dataset.group || K8S_EMPTY_GROUP).toLowerCase() === lowercasedGroup,
            ) ?? k8sObjectOptionsList[0]
        /* NOTE: if nodeType doesn't match the selectedResource kind, set it accordingly */
        selectNode(match.dataset.kind.toLowerCase(), match.dataset.group.toLowerCase())
    }, [kind, group, k8sObjectOptionsList])

    const handleInputChange = (newValue: string, actionMeta: InputActionMeta): void => {
        if (actionMeta.action !== ReactSelectInputAction.inputChange) {
            return
        }

        setSearchText(newValue)
    }

    const hideMenu = () => {
        setSearchText('')
    }

    const handleOnChange = (option: K8sObjectOptionType): void => {
        if (!option) {
            return
        }
        selectNode(option.dataset.kind.toLowerCase(), option.dataset.group.toLowerCase())
    }

    const handleTreeViewNodeSelect = (node: TreeNode<RBResourceSidebarDataAttributeType>): void => {
        selectNode(node.dataAttributes?.['data-kind'], node.dataAttributes?.['data-group'])
    }

    const formatOptionLabel = (
        option: K8sObjectOptionType,
        formatOptionLabelMeta: FormatOptionLabelMeta<K8sObjectOptionType>,
    ) => (
        <div className="flexbox-col left column">
            {!formatOptionLabelMeta.inputValue ? (
                <span className="w-100 dc__ellipsis-right">{option.label}</span>
            ) : (
                <span
                    className="w-100 dc__ellipsis-right"
                    /* eslint-disable react/no-danger */
                    dangerouslySetInnerHTML={{
                        // sanitize necessary to prevent XSS attacks
                        __html: DOMPurify.sanitize(
                            highlightSearchText({
                                searchText: formatOptionLabelMeta.inputValue,
                                text: option.label,
                                highlightClasses: 'kind-search-select__option--highlight',
                            }),
                        ),
                    }}
                />
            )}
            <span className="fs-12 cn-7 lh-18 dc__ellipsis-right">{option.description}</span>
        </div>
    )

    const getOptionLabel = (option: K8sObjectOptionType) => {
        const lowerLabel = option.label.toLowerCase()
        const lowerSearchText = searchText.toLowerCase()
        // NOTE: it is given that shortNames will all be lowercase
        // see @processK8SObjects
        return option.dataset.shortNames?.some((name) => name.includes(lowerSearchText)) ? lowerSearchText : lowerLabel
    }

    const noOptionsMessage = () => 'No matching kind'

    const getTreeViewNodeId = ({ Group, Version, Kind }: GVKType) =>
        `${Group.toLowerCase()}-${Version.toLowerCase()}-${Kind.toLowerCase()}`
    const getTreeViewNodeDataAttributes = ({ Group, Version, Kind }: GVKType): RBResourceSidebarDataAttributeType => ({
        'data-group': Group.toLowerCase(),
        'data-version': Version.toLowerCase(),
        'data-kind': Kind.toLowerCase(),
    })

    const getTreeViewNodes = () => {
        const fixedNodes: TreeNode<RBResourceSidebarDataAttributeType>[] = (
            [
                !!list?.size &&
                    !!list.get(AggregationKeys.Nodes) && {
                        type: 'item',
                        title: SIDEBAR_KEYS.nodes,
                        id: getTreeViewNodeId(SIDEBAR_KEYS.nodeGVK),
                        dataAttributes: getTreeViewNodeDataAttributes(SIDEBAR_KEYS.nodeGVK),
                    },

                !!list?.size &&
                    !!list.get(AggregationKeys.Events) && {
                        type: 'item',
                        title: SIDEBAR_KEYS.events,
                        id: getTreeViewNodeId(SIDEBAR_KEYS.eventGVK),
                        dataAttributes: getTreeViewNodeDataAttributes(SIDEBAR_KEYS.eventGVK),
                    },

                !!list?.size &&
                    !!list.get(AggregationKeys.Namespaces) && {
                        type: 'item',
                        title: SIDEBAR_KEYS.namespaces,
                        id: getTreeViewNodeId(SIDEBAR_KEYS.namespaceGVK),
                        dataAttributes: getTreeViewNodeDataAttributes(SIDEBAR_KEYS.namespaceGVK),
                    },
            ] satisfies TreeNode<RBResourceSidebarDataAttributeType>[]
        ).filter(Boolean)

        const dynamicNodesList = list?.size
            ? [...list.values()].filter(
                  (k8sObject) =>
                      !(
                          k8sObject.name === AggregationKeys.Events ||
                          k8sObject.name === AggregationKeys.Namespaces ||
                          k8sObject.name === AggregationKeys.Nodes
                      ),
              )
            : []

        const dynamicNodes = dynamicNodesList.map<TreeHeading<RBResourceSidebarDataAttributeType>>((k8sObject) => ({
            id: `${k8sObject.name}-parent`,
            type: 'heading',
            title: k8sObject.name,
            items: [...k8sObject.child.entries()]
                .filter(([key]) => {
                    const keyLowerCased = key.toLowerCase()
                    return !(
                        keyLowerCased === 'node' ||
                        keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
                        keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                    )
                })
                .map<TreeNode<RBResourceSidebarDataAttributeType>>(([key, value]) => {
                    if (value.data.length === 1) {
                        const childData = value.data[0]
                        const nodeName = childData.gvk.Kind
                        return {
                            type: 'item',
                            title: nodeName,
                            id: getTreeViewNodeId(childData.gvk),
                            dataAttributes: getTreeViewNodeDataAttributes(childData.gvk),
                        } satisfies TreeItem<RBResourceSidebarDataAttributeType>
                    }

                    return {
                        type: 'heading',
                        id: `${k8sObject.name}/${key}-child`,
                        title: key,
                        dataAttributes: null,
                        items: value.data.map<TreeItem<RBResourceSidebarDataAttributeType>>((childData) => {
                            const nodeName = childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind

                            return {
                                type: 'item',
                                title: nodeName,
                                id: getTreeViewNodeId(childData.gvk),
                                dataAttributes: getTreeViewNodeDataAttributes(childData.gvk),
                            }
                        }),
                    } satisfies TreeHeading<RBResourceSidebarDataAttributeType>
                }),
        }))

        return fixedNodes.concat(dynamicNodes)
    }

    const treeViewNodes = getTreeViewNodes()

    return (
        <div className="w-250 dc__no-shrink dc__overflow-hidden flexbox-col">
            <div className="k8s-object-kind-search bg__primary pt-16 pb-8 px-10 w-100 cursor">
                <ReactSelect
                    ref={searchInputRef}
                    placeholder="Jump to Kind"
                    options={sortedK8sObjectOptionsList}
                    value={sortedK8sObjectOptionsList[0]} // Just to enable clear indicator
                    inputValue={searchText}
                    getOptionValue={getOptionLabel}
                    onInputChange={handleInputChange}
                    onChange={handleOnChange}
                    onBlur={hideMenu}
                    onKeyDown={handleInputShortcut}
                    menuIsOpen={!!searchText}
                    openMenuOnFocus={false}
                    blurInputOnSelect
                    isSearchable
                    isClearable
                    formatOptionLabel={formatOptionLabel}
                    noOptionsMessage={noOptionsMessage}
                    classNamePrefix="kind-search-select"
                    styles={KIND_SEARCH_COMMON_STYLES}
                    components={{
                        ClearIndicator: KindSearchClearIndicator,
                        IndicatorSeparator: null,
                        DropdownIndicator: null,
                        ValueContainer: KindSearchValueContainer,
                    }}
                />
            </div>

            <div className="dc__overflow-auto flexbox-col flex-grow-1 dc__border-top-n1 p-8 dc__user-select-none">
                <TreeView<RBResourceSidebarDataAttributeType>
                    nodes={treeViewNodes}
                    selectedId={getTreeViewNodeId(
                        selectedResource?.gvk || { Group: '', Version: '', Kind: '' as NodeType },
                    )}
                    onSelect={handleTreeViewNodeSelect}
                />
            </div>
        </div>
    )
}

export default Sidebar

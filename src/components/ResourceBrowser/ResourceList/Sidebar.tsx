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

import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useHistory, useLocation, useParams } from 'react-router-dom'
import ReactSelect, { GroupBase, InputActionMeta } from 'react-select'
import Select, { FormatOptionLabelMeta } from 'react-select/base'
import DOMPurify from 'dompurify'

import {
    ApiResourceGroupType,
    highlightSearchText,
    Nodes,
    ReactSelectInputAction,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICExpand } from '../../../assets/icons/ic-expand.svg'
import { AggregationKeys } from '../../app/types'
import {
    DUMMY_RESOURCE_GVK_VERSION,
    K8S_EMPTY_GROUP,
    KIND_SEARCH_COMMON_STYLES,
    RESOURCE_BROWSER_ROUTES,
    ResourceBrowserTabsId,
    SIDEBAR_KEYS,
} from '../Constants'
import { K8SObjectChildMapType, K8SObjectMapType, K8sObjectOptionType, SidebarType } from '../Types'
import {
    convertK8sObjectMapToOptionsList,
    convertResourceGroupListToK8sObjectList,
    getK8SObjectMapAfterGroupHeadingClick,
} from '../Utils'
import { KindSearchClearIndicator, KindSearchValueContainer, SidebarChildButton } from './ResourceList.component'
import { K8sResourceListURLParams } from './types'

const Sidebar = ({ apiResources, selectedResource, updateK8sResourceTab, updateTabLastSyncMoment }: SidebarType) => {
    const { registerShortcut, unregisterShortcut } = useRegisterShortcut()
    const location = useLocation()
    const { push } = useHistory()
    const { clusterId, kind } = useParams<K8sResourceListURLParams>()
    const [searchText, setSearchText] = useState('')
    /* NOTE: apiResources prop will only change after a component mount/dismount */
    const [list, setList] = useState(convertResourceGroupListToK8sObjectList(apiResources || null, kind))
    const preventScrollRef = useRef(false)
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

    const getGroupHeadingClickHandler =
        (preventCollapse = false, preventScroll = false) =>
        (e: React.MouseEvent<HTMLButtonElement> | { currentTarget: { dataset: { groupName: string } } }) => {
            preventScrollRef.current = preventScroll
            setList(getK8SObjectMapAfterGroupHeadingClick(e, list, preventCollapse))
        }

    const selectNode = (
        e: React.MouseEvent<HTMLButtonElement> | { currentTarget: Pick<K8sObjectOptionType, 'dataset'> },
        groupName?: string,
        shouldPushUrl = true,
    ): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        const _selectedGroup = e.currentTarget.dataset.group.toLowerCase()

        const params = new URLSearchParams(location.search)
        params.delete('pageNumber')
        params.delete('sortBy')
        params.delete('sortOrder')
        if (_selectedKind !== Nodes.Event.toLowerCase()) {
            params.delete('eventType')
        }
        const _url = `${generatePath(RESOURCE_BROWSER_ROUTES.K8S_RESOURCE_LIST, {
            clusterId,
            kind: _selectedKind,
            group: _selectedGroup || K8S_EMPTY_GROUP,
            version: DUMMY_RESOURCE_GVK_VERSION,
        })}?${params.toString()}`

        updateK8sResourceTab({ url: _url, dynamicTitle: e.currentTarget.dataset.kind, retainSearchParams: true })
        updateTabLastSyncMoment(ResourceBrowserTabsId.k8s_Resources)

        if (shouldPushUrl) {
            push(_url)
        }

        /**
         * If groupName present then kind selection is from search dropdown,
         * - Expand parent group if not already expanded
         * - Auto scroll to selection
         * Else reset prevent scroll to true
         */
        if (groupName) {
            getGroupHeadingClickHandler(
                true,
                false,
            )({
                currentTarget: {
                    dataset: {
                        groupName,
                    },
                },
            })
        }
    }

    useEffect(() => {
        /* NOTE: this effect accommodates for user navigating through browser history (push) */
        if (!k8sObjectOptionsList.length) {
            return
        }
        /* NOTE: match will never be null; due to node fallback */
        const match =
            k8sObjectOptionsList.find((option) => option.dataset.kind.toLowerCase() === kind) ?? k8sObjectOptionsList[0]
        /* NOTE: if nodeType doesn't match the selectedResource kind, set it accordingly */
        selectNode(
            {
                currentTarget: {
                    dataset: match.dataset,
                },
            },
            match.groupName,
            /* NOTE: if we push here the history will be lost */
            !selectedResource,
        )
    }, [kind, k8sObjectOptionsList])

    const selectedChildRef: React.Ref<HTMLButtonElement> = (node) => {
        /**
         * NOTE: all list items will be passed this ref callback
         * The correct node will get scrolled into view */
        if (node?.dataset.selected !== 'true' || preventScrollRef.current) {
            return
        }
        node?.scrollIntoView({ block: 'center' })
    }

    const renderChild = (childData: ApiResourceGroupType, useGroupName = false) => {
        const nodeName = useGroupName && childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind
        const isSelected =
            useGroupName && childData.gvk.Group
                ? selectedResource?.gvk?.Group === childData.gvk.Group &&
                  selectedResource?.gvk?.Kind === childData.gvk.Kind
                : selectedResource?.gvk?.Kind === childData.gvk.Kind &&
                  (selectedResource?.gvk?.Group === childData.gvk.Group ||
                      selectedResource?.gvk?.Group === K8S_EMPTY_GROUP)
        return (
            <SidebarChildButton
                parentRef={selectedChildRef}
                text={nodeName}
                group={childData.gvk.Group}
                version={childData.gvk.Version}
                kind={childData.gvk.Kind}
                namespaced={childData.namespaced}
                isSelected={isSelected}
                onClick={selectNode}
            />
        )
    }

    const renderK8sResourceChildren = (key: string, value: K8SObjectChildMapType, k8sObject: K8SObjectMapType) => {
        const keyLowerCased = key.toLowerCase()
        if (
            keyLowerCased === 'node' ||
            keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
            keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
        ) {
            return null
        }
        if (value.data.length === 1) {
            return renderChild(value.data[0])
        }
        return (
            <Fragment key={`${k8sObject.name}/${key}-child`}>
                <button
                    type="button"
                    className="dc__unset-button-styles"
                    data-group-name={`${k8sObject.name}/${key}`}
                    onClick={getGroupHeadingClickHandler(false, true) as React.MouseEventHandler<HTMLButtonElement>}
                >
                    <div className="flex pointer dc__align-left">
                        <ICExpand
                            className={`${value.isExpanded ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                            style={{
                                ['--rotateBy' as string]: value.isExpanded ? '90deg' : '0deg',
                            }}
                        />
                        <span className="fs-13 cn-9 fw-6 pointer w-100 pt-6 pb-6">{key}</span>
                    </div>
                </button>
                <div className="pl-20 flexbox-col">
                    {value.isExpanded &&
                        value.data.map((_child) => (
                            <React.Fragment key={_child.gvk.Group}>{renderChild(_child, true)}</React.Fragment>
                        ))}
                </div>
            </Fragment>
        )
    }

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
        selectNode(
            {
                currentTarget: {
                    dataset: option.dataset,
                },
            },
            option.groupName,
        )
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
                <div className="pb-8 flexbox-col">
                    {!!list?.size && !!list.get(AggregationKeys.Nodes) && (
                        <SidebarChildButton
                            parentRef={selectedChildRef}
                            text={SIDEBAR_KEYS.nodes}
                            group={SIDEBAR_KEYS.nodeGVK.Group}
                            version={SIDEBAR_KEYS.nodeGVK.Version}
                            kind={SIDEBAR_KEYS.nodeGVK.Kind}
                            namespaced={false}
                            isSelected={kind === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        />
                    )}
                    {!!list?.size && !!list.get(AggregationKeys.Events) && (
                        <SidebarChildButton
                            parentRef={selectedChildRef}
                            text={SIDEBAR_KEYS.events}
                            group={SIDEBAR_KEYS.eventGVK.Group}
                            version={SIDEBAR_KEYS.eventGVK.Version}
                            kind={SIDEBAR_KEYS.eventGVK.Kind}
                            namespaced
                            isSelected={kind === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        />
                    )}
                    {!!list?.size && !!list.get(AggregationKeys.Namespaces) && (
                        <SidebarChildButton
                            parentRef={selectedChildRef}
                            text={SIDEBAR_KEYS.namespaces}
                            group={SIDEBAR_KEYS.namespaceGVK.Group}
                            version={SIDEBAR_KEYS.namespaceGVK.Version}
                            kind={SIDEBAR_KEYS.namespaceGVK.Kind}
                            namespaced={false}
                            isSelected={kind === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        />
                    )}
                </div>
                {!!list?.size &&
                    [...list.values()].map((k8sObject) =>
                        k8sObject.name === AggregationKeys.Events ||
                        k8sObject.name === AggregationKeys.Namespaces ||
                        k8sObject.name === AggregationKeys.Nodes ? null : (
                            <div key={`${k8sObject.name}-parent`}>
                                <button
                                    type="button"
                                    className={`dc__unset-button-styles dc__zi-1 bg__primary w-100 ${k8sObject.isExpanded ? 'dc__position-sticky' : ''}`}
                                    style={{ top: '-8px' }}
                                    data-group-name={k8sObject.name}
                                    onClick={getGroupHeadingClickHandler(false, true)}
                                >
                                    <div className="flex pointer dc__align-left">
                                        <ICExpand
                                            className={`${k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'} rotate icon-dim-24 pointer`}
                                            style={{
                                                ['--rotateBy' as string]: !k8sObject.isExpanded ? '0deg' : '90deg',
                                            }}
                                        />
                                        <span
                                            className="fs-13 cn-9 fw-6 pointer w-100 pt-6 pb-6"
                                            data-testid={`k8sObject-${k8sObject.name}`}
                                        >
                                            {k8sObject.name}
                                        </span>
                                    </div>
                                </button>
                                {k8sObject.isExpanded && (
                                    <div className="pl-20 flexbox-col">
                                        {[...k8sObject.child.entries()].map(([key, value]) =>
                                            renderK8sResourceChildren(key, value, k8sObject),
                                        )}
                                    </div>
                                )}
                            </div>
                        ),
                    )}
            </div>
        </div>
    )
}

export default Sidebar

import React, { Fragment, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import ReactSelect, { InputActionMeta, GroupBase } from 'react-select'
import Select, { FormatOptionLabelMeta } from 'react-select/base'
import { withShortcut, IWithShortcut } from 'react-keybind'
import DOMPurify from 'dompurify'
import {
    useAsync,
    highlightSearchText,
    ReactSelectInputAction,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import {
    ApiResourceGroupType,
    K8SObjectChildMapType,
    K8SObjectMapType,
    K8sObjectOptionType,
    SidebarType,
} from '../Types'
import { AggregationKeys, Nodes } from '../../app/types'
import { K8S_EMPTY_GROUP, KIND_SEARCH_COMMON_STYLES, SIDEBAR_KEYS } from '../Constants'
import { KindSearchClearIndicator, KindSearchValueContainer } from './ResourceList.component'
import { getK8Abbreviates } from '../ResourceBrowser.service'
import { swap } from '../../common/helpers/util'
import { convertK8sObjectMapToOptionsList } from '../Utils'

const Sidebar = ({
    k8SObjectMap,
    selectedResource,
    handleGroupHeadingClick,
    setSelectedResource,
    updateResourceSelectionData,
    shortcut,
}: SidebarType & IWithShortcut) => {
    const { registerShortcut } = useRegisterShortcut()
    const { push } = useHistory()
    const location = useLocation()
    const { clusterId, namespace, nodeType, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const [searchText, setSearchText] = useState('')
    const [, k8Abbreviates] = useAsync(getK8Abbreviates)
    const sideBarElementRef = useRef<HTMLDivElement>(null)
    const preventScrollRef = useRef<boolean>(false)
    const searchInputRef = useRef<Select<K8sObjectOptionType, false, GroupBase<K8sObjectOptionType>>>(null)
    const k8sObjectOptionsList = useMemo(() => convertK8sObjectMapToOptionsList(k8SObjectMap), [k8SObjectMap?.size])

    const handleInputShortcut = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case 'k':
                searchInputRef.current?.focus()
                break
            case 'Escape':
            case 'Esc':
                searchInputRef.current?.blur()
                break
            default:
        }
    }

    useEffect(() => {
        if (registerShortcut) {
            shortcut.registerShortcut(handleInputShortcut, ['k'], 'KindSearchFocus', 'Focus kind search')
        }

        return (): void => {
            shortcut.unregisterShortcut(['k'])
        }
    }, [registerShortcut])

    useEffect(() => {
        if (k8SObjectMap?.size) {
            if (!preventScrollRef.current && sideBarElementRef.current) {
                sideBarElementRef.current.scrollIntoView({ block: 'center' })
            }
        }
    }, [sideBarElementRef.current])

    const selectNode = (
        e: React.MouseEvent<HTMLDivElement> | { currentTarget: Pick<K8sObjectOptionType, 'dataset'> },
        groupName?: string,
        preventScroll?: boolean,
    ): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        const _selectedGroup = e.currentTarget.dataset.group.toLowerCase()

        if (_selectedKind === nodeType && (group === _selectedGroup || group === K8S_EMPTY_GROUP)) {
            return
        }

        push({
            pathname: `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${_selectedKind}/${_selectedGroup || K8S_EMPTY_GROUP}`,
            search: location.search,
        })
        const _selectedResource = {
            namespaced: e.currentTarget.dataset.namespaced === 'true',
            gvk: {
                Group: e.currentTarget.dataset.group,
                Version: e.currentTarget.dataset.version,
                Kind: e.currentTarget.dataset.kind as Nodes,
            },
            isGrouped: e.currentTarget.dataset.grouped === 'true',
        }
        setSelectedResource(_selectedResource)
        updateResourceSelectionData(_selectedResource)

        /**
         * If groupName present then kind selection is from search dropdown,
         * - Expand parent group if not already expanded
         * - Auto scroll to selection
         * Else reset prevent scroll to true
         */
        if (groupName) {
            preventScrollRef.current = false
            handleGroupHeadingClick(
                {
                    currentTarget: {
                        dataset: {
                            groupName,
                        },
                    },
                },
                true,
            )
        } else {
            preventScrollRef.current = preventScroll ?? true
        }
    }

    const updateRef = (_node: HTMLDivElement) => {
        if (_node?.dataset?.selected === 'true') {
            sideBarElementRef.current = _node
        }
    }

    const renderChild = (childData: ApiResourceGroupType, useGroupName?: boolean) => {
        const nodeName = useGroupName && childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind
        const isSelected =
            useGroupName && childData.gvk.Group
                ? selectedResource?.gvk?.Group === childData.gvk.Group &&
                  selectedResource?.gvk?.Kind === childData.gvk.Kind
                : nodeType === childData.gvk.Kind.toLowerCase() &&
                  (group === childData.gvk.Group.toLowerCase() || group === K8S_EMPTY_GROUP)
        return (
            <div
                key={`${nodeName}-child`}
                ref={updateRef}
                className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                    useGroupName ? 'ml-16' : ''
                } ${isSelected ? 'bcb-1 cb-5' : 'cn-7 resource-tree-object'}`}
                data-group={childData.gvk.Group}
                data-version={childData.gvk.Version}
                data-kind={childData.gvk.Kind}
                data-namespaced={childData.namespaced}
                data-grouped={useGroupName}
                data-selected={isSelected}
                onClick={selectNode}
                data-testid={nodeName}
            >
                {nodeName}
            </div>
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
                <div
                    className="flex pointer"
                    data-group-name={`${k8sObject.name}/${key}`}
                    onClick={handleGroupHeadingClick}
                >
                    <DropDown
                        className={`${value.isExpanded ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                        style={{
                            ['--rotateBy' as string]: value.isExpanded ? '0deg' : '-90deg',
                        }}
                    />
                    <span className={`fs-14 ${value.isExpanded ? 'fw-6' : 'fw-4'} pointer w-100 pt-6 pb-6`}>{key}</span>
                </div>
                {value.isExpanded && value.data.map((_child) => renderChild(_child, true))}
            </Fragment>
        )
    }

    const handleInputChange = (newValue: string, actionMeta: InputActionMeta): void => {
        if (actionMeta.action !== ReactSelectInputAction.inputChange) {
            return
        }

        setSearchText(newValue)
    }

    const bringMatchedAbbreviatedOptionToFront = (options: K8sObjectOptionType[]): K8sObjectOptionType[] => {
        const lowerSearchText = searchText.toLowerCase()
        if (!searchText || !k8Abbreviates?.[lowerSearchText]) {
            return options
        }
        const loc = k8sObjectOptionsList.findIndex(
            (option) => k8Abbreviates[lowerSearchText] === option.label.toLowerCase(),
        )
        if (loc > -1) {
            swap(options, loc, 0)
        }
        return options
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
            option.label !== (SIDEBAR_KEYS.namespaces as Nodes) &&
                option.label !== (SIDEBAR_KEYS.events as Nodes) &&
                option.label !== (SIDEBAR_KEYS.nodes as Nodes),
        )
    }

    const formatOptionLabel = useCallback(
        (option: K8sObjectOptionType, formatOptionLabelMeta: FormatOptionLabelMeta<K8sObjectOptionType>) => {
            return (
                <div className="flex left column">
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
                </div>
            )
        },
        [],
    )

    const getOptionLabel = (option: K8sObjectOptionType) => {
        const lowerLabel = option.label.toLowerCase()
        const lowerSearchText = searchText.toLowerCase()
        const expandedAbbreviateValue = k8Abbreviates?.[lowerSearchText]
        return expandedAbbreviateValue === lowerLabel ? lowerSearchText : lowerLabel
    }

    const noOptionsMessage = () => 'No matching kind'

    return (
        <div className="k8s-object-container">
            <div className="k8s-object-kind-search bcn-0 pt-16 pb-8 w-200 dc__m-auto cursor">
                <ReactSelect
                    ref={searchInputRef}
                    placeholder="Jump to Kind"
                    options={bringMatchedAbbreviatedOptionToFront(k8sObjectOptionsList)}
                    value={k8sObjectOptionsList[0]} // Just to enable clear indicator
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
            <div className="k8s-object-wrapper dc__border-top-n1 p-8 dc__user-select-none">
                <div className="pb-8">
                    <div
                        key={SIDEBAR_KEYS.nodeGVK.Kind}
                        ref={updateRef}
                        onClick={selectNode}
                        data-namespaced={false}
                        data-kind={SIDEBAR_KEYS.nodeGVK.Kind}
                        data-group={SIDEBAR_KEYS.nodeGVK.Group}
                        data-version={SIDEBAR_KEYS.nodeGVK.Version}
                        className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                            nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()
                                ? 'bcb-1 cb-5'
                                : 'cn-7 resource-tree-object'
                        }`}
                    >
                        {SIDEBAR_KEYS.nodes}
                    </div>
                    {k8SObjectMap?.size && k8SObjectMap.get(AggregationKeys.Events) && (
                        <div
                            key={SIDEBAR_KEYS.eventGVK.Kind}
                            ref={updateRef}
                            className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                                    ? 'bcb-1 cb-5'
                                    : 'cn-7 resource-tree-object'
                            }`}
                            data-group={SIDEBAR_KEYS.eventGVK.Group}
                            data-version={SIDEBAR_KEYS.eventGVK.Version}
                            data-kind={SIDEBAR_KEYS.eventGVK.Kind}
                            data-namespaced
                            data-selected={nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        >
                            {SIDEBAR_KEYS.events}
                        </div>
                    )}
                    {k8SObjectMap?.size && k8SObjectMap.get(AggregationKeys.Namespaces) && (
                        <div
                            key={SIDEBAR_KEYS.namespaceGVK.Kind}
                            ref={updateRef}
                            className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                nodeType === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()
                                    ? 'bcb-1 cb-5'
                                    : 'cn-7 resource-tree-object'
                            }`}
                            data-group={SIDEBAR_KEYS.namespaceGVK.Group}
                            data-version={SIDEBAR_KEYS.namespaceGVK.Version}
                            data-kind={SIDEBAR_KEYS.namespaceGVK.Kind}
                            data-namespaced={false}
                            data-selected={nodeType === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        >
                            {SIDEBAR_KEYS.namespaces}
                        </div>
                    )}
                </div>
                {k8SObjectMap?.size &&
                    [...k8SObjectMap.values()].map((k8sObject) =>
                        k8sObject.name === AggregationKeys.Events ||
                        k8sObject.name === AggregationKeys.Namespaces ? null : (
                            <Fragment key={`${k8sObject.name}-parent`}>
                                <div
                                    className="flex pointer"
                                    data-group-name={k8sObject.name}
                                    onClick={handleGroupHeadingClick}
                                >
                                    <DropDown
                                        className={`${k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'} rotate icon-dim-24 pointer`}
                                        style={{ ['--rotateBy' as string]: !k8sObject.isExpanded ? '-90deg' : '0deg' }}
                                    />
                                    <span
                                        className="fs-14 fw-6 pointer w-100 pt-6 pb-6"
                                        data-testid={`k8sObject-${k8sObject.name}`}
                                    >
                                        {k8sObject.name}
                                    </span>
                                </div>
                                {k8sObject.isExpanded && (
                                    <div className="pl-20">
                                        {[...k8sObject.child.entries()].map(([key, value]) =>
                                            renderK8sResourceChildren(key, value, k8sObject),
                                        )}
                                    </div>
                                )}
                            </Fragment>
                        ),
                    )}
            </div>
        </div>
    )
}

export default withShortcut(Sidebar)

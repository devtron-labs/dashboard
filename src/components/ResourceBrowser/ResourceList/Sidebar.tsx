import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
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
import ReactSelect, { GroupBase, InputActionMeta } from 'react-select'
import Select, { FormatOptionLabelMeta } from 'react-select/dist/declarations/src/Select'
import { KindSearchClearIndicator, KindSearchValueContainer } from './ResourceList.component'
import { withShortcut, IWithShortcut } from 'react-keybind'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'

function Sidebar({
    k8SObjectMap,
    selectedResource,
    handleGroupHeadingClick,
    setSelectedResource,
    updateResourceSelectionData,
    shortcut,
    isCreateModalOpen,
    isClusterError
}: SidebarType & IWithShortcut) {
    const { push } = useHistory()
    const { clusterId, namespace, nodeType, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const [searchText, setSearchText] = useState('')
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [k8sObjectOptionsList, setK8sObjectOptionsList] = useState<K8sObjectOptionType[]>([])
    const sideBarElementRef = useRef<HTMLDivElement>(null)
    const preventScrollRef = useRef<boolean>(false)
    const searchInputRef = useRef<Select<K8sObjectOptionType, false, GroupBase<K8sObjectOptionType>>>(null)

    useEffect(() => {
        if (!isCreateModalOpen) {
            shortcut.registerShortcut(handleInputShortcut, ['k'], 'KindSearchFocus', 'Focus kind search')
        }

        return (): void => {
            shortcut.unregisterShortcut(['k'])
        }
    }, [isCreateModalOpen])

    useEffect(() => {
        if (k8SObjectMap?.size) {
            if (!preventScrollRef.current && sideBarElementRef.current) {
                sideBarElementRef.current.scrollIntoView({ block: 'center' })
            }

            if (!k8sObjectOptionsList.length) {
                covertK8sMapToOptionsList()
            }
        }
    }, [k8SObjectMap?.size, sideBarElementRef.current])

    const handleInputShortcut = (e: React.KeyboardEvent<any>) => {
        const _key = e.key
        if (_key === 'k') {
            searchInputRef.current?.focus()
        } else if (_key === 'Escape' || _key === 'Esc') {
            searchInputRef.current?.blur()
        }
    }

    const covertK8sMapToOptionsList = () => {
        const _k8sObjectOptionsList = [...k8SObjectMap.values()].flatMap((k8sObject) => {
            return [...k8sObject.child.entries()].flatMap(([key, value]) => {
                const keyLowerCased = key.toLowerCase()
                if (
                    keyLowerCased === 'node' ||
                    keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
                    keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                ) {
                    return []
                }

                return value.data.map((childData) => {
                    return {
                        label: childData.gvk.Kind,
                        value: childData.gvk.Group || K8S_EMPTY_GROUP,
                        dataset: {
                            group: childData.gvk.Group,
                            version: childData.gvk.Version,
                            kind: childData.gvk.Kind,
                            namespaced: `${childData.namespaced}`,
                            grouped: `${k8sObject.child.size > 1}`,
                        },
                        groupName: value.data.length === 1 ? k8sObject.name : `${k8sObject.name}/${key}`,
                    }
                })
            })
        })
        _k8sObjectOptionsList.push({
            label: SIDEBAR_KEYS.events as Nodes,
            value: K8S_EMPTY_GROUP,
            dataset: {
                group: SIDEBAR_KEYS.eventGVK.Group,
                version: SIDEBAR_KEYS.eventGVK.Version,
                kind: SIDEBAR_KEYS.eventGVK.Kind as Nodes,
                namespaced: 'true',
                grouped: 'false',
            },
            groupName: '',
        })
        _k8sObjectOptionsList.push({
            label: SIDEBAR_KEYS.namespaces as Nodes,
            value: K8S_EMPTY_GROUP,
            dataset: {
                group: SIDEBAR_KEYS.namespaceGVK.Group,
                version: SIDEBAR_KEYS.namespaceGVK.Version,
                kind: SIDEBAR_KEYS.namespaceGVK.Kind as Nodes,
                namespaced: 'false',
                grouped: 'false',
            },
            groupName: '',
        })
        setK8sObjectOptionsList(_k8sObjectOptionsList)
    }

    const selectNode = (e: any, groupName?: string, preventScroll?: boolean): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        const _selectedGroup = e.currentTarget.dataset.group.toLowerCase()

        if (_selectedKind === nodeType && (group === _selectedGroup || group === K8S_EMPTY_GROUP)) {
            return
        }

        push(`${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${_selectedKind}/${_selectedGroup || K8S_EMPTY_GROUP}`)
        const _selectedResource = {
            namespaced: e.currentTarget.dataset.namespaced === 'true',
            gvk: {
                Group: e.currentTarget.dataset.group,
                Version: e.currentTarget.dataset.version,
                Kind: e.currentTarget.dataset.kind,
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
                            groupName: groupName,
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
        } else if (value.data.length === 1) {
            return renderChild(value.data[0])
        } else {
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
                                ['--rotateBy' as any]: value.isExpanded ? '0deg' : '-90deg',
                            }}
                        />
                        <span className={`fs-14 ${value.isExpanded ? 'fw-6' : 'fw-4'} pointer w-100 pt-6 pb-6`}>
                            {key}
                        </span>
                    </div>
                    {value.isExpanded && value.data.map((_child) => renderChild(_child, true))}
                </Fragment>
            )
        }
    }

    const handleInputChange = (newValue: string, actionMeta: InputActionMeta): void => {
        if (actionMeta.action === 'input-change') {
            setSearchText(newValue)
            setMenuOpen(!!newValue)
        }
    }

    const hideMenu = () => {
        setMenuOpen(false)
        setSearchText('')
    }

    const handleOnChange = (option: K8sObjectOptionType): void => {
        if (!option) return
        selectNode(
            {
                currentTarget: {
                    dataset: option.dataset,
                },
            },
            option.groupName,
            option.label !== (SIDEBAR_KEYS.namespaces as Nodes) && option.label !== (SIDEBAR_KEYS.events as Nodes) && option.label !== (SIDEBAR_KEYS.nodes as Nodes) && option.label !== (SIDEBAR_KEYS.overview as Nodes),
        )
    }

    function formatOptionLabel(option: K8sObjectOptionType, formatOptionLabelMeta: FormatOptionLabelMeta<any>) {
        return (
            <div className="flex left column">
                {!formatOptionLabelMeta.inputValue ? (
                    <span className="w-100 dc__ellipsis-right">{option.label}</span>
                ) : (
                    <span
                        className="w-100 dc__ellipsis-right"
                        dangerouslySetInnerHTML={{
                            __html: option.label.replace(
                                new RegExp(formatOptionLabelMeta.inputValue, 'gi'),
                                (highlighted) => `<mark>${highlighted}</mark>`,
                            ),
                        }}
                    />
                )}
            </div>
        )
    }

    function customFilter(option, searchText) {
        return option.data.label.toLowerCase().includes(searchText.toLowerCase())
    }

    const noOptionsMessage = () => 'No matching kind'

    return !k8SObjectMap?.size ? (
        <Progressing pageLoader />
    ) : (
        <div className="k8s-object-container">
            <div className="k8s-object-kind-search bcn-0 pt-16 pb-8 w-200 dc__m-auto cursor">
                <ReactSelect
                    ref={searchInputRef}
                    placeholder="Jump to Kind"
                    options={k8sObjectOptionsList}
                    value={k8sObjectOptionsList[0]} // Just to enable clear indicator
                    inputValue={searchText}
                    onInputChange={handleInputChange}
                    onChange={handleOnChange}
                    onBlur={hideMenu}
                    onKeyDown={handleInputShortcut}
                    menuIsOpen={isMenuOpen}
                    openMenuOnFocus={false}
                    blurInputOnSelect
                    isSearchable
                    isClearable
                    formatOptionLabel={formatOptionLabel}
                    filterOption={customFilter}
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
            <div className="p-8">
                    <div 
                        key={SIDEBAR_KEYS.overview}
                        ref={updateRef}
                        onClick={selectNode}
                        data-kind={SIDEBAR_KEYS.overview}
                        data-group={''}
                        data-namespaced={false}
                        className={`fs-13 pointer flexbox flex-justify dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                            nodeType === SIDEBAR_KEYS.overview.toLowerCase()
                                ? 'bcb-1 cb-5'
                                : 'cn-7 resource-tree-object'
                        }`}
                    >
                        {SIDEBAR_KEYS.overview}
                        {isClusterError && <Error className="mt-2 mb-2 icon-dim-16" />}
                    </div>
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
                    {SIDEBAR_KEYS.eventGVK.Version && (
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
                            data-namespaced={true}
                            data-selected={nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        >
                            {SIDEBAR_KEYS.events}
                        </div>
                    )}
                    {SIDEBAR_KEYS.namespaceGVK.Version && (
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
                {[...k8SObjectMap.values()].map((k8sObject) =>
                    k8sObject.name === AggregationKeys.Events ? null : (
                        <Fragment key={`${k8sObject.name}-parent`}>
                            <div
                                className="flex pointer"
                                data-group-name={k8sObject.name}
                                onClick={handleGroupHeadingClick}
                            >
                                <DropDown
                                    className={`${k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'} rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !k8sObject.isExpanded ? '-90deg' : '0deg' }}
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

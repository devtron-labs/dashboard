import React, { Fragment, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ReactSelect, { InputActionMeta, GroupBase } from 'react-select'
import Select, { FormatOptionLabelMeta } from 'react-select/base'
import { withShortcut, IWithShortcut } from 'react-keybind'
import DOMPurify from 'dompurify'
import { useAsync, highlightSearchText } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import {
    ApiResourceGroupType,
    K8SObjectChildMapType,
    K8SObjectMapType,
    K8sObjectOptionType,
    SidebarType,
    URLParams,
} from '../Types'
import { AggregationKeys, Nodes } from '../../app/types'
import { K8S_EMPTY_GROUP, KIND_SEARCH_COMMON_STYLES, SIDEBAR_KEYS } from '../Constants'
import { KindSearchClearIndicator, KindSearchValueContainer, SidebarChildButton } from './ResourceList.component'
import { getK8Abbreviates } from '../ResourceBrowser.service'
import { swap } from '../../common/helpers/util'
import {
    convertK8sObjectMapToOptionsList,
    convertResourceGroupListToK8sObjectList,
    getK8SObjectMapAfterGroupHeadingClick,
} from '../Utils'

const Sidebar = ({
    apiResources,
    selectedResource,
    setSelectedResource,
    updateK8sResourceTab,
    updateK8sResourceTabLastSyncMoment,
    enableShortcut,
    shortcut,
}: SidebarType & IWithShortcut) => {
    const location = useLocation()
    const { clusterId, namespace, nodeType, group, node } = useParams<URLParams>()
    const [searchText, setSearchText] = useState('')
    /* NOTE: apiResources prop will only change after a component mount/dismount */
    const [list, setList] = useState(convertResourceGroupListToK8sObjectList(apiResources || null, nodeType))
    const [, k8Abbreviates] = useAsync(getK8Abbreviates)
    const selectedChildRef = useRef<HTMLButtonElement>(null)
    const preventScrollRef = useRef<boolean>(false)
    const searchInputRef = useRef<Select<K8sObjectOptionType, false, GroupBase<K8sObjectOptionType>>>(null)
    const k8sObjectOptionsList = useMemo(() => convertK8sObjectMapToOptionsList(list), [list])

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
        if (enableShortcut) {
            shortcut.registerShortcut(handleInputShortcut, ['k'], 'KindSearchFocus', 'Focus kind search')
        }

        return (): void => {
            shortcut.unregisterShortcut(['k'])
        }
    }, [enableShortcut])

    useEffect(() => {
        if (!list?.size || !selectedChildRef.current) {
            return
        }
        /**
         * NOTE: on a reload/paste_url selectedResource will be null
         * Set it to the correct resource figured from nodeType only if
         * no node is set (i.e no DynamicTab is open) */
        if (selectedResource.gvk.Kind !== selectedChildRef.current.dataset.kind && !node) {
            selectedChildRef.current.click()
        }
        if (!preventScrollRef.current) {
            selectedChildRef.current.scrollIntoView({ block: 'center' })
        }
    }, [selectedChildRef.current])

    const handleGroupHeadingClick = (
        /* TODO: simplify this */
        e: React.MouseEvent<HTMLElement> | { currentTarget: { dataset: { groupName: string } } },
        preventCollapse = false,
    ): void => {
        setList(getK8SObjectMapAfterGroupHeadingClick(e, list, preventCollapse))
    }

    const selectNode = (
        e: React.MouseEvent<HTMLButtonElement> | { currentTarget: Pick<K8sObjectOptionType, 'dataset'> },
        groupName?: string,
        preventScroll?: boolean,
    ): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        const _selectedGroup = e.currentTarget.dataset.group.toLowerCase()

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
        updateK8sResourceTabLastSyncMoment()
        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${_selectedKind}/${_selectedGroup || K8S_EMPTY_GROUP}${location.search}`
        updateK8sResourceTab(_url, e.currentTarget.dataset.kind)

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

    const updateRef = (_node: HTMLButtonElement) => {
        if (_node?.dataset?.selected === 'true') {
            selectedChildRef.current = _node
        }
    }

    const renderChild = (childData: ApiResourceGroupType, useGroupName = false) => {
        const nodeName = useGroupName && childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind
        const isSelected =
            useGroupName && childData.gvk.Group
                ? selectedResource?.gvk?.Group === childData.gvk.Group &&
                  selectedResource?.gvk?.Kind === childData.gvk.Kind
                : nodeType === childData.gvk.Kind.toLowerCase() &&
                  (group === childData.gvk.Group.toLowerCase() || group === K8S_EMPTY_GROUP)
        return (
            <SidebarChildButton
                parentRef={updateRef}
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
        // TODO: replace with enum after merge of feat/user-status-p3
        if (actionMeta.action !== 'input-change') {
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
                <div className="pb-8 flexbox-col">
                    <SidebarChildButton
                        parentRef={null}
                        text={SIDEBAR_KEYS.nodes}
                        group={SIDEBAR_KEYS.nodeGVK.Group}
                        version={SIDEBAR_KEYS.nodeGVK.Version}
                        kind={SIDEBAR_KEYS.nodeGVK.Kind}
                        namespaced={false}
                        isSelected={nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}
                        onClick={selectNode}
                    />
                    {list?.size && list.get(AggregationKeys.Events) && (
                        <SidebarChildButton
                            parentRef={updateRef}
                            text={SIDEBAR_KEYS.events}
                            group={SIDEBAR_KEYS.eventGVK.Group}
                            version={SIDEBAR_KEYS.eventGVK.Version}
                            kind={SIDEBAR_KEYS.eventGVK.Kind}
                            namespaced={false}
                            isSelected={nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        />
                    )}
                    {list?.size && list.get(AggregationKeys.Namespaces) && (
                        <SidebarChildButton
                            parentRef={updateRef}
                            text={SIDEBAR_KEYS.namespaces}
                            group={SIDEBAR_KEYS.namespaceGVK.Group}
                            version={SIDEBAR_KEYS.namespaceGVK.Version}
                            kind={SIDEBAR_KEYS.namespaceGVK.Kind}
                            namespaced={false}
                            isSelected={nodeType === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        />
                    )}
                </div>
                {list?.size &&
                    [...list.values()].map((k8sObject) =>
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
                                    <div className="pl-20 flexbox-col">
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

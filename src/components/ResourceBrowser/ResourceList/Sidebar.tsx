import React, { Fragment, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import { ApiResourceGroupType, K8SObjectChildMapType, K8SObjectMapType, SidebarType } from '../Types'
import { AggregationKeys } from '../../app/types'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { Progressing } from '../../common'

export function Sidebar({
    k8SObjectMap,
    selectedResource,
    handleGroupHeadingClick,
    setSelectedResource,
    updateResourceSelectionData,
}: SidebarType) {
    const { push } = useHistory()
    const { clusterId, namespace, nodeType, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const sideBarElementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (k8SObjectMap?.size && sideBarElementRef.current) {
            sideBarElementRef.current.scrollIntoView({ block: 'center' })
        }
    }, [k8SObjectMap?.size])

    const selectNode = (e): void => {
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
                ? selectedResource?.gvk?.Group === childData.gvk.Group
                : nodeType === childData.gvk.Kind.toLowerCase()
        return (
            <div
                key={nodeName}
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
                <>
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
                </>
            )
        }
    }

    return !k8SObjectMap?.size ? (
        <Progressing pageLoader />
    ) : (
        <div className="k8s-object-container p-8 dc__user-select-none">
            {[...k8SObjectMap.values()].map((k8sObject) =>
                k8sObject.name === AggregationKeys.Events ? null : (
                    <Fragment key={k8sObject.name}>
                        <div
                            className="flex pointer"
                            data-group-name={k8sObject.name}
                            onClick={handleGroupHeadingClick}
                        >
                            <DropDown
                                className={`${k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                                style={{ ['--rotateBy' as any]: !k8sObject.isExpanded ? '-90deg' : '0deg' }}
                            />
                            <span className="fs-14 fw-6 pointer w-100 pt-6 pb-6">{k8sObject.name}</span>
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
            <div className="dc__border-top-n1 pt-8">
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
        </div>
    )
}

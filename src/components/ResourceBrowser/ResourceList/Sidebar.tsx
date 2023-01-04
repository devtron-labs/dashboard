import React, { Fragment } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import '../ResourceBrowser.scss'
import { SidebarType } from '../Types'
import { AggregationKeys, Nodes } from '../../app/types'

export function Sidebar({
    k8SObjectList,
    handleGroupHeadingClick,
    setSelectedResource,
    updateResourceSelectionData,
}: SidebarType) {
    const { push } = useHistory()
    const { clusterId, namespace, nodeType } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
    }>()
    const selectNode = (e): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        push(
            `${URLS.RESOURCE_BROWSER}/${clusterId}${namespace ? `/${namespace}` : ''}${
                _selectedKind ? `/${_selectedKind}` : ''
            }`,
        )
        const _selectedResource = {
            namespaced: e.currentTarget.dataset.namespaced === 'true',
            gvk: {
                Group: e.currentTarget.dataset.group,
                Version: e.currentTarget.dataset.version,
                Kind: e.currentTarget.dataset.kind,
            },
        }
        setSelectedResource(_selectedResource)
        updateResourceSelectionData(_selectedResource)
    }
    if (!k8SObjectList.length) {
        return null
    }
    return (
        <div className="k8s-object-container p-8">
            {k8SObjectList.map((k8sObject) =>
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
                                {k8sObject.child.map((childData) =>
                                    childData.gvk.Kind.toLowerCase() === 'node' ||
                                    childData.gvk.Kind.toLowerCase() === 'namespace' ||
                                    childData.gvk.Kind.toLowerCase() === 'event' ? null : (
                                        <div
                                            key={childData.gvk.Kind}
                                            className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                                nodeType === childData.gvk.Kind.toLowerCase()
                                                    ? 'bcb-1 cb-5'
                                                    : 'cn-7 resource-tree-object'
                                            }`}
                                            data-group={childData.gvk.Group}
                                            data-version={childData.gvk.Version}
                                            data-kind={childData.gvk.Kind}
                                            data-namespaced={childData.namespaced}
                                            onClick={selectNode}
                                        >
                                            {childData.gvk.Kind}
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </Fragment>
                ),
            )}
            <div className="dc__border-top-n1 pt-8 mr-4">
                <div
                    key={'Event'}
                    className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                        nodeType === 'event' ? 'bcb-1 cb-5' : 'cn-7 resource-tree-object'
                    }`}
                    data-group="events.k8s.io"
                    data-version="v1"
                    data-kind="Event"
                    data-namespaced={true}
                    onClick={selectNode}
                >
                    Events
                </div>
                <div
                    key={'Namespace'}
                    className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                        nodeType === 'namespace' ? 'bcb-1 cb-5' : 'cn-7 resource-tree-object'
                    }`}
                    data-group=""
                    data-version="v1"
                    data-kind="Namespace"
                    data-namespaced={false}
                    onClick={selectNode}
                >
                    Namespaces
                </div>
            </div>
        </div>
    )
}

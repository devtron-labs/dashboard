import React, { Fragment } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import '../ResourceBrowser.scss'
import { SidebarType } from '../Types'

export function Sidebar({
    k8SObjectList,
    handleGroupHeadingClick,
    setSelectedResource,
}: SidebarType) {
    const { push } = useHistory()

    const { clusterId, namespace, nodeType } = useParams<{
      clusterId: string
      namespace: string
      nodeType: string
      node: string
  }>()
    const selectNode = (e): void => {
        const _selectedResource = e.currentTarget.dataset.kind.toLowerCase()
        push(
            `${URLS.RESOURCE_BROWSER}/${clusterId}${namespace ? `/${namespace}` : ''}${
                _selectedResource ? `/${URLS.APP_DETAILS_K8}/${_selectedResource}` : ''
            }`,
        )
        setSelectedResource({
            namespaced: _selectedResource.namespaced,
            gvk: {
                Group: e.currentTarget.dataset.group,
                Version: e.currentTarget.dataset.version,
                Kind: e.currentTarget.dataset.kind,
            },
        })
    }
    return (
        <div className="k8s-object-container">
            {k8SObjectList.map((k8sObject) => (
                <Fragment key={k8sObject.name}>
                    <div className="flex pointer" data-group-name={k8sObject.name} onClick={handleGroupHeadingClick}>
                        <DropDown
                            className={`${k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                            style={{ ['--rotateBy' as any]: !k8sObject.isExpanded ? '-90deg' : '0deg' }}
                        />
                        <span className="fs-14 fw-6 pointer w-100 pt-6 pb-6">{k8sObject.name}</span>
                    </div>
                    {k8sObject.isExpanded && (
                        <div className="pl-20">
                            {k8sObject.child.map((gvk) => (
                                <div
                                    key={gvk.Kind}
                                    className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                        nodeType === gvk.Kind.toLowerCase() ? 'bcb-1 cb-5' : 'cn-7 resource-tree-object'
                                    }`}
                                    data-group={gvk.Group}
                                    data-version={gvk.Version}
                                    data-kind={gvk.Kind}
                                    data-namespaced={k8sObject.namespaced}
                                    onClick={selectNode}
                                >
                                    {gvk.Kind}
                                </div>
                            ))}
                        </div>
                    )}
                </Fragment>
            ))}
        </div>
    )
}

import React, { useState } from 'react'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import K8sPermissionModal from './K8sPermissionModal'
import { ReactComponent as Clone } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { HEADER_OPTIONS } from './K8sPermissions.utils'
import { K8sPermission } from '../userGroups.types'

export default function K8sPermissons({ k8sPermission, setK8sPermission }: K8sPermission) {
    const [togglePermissionModal, setPermissionToggleModal] = useState<boolean>()
    const [tempPermission, setTempPermission] = useState()
    const [selectedPermissionAction, setSelectedPermissionAction] = useState<{
        action: string
        index: number
    }>()

    const editPermission = (permissions, action, index) => {
        setPermissionToggleModal(true)
        setTempPermission(permissions)
        setSelectedPermissionAction({
            action,
            index,
        })
    }

    const creatPermission = () => {
        setPermissionToggleModal(true)
        setTempPermission(null)
    }

    const deletePermission = (index) => {
        const _k8sPermission = [...k8sPermission]
        _k8sPermission.splice(index, 1)
        setK8sPermission(_k8sPermission)
    }

    const closeModal = () => {
        setPermissionToggleModal(false)
        setSelectedPermissionAction(null)
    }

    return (
        <>
            <div className="anchor pointer flex left mt-16 fs-13 fw-6" onClick={creatPermission}>
                <AddIcon className="add-svg mr-12" /> Add permission
            </div>
            {k8sPermission?.length ? (
                <div className="mt-16">
                    <div className="kubernetes-header dc__border-bottom fw-6 pt-8 pb-8">
                        {HEADER_OPTIONS.map((header,key) => (
                            <span key={key}>{header}</span>
                        ))}
                    </div>
                    {k8sPermission.map((element, index) => {
                        return (
                            <div key={index} className="kubernetes-header pt-12 pb-12 cn-9 dc__border-bottom-n1">
                                <span className="dc__truncate-text">{element.cluster.label}</span>
                                <span className="dc__truncate-text">{element.group.label}</span>
                                <span className="dc__truncate-text">{element.kind.label}</span>
                                <span className="dc__truncate-text">{element.namespace.label}</span>
                                <span className="dc__truncate-text">
                                    {element.resource.length > 1
                                        ? element.resource.length + ' objects'
                                        : element.resource[0].label}
                                </span>
                                <span className="dc__truncate-text">{element.action.label}</span>
                                <span>
                                    <Clone
                                        className="icon-dim-16 cursor mr-8"
                                        onClick={() => editPermission(element, 'clone', index)}
                                    />
                                    <Edit
                                        className="icon-dim-16 cursor mr-8"
                                        onClick={() => editPermission(element, 'edit', index)}
                                    />
                                    <Delete className="icon-dim-16 cursor" onClick={() => deletePermission(index)} />
                                </span>
                            </div>
                        )
                    })}
                </div>
            ) : null}
            {togglePermissionModal && (
                <K8sPermissionModal
                    selectedPermissionAction={selectedPermissionAction}
                    k8sPermission={tempPermission}
                    setK8sPermission={setK8sPermission}
                    close={closeModal}
                />
            )}
        </>
    )
}

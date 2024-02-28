import React, { useState } from 'react'
import { ReactComponent as AddIcon } from '../../../../../../assets/icons/ic-add.svg'
import K8sPermissionModal from './K8sPermissionModal'
import { HEADER_OPTIONS } from './K8sPermissions.utils'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { K8sPermissionModalType } from './types'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { K8sPermissionFilter } from '../../../types'
import K8sPermissionRow from './K8sPermissionRow'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const K8sPermissions = () => {
    const { k8sPermission, setK8sPermission, showStatus } = usePermissionConfiguration()

    const [togglePermissionModal, setTogglePermissionModal] = useState<boolean>()
    const [tempPermission, setTempPermission] = useState()
    const [selectedPermissionAction, setSelectedPermissionAction] =
        useState<K8sPermissionModalType['selectedPermissionAction']>()

    const rowClass = `display-grid dc__gap-8 flex-align-center kubernetes-table__row ${showStatus ? 'kubernetes-table__row--with-status' : ''}`

    const editPermission = (permissions, action, index) => {
        setTogglePermissionModal(true)
        setTempPermission(permissions)
        setSelectedPermissionAction({
            action,
            index,
        })
    }

    const createPermission = () => {
        setTogglePermissionModal(true)
        setTempPermission(null)
    }

    const deletePermission = (index) => {
        setK8sPermission(k8sPermission.filter((permission, permissionIndex) => permissionIndex !== index))
    }

    const closeModal = () => {
        setTogglePermissionModal(false)
        setSelectedPermissionAction(null)
    }

    const handleStatusUpdate = (
        status: K8sPermissionFilter['status'],
        timeToLive: K8sPermissionFilter['timeToLive'],
        index: number,
    ) => {
        setK8sPermission(
            k8sPermission.map((permission, permissionIndex) => ({
                ...permission,
                ...(permissionIndex === index && {
                    status,
                    timeToLive,
                }),
            })),
        )
    }

    return (
        <div className="flexbox-col dc__gap-12">
            {k8sPermission?.length > 0 && (
                <div>
                    <div className={`${rowClass} kubernetes-table__header fw-6 fs-12 cn-7 lh-20`}>
                        {HEADER_OPTIONS.map((header) => (
                            <span key={header}>
                                {header === 'STATUS' ? showStatus && <StatusHeaderCell key={header} /> : header}
                            </span>
                        ))}
                    </div>
                    {k8sPermission.map((permission, index) => (
                        <K8sPermissionRow
                            permission={permission}
                            index={index}
                            editPermission={editPermission}
                            deletePermission={deletePermission}
                            handleStatusUpdate={handleStatusUpdate}
                            rowClass={rowClass}
                        />
                    ))}
                </div>
            )}
            <div>
                <button
                    type="button"
                    data-testid="add-k8s-permission-link"
                    className="anchor flex left dc__gap-4 fs-13 lh-20 fw-6 p-0"
                    onClick={createPermission}
                >
                    <AddIcon className="icon-dim-20 fcb-5" />
                    Add Permission
                </button>
            </div>
            {togglePermissionModal && (
                <K8sPermissionModal
                    selectedPermissionAction={selectedPermissionAction}
                    updatedK8sPermission={tempPermission}
                    close={closeModal}
                />
            )}
        </div>
    )
}

export default K8sPermissions

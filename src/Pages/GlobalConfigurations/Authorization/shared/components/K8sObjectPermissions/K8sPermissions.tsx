import React, { useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as AddIcon } from '../../../../../../assets/icons/ic-add.svg'
import K8sPermissionModal from './K8sPermissionModal'
import { ReactComponent as Clone } from '../../../../../../assets/icons/ic-copy.svg'
import { ReactComponent as TrashIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Edit } from '../../../../../../assets/icons/ic-pencil.svg'
import { HEADER_OPTIONS } from './K8sPermissions.utils'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { K8sPermissionModalType } from './types'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { K8sPermissionActionType } from './constants'
import { K8sPermissionFilter } from '../../../types'
import { getIsStatusDropdownDisabled } from '../../../libUtils'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const K8sPermissions = () => {
    const { k8sPermission, setK8sPermission, showStatus, userStatus } = usePermissionConfiguration()

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
        const _k8sPermission = [...k8sPermission]
        _k8sPermission.splice(index, 1)
        setK8sPermission(_k8sPermission)
    }

    const closeModal = () => {
        setTogglePermissionModal(false)
        setSelectedPermissionAction(null)
    }

    const handleStatusUpdate =
        (index: number) => (status: K8sPermissionFilter['status'], timeToLive: K8sPermissionFilter['timeToLive']) => {
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
                    {k8sPermission.map((element, index) => (
                        <div key={element.key} className={`${rowClass} cn-9 fs-13 fw-4 lh-20 dc__border-bottom-n1`}>
                            <span data-testid={`k8s-permission-list-${index}-cluster`} className="dc__truncate-text">
                                {element.cluster.label}
                            </span>
                            <span data-testid={`k8s-permission-list-${index}-group`} className="dc__truncate-text">
                                {element.group.label}
                            </span>
                            <span data-testid={`k8s-permission-list-${index}-kind`} className="dc__truncate-text">
                                {element.kind.label}
                            </span>
                            <span data-testid={`k8s-permission-list-${index}-namespace`} className="dc__truncate-text">
                                {element.namespace.label}
                            </span>
                            <span data-testid={`k8s-permission-list-${index}-resource`} className="dc__truncate-text">
                                {element.resource.length > 1
                                    ? `${element.resource.length} objects`
                                    : element.resource[0].label}
                            </span>
                            <span data-testid={`k8s-permission-list-${index}-action`} className="dc__truncate-text">
                                {element.action?.label}
                            </span>
                            {showStatus && (
                                <span data-testid={`k8s-permission-list-${index}-status`} className="dc__truncate-text">
                                    <UserStatusUpdate
                                        userStatus={element.status}
                                        timeToLive={element.timeToLive}
                                        userEmail=""
                                        handleChange={handleStatusUpdate(index)}
                                        disabled={getIsStatusDropdownDisabled(userStatus)}
                                        showDropdownBorder={false}
                                        breakLinesForTemporaryAccess
                                    />
                                </span>
                            )}
                            <span className="flex right">
                                <Tippy className="default-tt" arrow={false} placement="top" content="Duplicate">
                                    <button
                                        type="button"
                                        className="dc__transparent flex p-4"
                                        onClick={() => editPermission(element, K8sPermissionActionType.clone, index)}
                                        aria-label="Clone permission"
                                    >
                                        <Clone className="icon-dim-16 fcn-6" />
                                    </button>
                                </Tippy>
                                <Tippy className="default-tt" arrow={false} placement="top" content="Edit">
                                    <button
                                        type="button"
                                        className="dc__transparent flex p-4"
                                        onClick={() => editPermission(element, K8sPermissionActionType.edit, index)}
                                        aria-label="Edit permission"
                                    >
                                        <Edit className="icon-dim-16 scn-6" />
                                    </button>
                                </Tippy>
                                <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                                    <button
                                        type="button"
                                        className="dc__transparent flex icon-delete p-4"
                                        onClick={() => deletePermission(index)}
                                        aria-label="Delete permission"
                                    >
                                        <TrashIcon className="scn-6 icon-dim-16" />
                                    </button>
                                </Tippy>
                            </span>
                        </div>
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

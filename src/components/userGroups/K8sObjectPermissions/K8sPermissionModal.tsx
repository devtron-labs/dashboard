import React, { useState } from 'react'
import { K8sPermissionModalType, OptionType } from '../userGroups.types'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import K8sListItemCard from './K8sListItemCard'
import { getPermissionObject } from './K8sPermissions.utils'
import { toast } from 'react-toastify'
import { Drawer, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { useUserGroupContext } from '../UserGroup'

export default function K8sPermissionModal({
    selectedPermissionAction,
    k8sPermission,
    setK8sPermission,
    close,
}: K8sPermissionModalType) {
    const [k8PermissionList, setPermissionList] = useState([getPermissionObject(0, k8sPermission)])
    const [namespaceMapping, setNamespaceMapping] = useState<Record<string, OptionType[]>>()
    const [apiGroupMapping, setApiGroupMapping] = useState<Record<number, OptionType[]>>()
    const [kindMapping, setKindMapping] = useState<Record<number, OptionType[]>>()
    const [objectMapping, setObjectMapping] = useState<Record<number, OptionType[]>>()
    const {customRoles}=useUserGroupContext()

    const handleK8sPermission = (action: string, key?: number, data?: any) => {
        const _k8sPermissionList = [...k8PermissionList]
        switch (action) {
            case 'add':
                _k8sPermissionList.splice(0, 0, getPermissionObject(_k8sPermissionList.length))
                break
            case 'delete':
                _k8sPermissionList.splice(key, 1)
                break
            case 'clone':
                const currentLen = _k8sPermissionList.length
                _k8sPermissionList.splice(0, 0, getPermissionObject(currentLen, _k8sPermissionList[key]))
                setApiGroupMapping((prevMapping) => ({ ...prevMapping, [currentLen]: apiGroupMapping?.[key] }))
                setKindMapping((prevMapping) => ({
                    ...prevMapping,
                    [currentLen]: kindMapping?.[key],
                }))
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [currentLen]: objectMapping?.[key],
                }))
                break
            case 'edit':
                _k8sPermissionList[key].cluster = data
                break
            case 'onClusterChange':
                _k8sPermissionList[key].cluster = data
                _k8sPermissionList[key].namespace = null
                _k8sPermissionList[key].group = null
                _k8sPermissionList[key].kind = null
                _k8sPermissionList[key].resource = null
                break
            case 'onNamespaceChange':
                _k8sPermissionList[key].namespace = data
                _k8sPermissionList[key].group = null
                _k8sPermissionList[key].kind = null
                _k8sPermissionList[key].resource = null
                break
            case 'onApiGroupChange':
                _k8sPermissionList[key].group = data
                _k8sPermissionList[key].kind = null
                _k8sPermissionList[key].resource = null
                break
            case 'onKindChange':
                _k8sPermissionList[key].kind = data
                _k8sPermissionList[key].resource = null
                break
            case 'onObjectChange':
                _k8sPermissionList[key].resource = data
                break
            case 'onRoleChange':
                _k8sPermissionList[key].action = data
                break
            default:
                break
        }
        setPermissionList(_k8sPermissionList)
    }

    const addNewPermissionCard = () => {
        handleK8sPermission('add')
    }

    const savePermission = () => {
        let isPermissionValid = k8PermissionList.reduce((valid, permission) => {
            valid = valid && !!permission.resource?.length
            return valid
        }, true)

        if (isPermissionValid) {
            setK8sPermission((prev) => {
                if (selectedPermissionAction?.action === 'edit') {
                    if (k8PermissionList?.length) {
                        prev[selectedPermissionAction.index] = k8PermissionList[k8PermissionList.length - 1]
                        return [...prev]
                    } else {
                        const list = [...prev]
                        list.splice(selectedPermissionAction.index, 1)
                        return list
                    }
                } else if (selectedPermissionAction?.action === 'clone' && !k8PermissionList?.length) {
                    return [...prev]
                }
                return [...prev, ...k8PermissionList]
            })
            close()
        } else {
            toast.error('Some required inputs are not selected')
        }
    }

    return (
        <Drawer onEscape={close} position="right" width="800px">
            <div onClick={stopPropagation} className="h-100 dc__overflow-hidden">
                <div className="flex pt-12 pb-12 pl-20 pr-20 dc__content-space bcn-0 dc__border-bottom">
                    <span className="flex left fw-6 lh-24 fs-16">Kubernetes resource permission</span>
                    <span className="icon-dim-20 cursor" data-testid="k8s-permission-drawer-close" onClick={close}>
                        <Close />
                    </span>
                </div>
                <div className="p-20 fs-13 dc__overflow-scroll dc__cluster-modal">
                    {!selectedPermissionAction && (
                        <div className="flex left fs-13 fw-6">
                            <span className="flex cb-5 cursor" onClick={addNewPermissionCard}>
                                <AddIcon className="add-svg fcb-5 mr-12" />
                                Add another
                            </span>
                        </div>
                    )}
                    {k8PermissionList?.map((_k8sPermission, index) => {
                        return (
                            <K8sListItemCard
                                k8sPermission={_k8sPermission}
                                handleK8sPermission={handleK8sPermission}
                                index={index}
                                namespaceMapping={namespaceMapping}
                                setNamespaceMapping={setNamespaceMapping}
                                apiGroupMapping={apiGroupMapping}
                                setApiGroupMapping={setApiGroupMapping}
                                kindMapping={kindMapping}
                                setKindMapping={setKindMapping}
                                objectMapping={objectMapping}
                                setObjectMapping={setObjectMapping}
                                selectedPermissionAction={selectedPermissionAction}
                                customRoles={customRoles}                              
                            />
                        )
                    })}
                </div>
                <div className="w-100 pt-16 pb-16 pl-20 pr-20 flex right bcn-0 dc__border-top">
                    <button
                        type="button"
                        data-testid="k8s-permission-cancel"
                        className="cta cancel h-36 flex mr-16"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="k8s-permission-save"
                        className="cta h-36 flex"
                        onClick={savePermission}
                    >
                        Done
                    </button>
                </div>
            </div>
        </Drawer>
    )
}

import React, { useEffect, useState } from 'react'
import { ButtonWithLoader, VisibleModal } from '../../common'
import { ActionTypes, OptionType } from '../userGroups.types'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ReactComponent as AddIcon } from '../../../assets/icons/ic-add.svg'
import K8sListItemCard from './K8sListItemCard'

const getEmptyPermissionObject = (idx = 0, k8sPermission = null) => {
    return {
        key: idx,
        cluster: k8sPermission?.cluster,
        namespace: k8sPermission?.namespace,
        group: k8sPermission?.group,
        kind: k8sPermission?.kind,
        resource: k8sPermission?.resource,
        action: k8sPermission?.action || {value: ActionTypes.VIEW, label: ActionTypes.VIEW},
    }
}

export default function K8sPermissionModal({ k8sPermission, setK8sPermission, close }) {
    const [k8PermissionList, setPermissionList] = useState([getEmptyPermissionObject(0,k8sPermission)])
    const [namespaceMapping, setNamespaceMapping] = useState<Record<number, OptionType[]>>()
    const [apiGroupMapping, setApiGroupMapping] = useState<Record<number, OptionType[]>>()
    const [kindMapping, setKindMapping] = useState<Record<number, OptionType[]>>()
    const [objectMapping, setObjectMapping] = useState<Record<number, OptionType[]>>()
    const [isDataFilled, setIsDataFilled] = useState<boolean>(true)

    useEffect(() => { 
        const disbale = k8PermissionList ? k8PermissionList.find((item) => item.resource === null || item.resource?.length === 0) : true
        setIsDataFilled(!!disbale)
    },[k8PermissionList])

    const handleK8sPermission = (action: string, key?: number, data?: any) => {
        switch (action) {
            case 'add':
                k8PermissionList.splice(0, 0, getEmptyPermissionObject(k8PermissionList.length))
                break
            case 'delete':
                k8PermissionList.splice(key, 1)
                break
            case 'clone':
                k8PermissionList.splice(0, 0, {...k8PermissionList[key],key: k8PermissionList.length})
                break
            case 'edit':
                k8PermissionList[key].cluster = data
                break
            case 'onClusterChange':
                k8PermissionList[key].cluster = data
                k8PermissionList[key].namespace = null
                k8PermissionList[key].group = null
                k8PermissionList[key].kind = null
                k8PermissionList[key].resource = null
                break
            case 'onNamespaceChange':
                k8PermissionList[key].namespace = data
                k8PermissionList[key].group = null
                k8PermissionList[key].kind = null
                k8PermissionList[key].resource = null
                break
            case 'onApiGroupChange':
                k8PermissionList[key].group = data
                k8PermissionList[key].kind = null
                k8PermissionList[key].resource = null
                break
            case 'onKindChange':
                k8PermissionList[key].kind = data
                k8PermissionList[key].resource = null
                break
            case 'onObjectChange':
                k8PermissionList[key].resource = data
                break
            case 'onRoleChange':
                k8PermissionList[key].action = data
                break
            default:
                break
        }

        setPermissionList([...k8PermissionList])
    }

    const stopPropogation = (e) => {
        e.stopPropagation()
    }

    const closeModal = () => {
        close(false)
    }

    const addNewPermissionCard = () => {
        handleK8sPermission('add')
    }

    const savePermission = () => {
        setK8sPermission((prev) => [...prev,...k8PermissionList])
        close(false)
    }

    return (
        <VisibleModal className="" close={closeModal}>
            <div onClick={stopPropogation} className="modal-body--ci-material h-100 dc__overflow-hidden">
                <div className="flex pt-12 pb-12 pl-20 pr-20 dc__content-space dc__border-bottom">
                    <span className="flex left fw-6 lh-24 fs-16">Kubernetes object permission</span>
                    <span className="icon-dim-20 cursor" onClick={closeModal}>
                        <Close />
                    </span>
                </div>
                <div className="p-20 fs-13 dc__overflow-scroll dc__cluster-modal">
                    <div className="anchor pointer flex left fs-13 fw-6" onClick={addNewPermissionCard}>
                        <AddIcon className="add-svg mr-12" /> Add another
                    </div>
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
                            />
                        )
                    })}
                </div>
                <div className="w-100 pt-16 pb-16 pl-20 pr-20 flex right dc__border-top">
                    <button type="button" className="cta cancel h-36 flex mr-16" disabled={false} onClick={closeModal}>
                        Cancel
                    </button>
                    <ButtonWithLoader
                        rootClassName="cta cta--workflow"
                        onClick={savePermission}
                        disabled={isDataFilled}
                        isLoading={false}
                        loaderColor="white"
                    >
                        Save
                    </ButtonWithLoader>
                </div>
            </div>
        </VisibleModal>
    )
}


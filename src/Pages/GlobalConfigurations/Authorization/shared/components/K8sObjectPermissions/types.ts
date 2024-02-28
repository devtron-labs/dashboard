import { OptionType } from '@devtron-labs/devtron-fe-common-lib'
import { K8sPermissionFilter } from '../../../types'
import { K8sPermissionActionType } from './constants'

export interface K8sListItemCardType {
    k8sPermission: K8sPermissionFilter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleK8sPermission: (action: K8sPermissionActionType, key?: number, data?: any) => void
    index: number
    namespaceMapping: Record<string, OptionType[]>
    setNamespaceMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    apiGroupMapping: Record<number, OptionType[]>
    setApiGroupMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    kindMapping: Record<number, OptionType[]>
    setKindMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    objectMapping: Record<number, OptionType[]>
    setObjectMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    selectedPermissionAction: {
        action: K8sPermissionActionType
        index: number
    }
}

export interface K8sItemCardLoadingState {
    isClusterListLoading: boolean
    isNamespaceListLoading: boolean
    isApiGroupListLoading: boolean
    isResourceListLoading: boolean
}

export interface K8sPermissionModalType {
    selectedPermissionAction: {
        // TODO: Review: should be clone, edit, delete and add probably
        action: K8sPermissionActionType
        index: number
    }
    updatedK8sPermission: K8sPermissionFilter
    close: () => void
}

export interface K8sPermissionRowProps {
    permission: K8sPermissionFilter
    index: number
    rowClass: string
    handleStatusUpdate: (
        status: K8sPermissionFilter['status'],
        timeToLive: K8sPermissionFilter['timeToLive'],
        index: number,
    ) => void
    editPermission: (permission: K8sPermissionFilter, action: K8sPermissionActionType, index: number) => void
    deletePermission: (index: number) => void
}

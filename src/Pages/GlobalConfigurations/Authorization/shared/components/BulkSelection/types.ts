import { UserListSortableKeys, UserStatus, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { MutableRefObject } from 'react'
import { SortableKeys } from '../../../PermissionGroups/List/constants'
import { PermissionGroup, User } from '../../../types'
import { UserListFilter } from '../../../UserPermissions/List/types'
import { BulkSelectionEntityTypes, BulkSelectionModalTypes } from './constants'

export type BulkSelectionState = Record<User['id'] | PermissionGroup['id'], boolean>

export type BulkSelectionModalConfig = {
    type: BulkSelectionModalTypes
    onSuccess?: () => void
    onCancel?: () => void
} | null

export interface BulkSelectionActionWidgetProps {
    parentRef: MutableRefObject<HTMLDivElement>
    count: number
    areActionsDisabled: boolean
    filterConfig: {
        searchKey: string
        // Only for users
        status?: UserStatus[]
    }
    selectedIdentifiersCount: number
    isCountApproximate?: boolean
    setBulkSelectionModalConfig: (config: BulkSelectionModalConfig) => void
    refetchList: () => void
    showStatus: boolean
    entityType: BulkSelectionEntityTypes
}

export type BulkSelectionModalProps = BulkSelectionModalConfig &
    Pick<BulkSelectionActionWidgetProps, 'refetchList' | 'setBulkSelectionModalConfig' | 'selectedIdentifiersCount'> &
    (
        | {
              urlFilters: UseUrlFiltersReturnType<UserListSortableKeys, UserListFilter>
              entityType: BulkSelectionEntityTypes.users
          }
        | {
              urlFilters: UseUrlFiltersReturnType<SortableKeys>
              entityType: BulkSelectionEntityTypes.permissionGroups
          }
    )

export interface BulkSelectionClearConfirmationModalProps {
    type: BulkSelectionModalTypes.clearAllAcrossPages | BulkSelectionModalTypes.selectAllAcrossPages
    onClose: () => void
    onSubmit: () => void
}

export interface BulkDeleteModalProps
    extends Pick<BulkSelectionModalProps, 'refetchList' | 'urlFilters' | 'entityType'>,
        Pick<BulkSelectionActionWidgetProps, 'selectedIdentifiersCount'> {
    onClose: () => void
}

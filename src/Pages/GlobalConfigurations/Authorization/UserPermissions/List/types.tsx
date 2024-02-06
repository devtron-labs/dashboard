import { SearchBarProps, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { MutableRefObject } from 'react'
import { getUserList } from '../../authorization.service'
import { User } from '../../types'
import { SortableKeys } from './constants'

export interface UserPermissionRowProps extends User {
    index: number
    showStatus: boolean
    refetchUserPermissionList: () => void
    isChecked: boolean
    toggleChecked: (id: User['id']) => void
    showCheckbox: boolean
}

export interface UserPermissionListHeaderProps {
    disabled: boolean
    showStatus: boolean
    handleSearch: SearchBarProps['handleEnter']
    initialSearchText: SearchBarProps['initialSearchText']
    getDataToExport: () => ReturnType<typeof getUserList>
}

export enum BulkSelectionModalTypes {
    deleteConfirmation = 'deleteConfirmation',
    selectAllAcrossPages = 'selectAllAcrossPages',
    clearAllAcrossPages = 'clearAllAcrossPages',
}

export type BulkSelectionModalConfig = {
    type: BulkSelectionModalTypes
    onSuccess?: () => void
    onCancel?: () => void
} | null

export interface UserPermissionContainerProps {
    showStatus: boolean
    error: any
    getUserDataForExport: UserPermissionListHeaderProps['getDataToExport']
    showLoadingState: boolean
    totalCount: number
    users: User[]
    refetchUserPermissionList: UserPermissionRowProps['refetchUserPermissionList']
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
    bulkSelectionModalConfig: BulkSelectionModalConfig
    setBulkSelectionModalConfig: (config: BulkSelectionModalConfig) => void
}

export interface UserPermissionTableProps
    extends Pick<
        UserPermissionContainerProps,
        'showStatus' | 'urlFilters' | 'users' | 'totalCount' | 'refetchUserPermissionList'
    > {
    isLoading: boolean
    showPagination: boolean
    isActionsDisabled: boolean
}

export interface BulkSelectionActionWidgetProps
    extends Pick<
        UserPermissionContainerProps,
        'showStatus' | 'setBulkSelectionModalConfig' | 'refetchUserPermissionList'
    > {
    parentRef: MutableRefObject<HTMLDivElement>
    count: number
    areActionsDisabled: boolean
    // TODO: Something better
    filterConfig: {
        searchKey: string
    }
    selectedUsersCount: number
}

export interface BulkSelectionClearConfirmationModalProps {
    type: BulkSelectionModalTypes.clearAllAcrossPages | BulkSelectionModalTypes.selectAllAcrossPages
    onClose: () => void
    onSubmit: () => void
}

export interface BulkUserDeleteModalProps
    extends Pick<UserPermissionContainerProps, 'refetchUserPermissionList' | 'urlFilters'> {
    selectedUsersCount: number
    onClose: () => void
}

export interface BulkSelectionModalProps
    extends BulkSelectionModalConfig,
        Pick<UserPermissionContainerProps, 'refetchUserPermissionList' | 'urlFilters' | 'setBulkSelectionModalConfig'> {
    selectedUsersCount: number
}

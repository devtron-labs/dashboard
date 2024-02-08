import { SearchBarProps, ServerError, UserStatus, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { getUserList } from '../../authorization.service'
import { BulkSelectionActionWidgetProps, BulkSelectionModalConfig } from '../../shared/components/BulkSelection'
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
    statuses: UserStatus[]
    handleStatusFilterChange: (statuses: UserStatus[]) => void
}

export interface UserPermissionContainerProps
    extends Pick<BulkSelectionActionWidgetProps, 'setBulkSelectionModalConfig'> {
    showStatus: boolean
    error: ServerError
    getUserDataForExport: UserPermissionListHeaderProps['getDataToExport']
    showLoadingState: boolean
    totalCount: number
    users: User[]
    refetchUserPermissionList: UserPermissionRowProps['refetchUserPermissionList']
    urlFilters: UseUrlFiltersReturnType<SortableKeys> & {
        statuses: UserPermissionListHeaderProps['statuses']
        updateStatuses: UserPermissionListHeaderProps['handleStatusFilterChange']
    }
    bulkSelectionModalConfig: BulkSelectionModalConfig
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

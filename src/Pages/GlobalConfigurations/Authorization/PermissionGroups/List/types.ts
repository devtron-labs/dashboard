import { SearchBarProps, ServerError, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { getPermissionGroupList } from '../../authorization.service'
import { BulkSelectionModalConfig } from '../../shared/components/BulkSelection'
import { PermissionGroup } from '../../types'
import { SortableKeys } from './constants'

export interface PermissionGroupRowProps extends PermissionGroup {
    index: number
    refetchPermissionGroupList: () => void
    isChecked: boolean
    toggleChecked: (id: PermissionGroup['id']) => void
    showCheckbox: boolean
}

export interface PermissionGroupListHeaderProps {
    disabled: boolean
    handleSearch: SearchBarProps['handleEnter']
    initialSearchText: SearchBarProps['initialSearchText']
    getDataToExport: () => ReturnType<typeof getPermissionGroupList>
}

export interface PermissionGroupContainerProps {
    error: ServerError
    getPermissionGroupDataForExport: PermissionGroupListHeaderProps['getDataToExport']
    showLoadingState: boolean
    totalCount: number
    permissionGroups: PermissionGroup[]
    refetchPermissionGroupList: PermissionGroupRowProps['refetchPermissionGroupList']
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
    bulkSelectionModalConfig: BulkSelectionModalConfig
    setBulkSelectionModalConfig: (config: BulkSelectionModalConfig) => void
}

export interface UserPermissionTableProps
    extends Pick<
        PermissionGroupContainerProps,
        'urlFilters' | 'permissionGroups' | 'totalCount' | 'refetchPermissionGroupList'
    > {
    isLoading: boolean
    showPagination: boolean
    isActionsDisabled: boolean
}

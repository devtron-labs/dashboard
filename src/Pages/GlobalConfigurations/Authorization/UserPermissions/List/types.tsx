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

export interface UserPermissionTableProps {
    showStatus: boolean
    error: any
    getUserDataForExport: UserPermissionListHeaderProps['getDataToExport']
    showLoadingState: boolean
    totalCount: number
    users: User[]
    refetchUserPermissionList: UserPermissionRowProps['refetchUserPermissionList']
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
}

export interface BulkSelectionActionWidgetProps
    extends Pick<UserPermissionTableProps, 'urlFilters' | 'showStatus' | 'refetchUserPermissionList'> {
    parentRef: MutableRefObject<HTMLDivElement>
    count: number
}

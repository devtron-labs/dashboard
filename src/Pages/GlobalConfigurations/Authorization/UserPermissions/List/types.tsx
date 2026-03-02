/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dispatch, SetStateAction } from 'react'

import {
    SearchBarProps,
    SelectPickerOptionType,
    ServerError,
    UserListFilterParams,
    UserListSortableKeys,
    UserStatus,
    UserTypeToFetchType,
    UseUrlFiltersReturnType,
} from '@devtron-labs/devtron-fe-common-lib'

import { getUserList } from '../../authorization.service'
import { BulkSelectionActionWidgetProps, BulkSelectionModalConfig } from '../../Shared/components/BulkSelection'
import { User } from '../../types'

export type UserListFilter = Pick<UserListFilterParams, 'status'>

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
    getDataToExport: (
        selectedConfig: Record<UserTypeToFetchType, boolean>,
        signal: AbortSignal,
    ) => ReturnType<typeof getUserList>
    status: UserStatus[]
    handleStatusFilterChange: (status: UserStatus[]) => void
}

export interface UserPermissionContainerProps extends Pick<
    BulkSelectionActionWidgetProps,
    'setBulkSelectionModalConfig'
> {
    showStatus: boolean
    error: ServerError
    getUserDataForExport: UserPermissionListHeaderProps['getDataToExport']
    showLoadingState: boolean
    totalCount: number
    users: User[]
    refetchUserPermissionList: UserPermissionRowProps['refetchUserPermissionList']
    urlFilters: UseUrlFiltersReturnType<UserListSortableKeys, UserListFilter> & {
        updateStatusFilter: (status: UserStatus[]) => void
    }
    bulkSelectionModalConfig: BulkSelectionModalConfig
}

export interface UserPermissionTableProps extends Pick<
    UserPermissionContainerProps,
    'showStatus' | 'urlFilters' | 'users' | 'totalCount' | 'refetchUserPermissionList'
> {
    isLoading: boolean
    showPagination: boolean
    isActionsDisabled: boolean
}

export interface ExportUserPermissionCSVDataType {
    emailId: string
    userId: number
    status?: string
    isDeleted?: boolean
    lastLoginTime: string
    superAdmin: boolean
    group: string
    project: string
    environment: string
    application: string
    role: string
    permissionStatus?: string
    createdOn?: string
    updatedOn?: string
    deletedOn?: string
}

export interface ExportConfigurationDialogProps {
    selectedConfig: Record<UserTypeToFetchType, boolean>
    setSelectedConfig: Dispatch<SetStateAction<Record<UserTypeToFetchType, boolean>>>
    initialConfig: Record<UserTypeToFetchType, boolean>
    exportConfiguration: {
        title: string
        options: SelectPickerOptionType<UserTypeToFetchType>[]
    }
    proceed: (shouldProceed: boolean) => void
}

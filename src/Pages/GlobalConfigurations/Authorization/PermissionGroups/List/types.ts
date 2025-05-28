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

import { SearchBarProps, ServerError, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'

import { getPermissionGroupList } from '../../authorization.service'
import { BulkSelectionModalConfig } from '../../Shared/components/BulkSelection'
import { PermissionGroup } from '../../types'
import { SortableKeys } from './constants'

export interface PermissionGroupRowProps extends Omit<PermissionGroup, 'superAdmin'> {
    index: number
    refetchPermissionGroupList: () => void
    isChecked: boolean
    toggleChecked: (id: PermissionGroup['id']) => void
    showCheckbox: boolean
    hasSuperAdminPermission: boolean
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

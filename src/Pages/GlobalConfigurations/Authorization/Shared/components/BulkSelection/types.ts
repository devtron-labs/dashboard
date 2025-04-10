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

import { MutableRefObject } from 'react'

import { UserListSortableKeys, UserStatus, UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'

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

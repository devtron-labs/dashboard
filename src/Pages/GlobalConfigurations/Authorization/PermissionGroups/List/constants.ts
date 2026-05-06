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

import { ExportToCsvProps } from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../../config'
import { PermissionGroup } from '../../types'
import { ExportPermissionGroupDataType } from './types'

export const permissionGroupLoading: PermissionGroup[] = Array.from(
    Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys(),
).map((index) => ({
    id: index,
    name: '',
    roleFilters: [],
    superAdmin: false,
}))

export enum SortableKeys {
    name = 'name',
}

export const GROUP_EXPORT_HEADERS: ExportToCsvProps<keyof ExportPermissionGroupDataType>['headers'] = [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Group ID', key: 'groupId' },
    { label: 'Description', key: 'description' },
    { label: 'Super admin', key: 'superAdmin' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
]

export const GROUP_EXPORT_HEADER_ROW = {
    groupName: 'Group Name',
    groupId: 'Group ID',
    description: 'Description',
    superAdmin: 'Super admin',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
}

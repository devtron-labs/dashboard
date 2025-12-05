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

import { DefaultUserKey, ExportToCsvProps } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../../config'
import { getDefaultUserStatusAndTimeout } from '../../libUtils'
import { User } from '../../types'
import { ExportUserPermissionCSVDataType } from './types'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

export const userListLoading: User[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map((index) => ({
    id: index,
    emailId: '',
    roleFilters: [],
    userRoleGroups: [],
    userGroups: [],
    superAdmin: false,
    createdOn: '',
    updatedOn: '',
    isDeleted: false,
    ...getDefaultUserStatusAndTimeout(),
}))

export const DEFAULT_USER_TOOLTIP_CONTENT: Record<DefaultUserKey, string> = {
    [DefaultUserKey.admin]:
        'Actions performed by the administrator user are logged under the ‘admin’ user for auditing.',
    [DefaultUserKey.system]: 'Automated actions performed in Devtron are logged under the ‘system’ user for auditing.',
}

export const USER_EXPORT_HEADERS: ExportToCsvProps<keyof ExportUserPermissionCSVDataType>['headers'] = [
    { label: 'Email address', key: 'emailId' },
    { label: 'User ID', key: 'userId' },
    ...(showStatus
        ? ([
              { label: 'User status', key: 'status' },
              { label: 'Deleted', key: 'isDeleted' },
          ] satisfies ExportToCsvProps<keyof ExportUserPermissionCSVDataType>['headers'])
        : []),
    { label: 'Last login time', key: 'lastLoginTime' },
    { label: 'Super admin', key: 'superAdmin' },
    { label: 'Group permissions', key: 'group' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
    ...(showStatus
        ? ([
              { label: 'Permission Status', key: 'permissionStatus' },
              { label: 'Added on', key: 'createdOn' },
              { label: 'Updated on', key: 'updatedOn' },
              { label: 'Deleted on', key: 'deletedOn' },
          ] satisfies ExportToCsvProps<keyof ExportUserPermissionCSVDataType>['headers'])
        : []),
]

export const USER_EXPORT_HEADER_ROW = {
    emailId: 'Email address',
    userId: 'User ID',
    ...(showStatus
        ? {
              status: 'User status',
              isDeleted: 'Deleted',
          }
        : {}),
    lastLoginTime: 'Last login time',
    superAdmin: 'Super admin',
    group: 'Group permissions',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
    ...(showStatus
        ? {
              permissionStatus: 'Permission Status',
              createdOn: 'Added on',
              updatedOn: 'Updated on',
              deletedOn: 'Deleted on',
          }
        : {}),
}

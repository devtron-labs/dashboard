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

import { ACCESS_TYPE_MAP, ActionTypes, EntityTypes, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { SELECT_ALL_VALUE } from '../../../../../../config'
import { getDefaultStatusAndTimeout } from '../../../libUtils'
import { DirectPermissionsRoleFilter } from '../../../types'

export const ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE = '#'

export const allApplicationsOption = ({ entity, team }: DirectPermissionsRoleFilter): SelectPickerOptionType => ({
    label: entity === EntityTypes.JOB ? 'All Jobs' : 'All applications',
    value: SELECT_ALL_VALUE,
    description: `All existing and future ${entity === EntityTypes.JOB ? 'jobs' : 'applications'} in '${team?.label}'`,
})

export const SELECT_ALL_OPTION = {
    label: 'Select all',
    value: SELECT_ALL_VALUE,
} as const

export const ALL_ENVIRONMENTS_OPTION = {
    label: 'All environments',
    value: SELECT_ALL_VALUE,
    description: 'All existing and future environments',
} as const

export const emptyDirectPermissionDevtronApps: DirectPermissionsRoleFilter = {
    entity: EntityTypes.DIRECT,
    entityName: [],
    environment: [],
    team: null,
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
    roleConfig: {
        baseRole: ActionTypes.VIEW,
        additionalRoles: new Set(),
        accessManagerRoles: new Set(),
    },
    ...getDefaultStatusAndTimeout(),
}

export const emptyDirectPermissionHelmApps = {
    ...emptyDirectPermissionDevtronApps,
    accessType: ACCESS_TYPE_MAP.HELM_APPS,
}

export const emptyDirectPermissionJobs: DirectPermissionsRoleFilter = {
    ...emptyDirectPermissionDevtronApps,
    accessType: ACCESS_TYPE_MAP.JOBS,
    workflow: [],
    entity: EntityTypes.JOB,
}

export enum DirectPermissionFieldName {
    apps = 'entityName/apps',
    jobs = 'entityName/jobs',
    environment = 'environment',
    workflow = 'workflow',
    team = 'team',
    status = 'status',
}

export const SELECT_ROLES_PLACEHOLDER = 'Select roles'

export const ACCESS_ROLE_OPTIONS_CONTAINER_ID = 'access-role-options'

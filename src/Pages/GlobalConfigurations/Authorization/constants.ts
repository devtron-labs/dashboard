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

import { getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'
import { SELECT_ALL_VALUE } from '../../../config'
import { APIRoleFilter } from './types'
import { getDefaultStatusAndTimeout } from './libUtils'
import { importComponentFromFELibrary } from '../../../components/common'
import { groupHeaderStyle } from '../../../components/v2/common/ReactSelect.utils'

/**
 * Permission types for users and permission groups
 */
export enum PermissionType {
    SUPER_ADMIN = 'SUPER_ADMIN',
    SPECIFIC = 'SPECIFIC',
}

export const PERMISSION_TYPE_LABEL_MAP: Record<PermissionType, string> = {
    [PermissionType.SPECIFIC]: 'Specific permissions',
    [PermissionType.SUPER_ADMIN]: 'Super admin permission',
} as const

export enum EntityTypes {
    CHART_GROUP = 'chart-group',
    DIRECT = 'apps',
    JOB = 'jobs',
    DOCKER = 'docker',
    GIT = 'git',
    CLUSTER = 'cluster',
    NOTIFICATION = 'notification',
}

export enum ActionTypes {
    MANAGER = 'manager',
    ADMIN = 'admin',
    TRIGGER = 'trigger',
    VIEW = 'view',
    UPDATE = 'update',
    EDIT = 'edit',
    APPROVER = 'approver',
}

export const ACTION_LABEL = {
    [ActionTypes.ADMIN]: 'Admin',
    [ActionTypes.VIEW]: 'View',
    [ActionTypes.MANAGER]: 'Manager',
}

export enum UserRoleType {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    Manager = 'Manager',
    Trigger = 'Trigger',
    View = 'View',
}

export const ALL_NAMESPACE = { label: 'All Namespaces / Cluster scoped', value: SELECT_ALL_VALUE }

export const ViewChartGroupPermission: APIRoleFilter = {
    entity: EntityTypes.CHART_GROUP,
    action: ActionTypes.VIEW,
    ...getDefaultStatusAndTimeout(),
}

const _selectStyles = getCommonSelectStyle()

export const authorizationSelectStyles = {
    ..._selectStyles,
    ...groupHeaderStyle,
    control: (base, state) => ({
        ..._selectStyles.control(base, state),
        height: '36px',
    }),
    valueContainer: (base) => ({
        ..._selectStyles.valueContainer(base),
        maxHeight: '100%',
    }),
    option: (base, state) => ({
        ..._selectStyles.option(base, state),
        ...(state.isSelected && {
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
    }),
}

export const IMAGE_APPROVER_ACTION = importComponentFromFELibrary('IMAGE_APPROVER_ACTION', {}, 'function')
export const CONFIG_APPROVER_ACTION = importComponentFromFELibrary('CONFIG_APPROVER_ACTION', {}, 'function')
export const ARTIFACT_PROMOTER_ACTION = importComponentFromFELibrary('ARTIFACT_PROMOTER_ACTION', {}, 'function')
export const TERMINAL_EXEC_ACTION = importComponentFromFELibrary('TERMINAL_EXEC_ACTION', {}, 'function')

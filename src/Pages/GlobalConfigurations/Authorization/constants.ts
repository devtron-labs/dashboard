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

import { EntityTypes, ACCESS_TYPE_MAP } from '@devtron-labs/devtron-fe-common-lib'
import { SELECT_ALL_VALUE } from '../../../config'
import { APIRoleFilter } from './types'
import { getDefaultStatusAndTimeout } from './libUtils'
import { AccessTypeToErrorMapType } from './Shared/components/PermissionConfigurationForm/types'

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

export const DEFAULT_ACCESS_TYPE_TO_ERROR_MAP: AccessTypeToErrorMapType = {
    [ACCESS_TYPE_MAP.DEVTRON_APPS]: false,
    [ACCESS_TYPE_MAP.HELM_APPS]: false,
    [ACCESS_TYPE_MAP.JOBS]: false,
} as const

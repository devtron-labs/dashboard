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

import { ReactNode } from 'react'

import {
    ACCESS_TYPE_MAP,
    ActionTypes,
    APIOptions,
    BaseFilterQueryParams,
    CustomRoleAndMeta,
    DeleteConfirmationModalProps,
    EntityTypes,
    K8sResourceListPayloadType,
    OptionType,
    ResourceKindType,
    UserGroupDTO,
    UserGroupType,
    UserListFilterParams,
    UserRoleConfig,
    UserRoleGroup,
    UserStatus,
    UserStatusDto,
} from '@devtron-labs/devtron-fe-common-lib'

import { SERVER_MODE } from '../../../config'
import { TokenResponseType } from './APITokens/apiToken.type'
import { PermissionType, UserRoleType } from './constants'

export interface UserAndGroupPermissionsWrapProps {
    children: ReactNode
    /**
     * Handler for updating the flag in the parent's state
     */
    setIsAutoAssignFlowEnabled: (isAutoAssignFlowEnabled: boolean) => void
}

type PermissionStatusAndTimeout = Pick<UserRoleGroup, 'status' | 'timeToLive'>

export interface APIRoleFilterDto {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER | EntityTypes.JOB
    team?: string
    entityName?: string
    environment?: string
    action: string
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    /**
     * denotes if the user has deploymentApprover role
     */
    approver?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cluster?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    namespace?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kind?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resource?: any
    workflow?: string
    status: UserStatusDto
    timeoutWindowExpression: string
    /**
     * Allowed roles which an access manager can give
     * Used only for accessManagerFilters
     */
    subAction?: string
}

export type APIRoleFilter = Omit<APIRoleFilterDto, 'status' | 'timeoutWindowExpression'> & PermissionStatusAndTimeout

// Permission Groups
export interface PermissionGroupDto extends Pick<UserRoleGroup, 'id' | 'name' | 'description'> {
    /**
     * Role filters (direct permissions) for the permission group
     */
    roleFilters: APIRoleFilterDto[]
    /**
     * Access Role filters (access manager permissions) for the user
     */
    accessRoleFilters?: APIRoleFilterDto[]
    /**
     * If true, the group has super admin access
     */
    superAdmin: boolean
    /**
     * permission group manage all access
     */
    canManageAllAccess?: boolean
    /**
     * permission group has some or all access manager permission
     */
    hasAccessManagerPermission?: boolean
}

export type PermissionGroup = Omit<PermissionGroupDto, 'roleFilters'> & {
    roleFilters: APIRoleFilter[]
}

export type PermissionGroupCreateOrUpdatePayload = Pick<
    PermissionGroup,
    'id' | 'name' | 'description' | 'roleFilters' | 'superAdmin' | 'accessRoleFilters' | 'canManageAllAccess'
>

// User Permissions
export interface UserDto
    extends Pick<PermissionGroupDto, 'roleFilters' | 'accessRoleFilters' | 'superAdmin' | 'canManageAllAccess'> {
    /**
     * ID of the user
     */
    id: number
    /**
     * Email of the user
     */
    email_id: string
    /**
     * Status of the user
     *
     * @default 'active'
     */
    userStatus?: UserStatusDto
    /**
     * Last login time of the user
     *
     * @default ''
     */
    lastLoginTime?: string
    /**
     * Expression for the time until which the user is active
     * Note: Only a user with status 'active' can have 'timeoutWindowExpression'
     *
     * @default ''
     */
    timeoutWindowExpression?: string
    /**
     * List of permission groups assigned to the user
     */
    userRoleGroups?: {
        roleGroup: Pick<UserRoleGroup, 'id' | 'name' | 'description'>
        status?: UserStatusDto
        timeoutWindowExpression?: string
    }[]
    userGroups: UserGroupDTO[]
    /**
     * Denotes the time when the user was created
     *
     * Note: Enterprise only
     */
    createdOn: string
    /**
     * Denotes the time when the user was last updated
     *
     * Note: Enterprise only
     */
    updatedOn: string
    /**
     * Denotes is the user is deleted
     *
     * Note: Enterprise only
     */
    isDeleted: boolean
}

export interface User
    extends Omit<
        UserDto,
        | 'timeoutWindowExpression'
        | 'email_id'
        | 'userStatus'
        | 'userRoleGroups'
        | 'roleFilters'
        | 'accessRoleFilters'
        | 'userGroups'
    > {
    emailId: UserDto['email_id']
    /**
     * Time until which the user is active
     * Note: Only a user with status 'active' can have 'timeToLive'
     *
     * @default ''
     */
    timeToLive: string
    userStatus: UserStatus
    userRoleGroups: UserRoleGroup[]
    roleFilters: APIRoleFilter[]
    userGroups: UserGroupType[]
}

export type UserCreateOrUpdateParamsType = Pick<
    User,
    | 'id'
    | 'emailId'
    | 'userStatus'
    | 'roleFilters'
    | 'superAdmin'
    | 'timeToLive'
    | 'userRoleGroups'
    | 'canManageAllAccess'
> & {
    userGroups: Pick<UserGroupType, 'name' | 'userGroupId'>[]
} & Pick<UserDto, 'accessRoleFilters'>

export interface UserCreateOrUpdatePayloadType
    extends Omit<UserDto, 'userGroups' | 'createdOn' | 'updatedOn' | 'isDeleted'> {
    userGroups: Pick<UserGroupDTO, 'identifier'>[]
}

// Others
export interface UserRole {
    /**
     * List of roles for the user
     */
    roles: string[]
    /**
     * If true, the user has super admin role
     * @note If false, this key won't be present
     */
    superAdmin?: boolean
    /**
     * Role of the user
     * @note This key is present only when superAdmin is false
     */
    role?: UserRoleType
}

export type UserBulkDeletePayload =
    | {
          ids: User['id'][]
      }
    | {
          filterConfig: Pick<UserListFilterParams, 'searchKey' | 'status'>
      }

export type PermissionGroupBulkDeletePayload =
    | {
          ids: PermissionGroup['id'][]
      }
    | {
          filterConfig: Pick<BaseFilterQueryParams<unknown>, 'searchKey'>
      }

export interface AuthorizationContextProps {
    customRoles: CustomRoleAndMeta
    isAutoAssignFlowEnabled: boolean
    authorizationContainerRef: React.RefObject<HTMLDivElement>
}

export interface AuthorizationProviderProps {
    children: ReactNode
    value: AuthorizationContextProps
}

export type ActionRoleType = ActionTypes.MANAGER | ActionTypes.VIEW | ActionTypes.TRIGGER | ActionTypes.ADMIN

interface RoleFilter {
    entityName?: OptionType[]
    cluster?: OptionType
    namespace?: OptionType
    group?: OptionType
    kind?: OptionType
    resource?: OptionType
}

export interface DirectPermissionsRoleFilter extends RoleFilter, PermissionStatusAndTimeout {
    entity: EntityTypes.DIRECT | EntityTypes.JOB
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    team: OptionType
    entityName: OptionType[]
    entityNameError?: string
    environment: OptionType[]
    environmentError?: string
    workflow?: OptionType[]
    workflowError?: string
    approver?: boolean
    roleConfig: UserRoleConfig
    roleConfigError?: boolean
}

export interface ChartGroupPermissionsFilter extends Omit<RoleFilter, 'action'>, PermissionStatusAndTimeout {
    entity: EntityTypes.CHART_GROUP
    team?: never
    environment?: never
    action: ActionTypes.VIEW | ActionTypes.ADMIN | ActionTypes.UPDATE
}

export interface K8sPermissionFilter extends PermissionStatusAndTimeout {
    entity: EntityTypes
    cluster: OptionType
    namespace: OptionType[]
    group: OptionType
    action: OptionType
    kind: OptionType
    resource: OptionType[]
    key?: number
}

export interface CreateUserPermissionPayloadParams
    extends Pick<User, 'userStatus' | 'timeToLive' | 'userRoleGroups' | 'canManageAllAccess'> {
    id: number
    userGroups: Pick<UserGroupType, 'name' | 'userGroupId'>[]
    hideApiToken?: TokenResponseType['hideApiToken']
    userIdentifier: TokenResponseType['userIdentifier']
    serverMode: SERVER_MODE
    directPermission: DirectPermissionsRoleFilter[]
    chartPermission: ChartGroupPermissionsFilter
    k8sPermission: K8sPermissionFilter[]
    permissionType: PermissionType
}

export interface DeleteUserPermissionProps
    extends Partial<Pick<DeleteConfirmationModalProps, 'title' | 'onDelete' | 'closeConfirmationModal'>> {
    isUserGroup?: boolean
}

export enum UserAccessResourceKind {
    TEAM = 'team',
    ENVIRONMENT = ResourceKindType.environment,
    DEVTRON_APPS = ResourceKindType.devtronApplication,
    HELM_APPS = ResourceKindType.helmChart,
    HELM_ENVS = 'environment/helm',
    CLUSTER = ResourceKindType.cluster,
    CHART_GROUP = 'chartGroup',
    JOBS = 'jobs',
    WORKFLOW = 'workflow',
    NAMESPACES = 'cluster/namespaces',
    API_RESOURCES = 'cluster/apiResources',
    CLUSTER_RESOURCES = 'cluster/resources',
}

export interface GetUserPermissionResourcesPayload
    extends Partial<Pick<K8sResourceListPayloadType, 'clusterId' | 'k8sRequest'>> {
    entity: EntityTypes
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
    teamIds?: number[]
    appIds?: string[]
    appNames?: string[]
}

export interface GetUserResourceOptionsProps {
    kind: UserAccessResourceKind
    payload: GetUserPermissionResourcesPayload
    options?: APIOptions
}

export interface GetUserAccessAllWorkflowsParams
    extends Pick<GetUserPermissionResourcesPayload, 'appNames'>,
        Pick<GetUserResourceOptionsProps, 'options'> {}

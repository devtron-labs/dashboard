import { ReactNode } from 'react'
import {
    UserStatusDto,
    UserListFilterParams,
    BaseFilterQueryParams,
    OptionType,
    UserStatus,
    UserRoleGroup,
} from '@devtron-labs/devtron-fe-common-lib'
import { ACCESS_TYPE_MAP, SERVER_MODE } from '../../../config'
import { ActionTypes, EntityTypes, PermissionType } from './constants'

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
}

export type APIRoleFilter = Omit<APIRoleFilterDto, 'status' | 'timeoutWindowExpression'> & PermissionStatusAndTimeout

// Permission Groups
export interface PermissionGroupDto extends Pick<UserRoleGroup, 'id' | 'name' | 'description'> {
    /**
     * Role filters (direct permissions) for the permission group
     */
    roleFilters: APIRoleFilterDto[]
    /**
     * If true, the group has super admin access
     */
    superAdmin: boolean
}

export type PermissionGroup = Omit<PermissionGroupDto, 'roleFilters'> & {
    roleFilters: APIRoleFilter[]
}

export type PermissionGroupCreateOrUpdatePayload = Pick<
    PermissionGroup,
    'id' | 'name' | 'description' | 'roleFilters' | 'superAdmin'
>

// User Permissions
export interface UserDto {
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
     * Role filters (direct permissions) for the user
     */
    roleFilters: APIRoleFilterDto[]
    /**
     * If true, the user is a super admin
     */
    superAdmin: boolean
    /**
     * List of permission groups assigned to the user
     */
    userRoleGroups?: {
        roleGroup: Pick<UserRoleGroup, 'id' | 'name' | 'description'>
        status?: UserStatusDto
        timeoutWindowExpression?: string
    }[]
}

export interface User
    extends Omit<UserDto, 'timeoutWindowExpression' | 'email_id' | 'userStatus' | 'userRoleGroups' | 'roleFilters'> {
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
}

export type UserCreateOrUpdatePayload = Pick<
    User,
    'id' | 'emailId' | 'userStatus' | 'roleFilters' | 'superAdmin' | 'timeToLive' | 'userRoleGroups'
>

// Others
export interface UserRole {
    /**
     * List of roles for the user
     */
    roles: string[]
    /**
     * If true, the user has super admin role
     */
    superAdmin: boolean
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

export interface CustomRoles {
    id: number
    roleName: string
    roleDisplayName: string
    roleDescription: string
    entity: EntityTypes
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
}

export type MetaPossibleRoles = Record<
    CustomRoles['roleName'],
    {
        value: CustomRoles['roleDisplayName']
        description: CustomRoles['roleDescription']
    }
>

export interface CustomRoleAndMeta {
    customRoles: CustomRoles[]
    possibleRolesMeta: MetaPossibleRoles
    possibleRolesMetaForHelm: MetaPossibleRoles
    possibleRolesMetaForCluster: MetaPossibleRoles
    possibleRolesMetaForJob: MetaPossibleRoles
}

export interface AuthorizationContextProps {
    customRoles: CustomRoleAndMeta
    isAutoAssignFlowEnabled: boolean
}

export interface AuthorizationProviderProps {
    children: ReactNode
    value: AuthorizationContextProps
}

export type ActionRoleType = ActionTypes.MANAGER | ActionTypes.VIEW | ActionTypes.TRIGGER | ActionTypes.ADMIN

export interface RoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER | EntityTypes.JOB
    team?: OptionType
    entityName?: OptionType[]
    environment?: OptionType[]
    action?: OptionType
    cluster?: OptionType
    namespace?: OptionType
    group?: OptionType
    kind?: OptionType
    resource?: OptionType
}

export interface DirectPermissionsRoleFilter extends RoleFilter, PermissionStatusAndTimeout {
    entity: EntityTypes.DIRECT | EntityTypes.JOB
    team: OptionType
    entityName: OptionType[]
    entityNameError?: string
    environment: OptionType[]
    environmentError?: string
    workflowError?: string
    action: {
        label: string
        value: string
        configApprover?: boolean
    }
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    workflow?: OptionType[]
    approver?: boolean
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
    namespace: OptionType
    group: OptionType
    action: OptionType
    kind: OptionType
    resource: OptionType[]
    key?: number
}

export interface CreateUserPermissionPayloadParams extends Pick<User, 'userStatus' | 'timeToLive'> {
    id: number
    userIdentifier: string
    userGroups: User['userRoleGroups']
    serverMode: SERVER_MODE
    directPermission: DirectPermissionsRoleFilter[]
    chartPermission: ChartGroupPermissionsFilter
    k8sPermission: K8sPermissionFilter[]
    permissionType: PermissionType
}

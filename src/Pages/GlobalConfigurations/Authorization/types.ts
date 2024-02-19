import { ReactNode } from 'react'
import { UserStatusDto, UserListFilterParams, BaseFilterQueryParams } from '@devtron-labs/devtron-fe-common-lib'
import { APIRoleFilter } from './shared/components/userGroups/userGroups.types'

export interface UserAndGroupPermissionsWrapProps {
    children: ReactNode
    /**
     * Handler for updating the flag in the parent's state
     */
    setIsAutoAssignFlowEnabled: (isAutoAssignFlowEnabled: boolean) => void
}

// Permission Groups
export interface PermissionGroupDto {
    /**
     * ID of the permission group
     */
    id: number
    /**
     * Name of the permission group
     */
    name: string
    /**
     * Description of the permission group
     */
    description?: string
    /**
     * Role filters (direct permissions) for the permission group
     */
    roleFilters: APIRoleFilter[]
    /**
     * If true, the group has super admin access
     */
    superAdmin: boolean
}

export type PermissionGroup = PermissionGroupDto

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
    roleFilters: APIRoleFilter[]
    /**
     * If true, the user is a super admin
     */
    superAdmin: boolean
    // TODO (v3): Remove in next iteration
    groups: string[]
    // TODO (v3): This can be marked mandatory in next iteration once groups are deprecated
    /**
     * List of permission groups assigned to the user
     */
    roleGroups?: Pick<PermissionGroup, 'id' | 'name' | 'description'>
}

export interface User extends Omit<UserDto, 'timeoutWindowExpression' | 'email_id'> {
    /**
     * Time until which the user is active
     * Note: Only a user with status 'active' can have 'timeToLive'
     *
     * @default ''
     */
    timeToLive?: string
    emailId: UserDto['email_id']
}

export type UserCreateOrUpdatePayload = Pick<
    User,
    'id' | 'emailId' | 'userStatus' | 'roleFilters' | 'superAdmin' | 'groups'
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

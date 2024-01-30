import { ReactNode } from 'react'
import { SortingParams, UserStatusDto } from '@devtron-labs/devtron-fe-common-lib'
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
    emailId: string
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
     * Time until which the user is active
     * Note: Only a user with status 'active' can have 'timeToLive'
     *
     * @default ''
     */
    timeToLive?: string
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

export type User = UserDto

export type UserCreateOrUpdatePayload = Pick<
    User,
    'id' | 'emailId' | 'userStatus' | 'roleFilters' | 'superAdmin' | 'groups'
>

export type BaseFilterQueryParams<T> = {
    /**
     * Offset for the list result
     */
    offset?: number
    /**
     * Number of items required in the list
     */
    size?: number
    /**
     * Search string (if any)
     */
    searchKey?: string
    /**
     * If true, all items are returned with any search / filtering applied without pagination
     */
    showAll?: boolean
} & SortingParams<T>

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

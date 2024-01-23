import { ReactNode } from 'react'
import { APIRoleFilter } from './shared/components/userGroups/userGroups.types'
import { UserStatus } from './constants'
import { SortingOrder } from '../../config'

export interface UserAndGroupPermissionsWrapProps {
    children: ReactNode
    setIsAutoAssignFlowEnabled: (isAutoAssignFlowEnabled: boolean) => void
}

// Permission Groups
export interface PermissionGroupDto {
    id: number
    name: string
    description?: string
    roleFilters: APIRoleFilter[]
    superAdmin: boolean
}

export type PermissionGroup = PermissionGroupDto

export type PermissionGroupCreateOrUpdatePayload = Pick<
    PermissionGroup,
    'id' | 'name' | 'description' | 'roleFilters' | 'superAdmin'
>

// User Permissions
export interface UserDto {
    id: number
    emailId: string
    userStatus?: UserStatus
    lastLoginTime?: string
    timeToLive?: string
    roleFilters: APIRoleFilter[]
    superAdmin: boolean
    // TODO (v3): Remove in next iteration
    groups: string[]
    // TODO (v3): This can be marked mandatory in next iteration once groups are deprecated
    roleGroups?: Pick<PermissionGroup, 'id' | 'name' | 'description'>
}

export type User = UserDto

export type UserCreateOrUpdatePayload = Pick<
    User,
    'id' | 'emailId' | 'userStatus' | 'roleFilters' | 'superAdmin' | 'groups'
>

export type BaseFilterQueryParams<T = string> = {
    offset: number
    size: number
    searchKey?: string
    showAll?: boolean
} & (
    | {
          sortOrder: SortingOrder
          sortBy: T
      }
    | { sortOrder?: never; sortBy?: never }
)

// Others
export interface UserRole {
    roles: string[]
    superAdmin: boolean
}

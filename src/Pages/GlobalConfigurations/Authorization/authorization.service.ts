import {
    APIOptions,
    get,
    getUrlWithSearchParams,
    post,
    put,
    ResponseType,
    showError,
    trash,
} from '@devtron-labs/devtron-fe-common-lib'
import { CustomRoles } from './shared/components/userGroups/userGroups.types'
import { Routes } from '../../../config'
import {
    BaseFilterQueryParams,
    PermissionGroup,
    PermissionGroupCreateOrUpdatePayload,
    PermissionGroupDto,
    User,
    UserCreateOrUpdatePayload,
    UserDto,
    UserRole,
} from './types'
import { transformUserResponse } from './utils'
import { SortableKeys as UserListSortableKeys } from './UserPermissions/List/constants'
import { SortableKeys as PermissionGroupListSortableKeys } from './PermissionGroups/List/constants'

// User Permissions
export const getUserById = async (userId: User['id']): Promise<User> => {
    try {
        const { result } = (await get(`user/${userId}`)) as ResponseType<UserDto>

        return transformUserResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createOrUpdateUser = (data: UserCreateOrUpdatePayload) => {
    const isUpdate = !!data.id
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : null,
    }
    return isUpdate ? put('user', data, options) : post('user', data, options)
}

export const deleteUser = (userId: User['id']) => trash(`user/${userId}`)

export const getUserList = async (
    queryParams?: BaseFilterQueryParams<UserListSortableKeys>,
): Promise<{
    users: User[]
    totalCount: number
}> => {
    try {
        const {
            result: { users, totalCount },
        } = (await get(getUrlWithSearchParams('user', queryParams ?? {}))) as ResponseType<{
            users: UserDto[]
            totalCount: number
        }>

        return {
            users: users.map(transformUserResponse),
            totalCount,
        }
    } catch (error) {
        showError(error)
        throw error
    }
}

// Permission Groups
export const getPermissionGroupById = async (groupId: PermissionGroup['id']): Promise<PermissionGroup> => {
    try {
        const { result } = (await get(`user/role/group/${groupId}`)) as ResponseType<PermissionGroupDto>
        return result
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createOrUpdatePermissionGroup = (payload: PermissionGroupCreateOrUpdatePayload) => {
    const isUpdate = !!payload.id
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : null,
    }

    return isUpdate ? put(Routes.USER_ROLE_GROUP, payload, options) : post('user/role/group', payload, options)
}

export const getPermissionGroupList = async (
    queryParams?: BaseFilterQueryParams<PermissionGroupListSortableKeys>,
): Promise<{
    permissionGroups: PermissionGroup[]
    totalCount: number
}> => {
    const {
        result: { roleGroups: permissionGroups, totalCount },
    } = (await get(getUrlWithSearchParams('user/role/group', queryParams ?? {}))) as ResponseType<{
        roleGroups: PermissionGroupDto[]
        totalCount: number
    }>

    return {
        permissionGroups,
        totalCount,
    }
}

export const deletePermissionGroup = (id: PermissionGroup['id']) => {
    return trash(`user/role/group/${id}`)
}

// Others
export const getCustomRoles = async (): Promise<ResponseType<CustomRoles[]>> => {
    try {
        return await get(Routes.CUSTOM_ROLES)
    } catch (err) {
        showError(err)
        throw err
    }
}

export const getUserRole = (appName?: string): Promise<ResponseType<UserRole>> =>
    get(getUrlWithSearchParams(Routes.USER_CHECK_ROLE, { appName }))

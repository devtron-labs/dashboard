import {
    APIOptions,
    BaseFilterQueryParams,
    get,
    getUrlWithSearchParams,
    post,
    put,
    ResponseType,
    showError,
    trash,
    UserListFilterParams,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config'
import {
    CustomRoles,
    PermissionGroup,
    PermissionGroupBulkDeletePayload,
    PermissionGroupCreateOrUpdatePayload,
    PermissionGroupDto,
    User,
    UserBulkDeletePayload,
    UserCreateOrUpdatePayload,
    UserDto,
    UserRole,
} from './types'
import { transformUserResponse } from './utils'
import { SortableKeys as PermissionGroupListSortableKeys } from './PermissionGroups/List/constants'

// User Permissions
export const getUserById = async (userId: User['id']): Promise<User> => {
    try {
        const { result } = (await get(`${Routes.USER}/${userId}`)) as ResponseType<UserDto>

        return transformUserResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createOrUpdateUser = ({ emailId, ...data }: UserCreateOrUpdatePayload) => {
    const _data: UserDto = {
        ...data,
        email_id: emailId,
    }
    const isUpdate = !!_data.id
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : null,
    }
    return isUpdate ? put(Routes.USER, _data, options) : post(Routes.USER, _data, options)
}

export const deleteUser = (userId: User['id']) => trash(`${Routes.USER}/${userId}`)

export const getUserList = async (
    queryParams: UserListFilterParams,
    signal?: AbortSignal,
): Promise<{
    users: User[]
    totalCount: number
}> => {
    try {
        const {
            result: { users, totalCount },
        } = (await get(getUrlWithSearchParams(`${Routes.USER}/${Routes.API_VERSION_V2}`, queryParams ?? {}), {
            signal,
        })) as ResponseType<{
            users: UserDto[]
            totalCount: number
        }>

        return {
            users: users.map(transformUserResponse),
            totalCount,
        }
    } catch (error) {
        if (!signal?.aborted) {
            showError(error)
        }
        throw error
    }
}

export const deleteUserInBulk = (payload: UserBulkDeletePayload) =>
    trash(
        `${Routes.USER}/bulk`,
        'ids' in payload
            ? { ids: payload.ids }
            : {
                  listingRequest: payload.filterConfig,
              },
    )

// Permission Groups
export const getPermissionGroupById = async (groupId: PermissionGroup['id']): Promise<PermissionGroup> => {
    try {
        const { result } = (await get(`${Routes.USER_ROLE_GROUP}/${groupId}`)) as ResponseType<PermissionGroupDto>
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

    return isUpdate ? put(Routes.USER_ROLE_GROUP, payload, options) : post(Routes.USER_ROLE_GROUP, payload, options)
}

export const getPermissionGroupList = async (
    queryParams?: BaseFilterQueryParams<PermissionGroupListSortableKeys>,
    signal?: AbortSignal,
): Promise<{
    permissionGroups: PermissionGroup[]
    totalCount: number
}> => {
    try {
        const {
            result: { roleGroups: permissionGroups, totalCount },
        } = (await get(
            getUrlWithSearchParams(`${Routes.USER_ROLE_GROUP}/${Routes.API_VERSION_V2}`, queryParams ?? {}),
            { signal },
        )) as ResponseType<{
            roleGroups: PermissionGroupDto[]
            totalCount: number
        }>

        return {
            permissionGroups,
            totalCount,
        }
    } catch (error) {
        if (!signal?.aborted) {
            showError(error)
        }
        throw error
    }
}

export const deletePermissionGroup = (id: PermissionGroup['id']) => trash(`${Routes.USER_ROLE_GROUP}/${id}`)

export const deletePermissionGroupInBulk = (payload: PermissionGroupBulkDeletePayload) =>
    trash(
        `${Routes.USER_ROLE_GROUP}/bulk`,
        'ids' in payload
            ? { ids: payload.ids }
            : {
                  listingRequest: payload.filterConfig,
              },
    )

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

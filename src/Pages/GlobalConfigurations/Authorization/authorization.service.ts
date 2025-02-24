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
    UserStatus,
    CustomRoles,
    ResourceVersionType,
    ACCESS_TYPE_MAP,
    EntityTypes,
    EnvironmentListHelmResult,
    K8sResourceDetailType,
    ApiResourceType,
    Teams,
    EnvListMinDTO,
} from '@devtron-labs/devtron-fe-common-lib'
import { ChartGroup } from '@Components/charts/charts.types'
import { AppIdWorkflowNamesMapping, Cluster, ProjectFilteredApps } from '@Services/service.types'
import { JobList } from '@Components/Jobs/Types'
import { Routes } from '../../../config'
import {
    GetUserResourceOptionsProps,
    PermissionGroup,
    PermissionGroupBulkDeletePayload,
    PermissionGroupCreateOrUpdatePayload,
    PermissionGroupDto,
    User,
    UserBulkDeletePayload,
    UserCreateOrUpdateParamsType,
    UserCreateOrUpdatePayloadType,
    UserDto,
    UserAccessResourceKind,
    UserRole,
    GetUserPermissionResourcesPayload,
} from './types'
import { transformPermissionGroupResponse, transformUserResponse } from './utils'
import { SortableKeys as PermissionGroupListSortableKeys } from './PermissionGroups/List/constants'
import { importComponentFromFELibrary } from '../../../components/common'
import { getUserGroupsPayload } from './libUtils'
import { ProjectsListType } from './Shared/components/AppPermissions/types'

const getUserStatusAndTimeoutPayload: (
    userStatus: UserStatus,
    timeToLive: string,
) => Pick<UserDto, 'userStatus' | 'timeoutWindowExpression'> = importComponentFromFELibrary(
    'getUserStatusAndTimeoutPayload',
    () => ({}),
    'function',
)
const getStatusAndTimeoutPayload = importComponentFromFELibrary('getStatusAndTimeoutPayload', () => ({}), 'function')

// User Permissions
export const getUserById = async (userId: User['id']): Promise<User> => {
    try {
        const { result } = (await get(`${Routes.USER}/${Routes.API_VERSION_V2}/${userId}`)) as ResponseType<UserDto>

        return transformUserResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createOrUpdateUser = ({
    emailId,
    userStatus,
    timeToLive,
    userRoleGroups,
    roleFilters,
    userGroups,
    ...data
}: UserCreateOrUpdateParamsType) => {
    const _data: UserCreateOrUpdatePayloadType = {
        ...data,
        email_id: emailId,
        userRoleGroups: userRoleGroups.map(({ id, name, status: groupStatus, timeToLive: groupTimeToLive }) => ({
            roleGroup: {
                id,
                name,
            },
            ...getStatusAndTimeoutPayload(groupStatus, groupTimeToLive),
        })),
        roleFilters: roleFilters.map(
            ({ status: roleFilterStatus, timeToLive: roleFilterTimeToLive, ...roleFilter }) => ({
                ...roleFilter,
                ...getStatusAndTimeoutPayload(roleFilterStatus, roleFilterTimeToLive),
            }),
        ),
        userGroups: getUserGroupsPayload(userGroups),
        ...getUserStatusAndTimeoutPayload(userStatus, timeToLive),
    }

    const isUpdate = !!_data.id
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : null,
    }
    const url = `${Routes.USER}/${Routes.API_VERSION_V2}`
    return isUpdate ? put(url, _data, options) : post(url, _data, options)
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
        const { result } = (await get(
            `${Routes.USER_ROLE_GROUP}/${Routes.API_VERSION_V2}/${groupId}`,
        )) as ResponseType<PermissionGroupDto>
        return transformPermissionGroupResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createOrUpdatePermissionGroup = ({
    name,
    description,
    roleFilters,
    ...payload
}: PermissionGroupCreateOrUpdatePayload) => {
    const _payload = {
        ...payload,
        name: name.trim(),
        description: description?.trim(),
        roleFilters: roleFilters.map(
            // Remove the status and timestamp from the payload for permission group
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ status: _roleFilterStatus, timeToLive: _roleFilterTimeToLive, ...roleFilter }) => ({
                ...roleFilter,
            }),
        ),
    }

    const isUpdate = !!payload.id
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : null,
    }

    const url = `${Routes.USER_ROLE_GROUP}/${Routes.API_VERSION_V2}`
    return isUpdate ? put(url, _payload, options) : post(url, _payload, options)
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
            permissionGroups: permissionGroups.map(transformPermissionGroupResponse),
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

const getUserResourceOptions = async <T>({ kind, payload }: GetUserResourceOptionsProps): Promise<T> => {
    const url = `${Routes.USER_RESOURCE_OPTIONS}/${kind}/${ResourceVersionType.alpha1}`
    const { result } = await post<{ data: T }>(url, payload)
    return result.data
}

export const getUserAccessChartGroups = async () =>
    getUserResourceOptions<{ groups: ChartGroup[] }>({
        kind: UserAccessResourceKind.CHART_GROUP,
        payload: { entity: EntityTypes.CHART_GROUP },
    })

export const getUserAccessEnvListForHelmApps = async () =>
    getUserResourceOptions<EnvironmentListHelmResult[]>({
        kind: UserAccessResourceKind.HELM_ENVS,
        payload: { entity: EntityTypes.DIRECT, accessType: ACCESS_TYPE_MAP.HELM_APPS },
    })

export const getUserAccessJobList = async ({ teamIds }: Pick<GetUserPermissionResourcesPayload, 'teamIds'>) =>
    getUserResourceOptions<JobList['result']['jobContainers']>({
        kind: UserAccessResourceKind.JOBS,
        payload: { entity: EntityTypes.JOB, teamIds },
    })

export const getUserAccessK8sResourceList = async ({
    clusterId,
    k8sRequest,
}: Pick<GetUserPermissionResourcesPayload, 'clusterId' | 'k8sRequest'>) =>
    getUserResourceOptions<K8sResourceDetailType>({
        kind: UserAccessResourceKind.CLUSTER_RESOURCES,
        payload: { entity: EntityTypes.CLUSTER, k8sRequest, clusterId },
    })

export const getUserAccessResourceGroupList = async ({
    clusterId,
}: Pick<GetUserPermissionResourcesPayload, 'clusterId'>) =>
    getUserResourceOptions<ApiResourceType>({
        kind: UserAccessResourceKind.API_RESOURCES,
        payload: { entity: EntityTypes.CLUSTER, clusterId },
    })

export const getUserAccessNamespaceList = async ({ clusterId }: Pick<GetUserPermissionResourcesPayload, 'clusterId'>) =>
    getUserResourceOptions<string[]>({
        kind: UserAccessResourceKind.NAMESPACES,
        payload: { entity: EntityTypes.CLUSTER, clusterId },
    })

export const getUserAccessClusterList = async () =>
    getUserResourceOptions<Cluster[]>({
        kind: UserAccessResourceKind.CLUSTER,
        payload: { entity: EntityTypes.CLUSTER },
    })

export const getUserAccessAllWorkflows = async ({ appIds }: Pick<GetUserPermissionResourcesPayload, 'appIds'>) =>
    getUserResourceOptions<AppIdWorkflowNamesMapping>({
        kind: UserAccessResourceKind.JOBS,
        payload: { entity: EntityTypes.JOB, appIds },
    })

export const getUserAccessProjectFilteredApps = async ({
    accessType,
    teamIds,
}: Pick<GetUserPermissionResourcesPayload, 'accessType' | 'teamIds'>) =>
    getUserResourceOptions<ProjectFilteredApps['result']>({
        kind:
            accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                ? UserAccessResourceKind.DEVTRON_APPS
                : UserAccessResourceKind.HELM_APPS,
        payload: { entity: EntityTypes.DIRECT, accessType, teamIds },
    })

export const getUserAccessEnvironmentList = async (): Promise<
    Record<ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.JOBS, EnvListMinDTO[]>
> => {
    const [devtronEnvironments, jobEnvironments] = await Promise.all([
        getUserResourceOptions<EnvListMinDTO[]>({
            kind: UserAccessResourceKind.ENVIRONMENT,
            payload: { entity: EntityTypes.DIRECT, accessType: ACCESS_TYPE_MAP.DEVTRON_APPS },
        }),
        getUserResourceOptions<EnvListMinDTO[]>({
            kind: UserAccessResourceKind.ENVIRONMENT,
            payload: { entity: EntityTypes.JOB },
        }),
    ])

    return {
        [ACCESS_TYPE_MAP.DEVTRON_APPS]: devtronEnvironments,
        [ACCESS_TYPE_MAP.JOBS]: jobEnvironments,
    }
}

export const getUserAccessProjectList = async (): Promise<ProjectsListType> => {
    const [devtronProjects, helmProjects, jobProjects] = await Promise.all([
        getUserResourceOptions<Teams[]>({
            kind: UserAccessResourceKind.TEAM,
            payload: { entity: EntityTypes.DIRECT, accessType: ACCESS_TYPE_MAP.DEVTRON_APPS },
        }),
        getUserResourceOptions<Teams[]>({
            kind: UserAccessResourceKind.TEAM,
            payload: { entity: EntityTypes.DIRECT, accessType: ACCESS_TYPE_MAP.HELM_APPS },
        }),
        getUserResourceOptions<Teams[]>({
            kind: UserAccessResourceKind.TEAM,
            payload: { entity: EntityTypes.JOB },
        }),
    ])

    return {
        [ACCESS_TYPE_MAP.DEVTRON_APPS]: devtronProjects,
        [ACCESS_TYPE_MAP.HELM_APPS]: helmProjects,
        [ACCESS_TYPE_MAP.JOBS]: jobProjects,
    }
}

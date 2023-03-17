import { getAppListMin, getEnvironmentListMin } from '../../services/service'
import { get, post, put, trash, ResponseType, getTeamListMin, APIOptions } from '@devtron-labs/devtron-fe-common-lib'
import { CreateGroup, CreateUser } from './userGroups.types'
import { Routes} from '../../config'


export function getData() {
    return Promise.all([getTeamListMin(), getAppListMin(), getEnvironmentListMin()]).then(
        ([teamList, appList, environmentList]) => {
            return getParsedData(teamList, appList, environmentList)
        },
    )
}

export function getActionList() {
    return {
        result: [
            {
                value: 'trigger',
                name: 'trigger',
            },
            {
                value: 'view',
                name: 'view',
            },
            {
                value: '*',
                name: 'admin',
            },
            {
                value: 'manager',
                name: 'manager',
            },
        ],
    }
}

export function getParsedData(teamList, appList, environmentList) {
    let lists = {
        team: teamList.result
            ? teamList.result.map((team) => {
                  return { value: team.name, name: team.name }
              })
            : [],
        application: appList.result
            ? appList.result.map((app) => {
                  return { value: app.name, name: app.name }
              })
            : [],
        environment: environmentList.result
            ? environmentList.result.map((env) => {
                  return { value: env.environment_name, name: env.environment_name }
              })
            : [],
        action: getActionList().result,
    }
    let response = {
        lists: lists,
        code: teamList.code || appList.code || environmentList.code,
    }
    return response
}

export function saveUser(request: CreateUser) {
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : 30,
    }
    if (window._env_.CONFIGURABLE_TIMEOUT) {
        return request.id ? put('user', request, options) : post('user', request, options)
    } else {
        return request.id ? put('user', request) : post('user', request)
    }
}

export function saveGroup(request: CreateGroup) {
    const options: APIOptions = {
        timeout: window._env_.CONFIGURABLE_TIMEOUT ? parseInt(window._env_.CONFIGURABLE_TIMEOUT, 10) : 30,
    }
    if (window._env_.CONFIGURABLE_TIMEOUT) {
        return request.id ? put(Routes.USER_ROLE_GROUP, request, options) : post('user/role/group', request, options)
    } else {
        return request.id ? put(Routes.USER_ROLE_GROUP, request) : post('user/role/group', request)
    }
}

export function userModal(user) {
    return {
        id: user.id,
        email: user.email_id,
        accessToken: user.accessToken,
        rules: user.roleFilters
            ? user.roleFilters.map((rule) => {
                  return {
                      team: rule.team || '',
                      application: rule.application || '',
                      environment: rule.environment || '',
                      action: rule.action,
                  }
              })
            : [],
    }
}

export async function getUserList() {
    const response = await get('user')
    const { result } = response
    return { ...response, result: result.sort((a, b) => a.email_id.localeCompare(b.email_id)) }
}

interface UserDetail extends ResponseType {
    result?: CreateUser
}

export function getUserId(userId: number): Promise<UserDetail> {
    return get(`user/${userId}`)
}

interface GroupList extends ResponseType {
    result: {
        id: number
        name: string
        description: string
        roleFilters: any[]
    }[]
}

export async function getGroupList(): Promise<GroupList> {
    const response = await get('user/role/group')
    const { result } = response
    return { ...response, result: result.sort((a, b) => a.name.localeCompare(b.name)) }
}

export function getGroupId(groupId: number) {
    return get(`user/role/group/${groupId}`)
}

export function deleteUser(userId: number) {
    return trash(`user/${userId}`)
}

export function deleteGroup(groupId: number) {
    return trash(`user/role/group/${groupId}`)
}

interface UserRole extends ResponseType {
    result?: {
        roles: string[]
        superAdmin: boolean
    }
}

export function getUserRole(appName?: string): Promise<UserRole> {
    return get(`${Routes.USER_CHECK_ROLE}${appName ? `?appName=${appName}` : ''}`)
}
export interface UsersDataToExportResponse extends ResponseType {
    result?: CreateUser[]
}
export interface GroupsDataToExportResponse extends ResponseType {
    result?: CreateGroup[]
}

export function getEnvironmentListHelmApps(): Promise<any> {
    return get(Routes.ENVIRONMENT_LIST_MIN_HELM_PROJECTS)
}

export function getUsersDataToExport(): Promise<UsersDataToExportResponse> {
    return get(Routes.ALL_USERS_LIST)
}

export function getGroupsDataToExport(): Promise<GroupsDataToExportResponse> {
    return get(Routes.ALL_GROUPS_LIST)
}

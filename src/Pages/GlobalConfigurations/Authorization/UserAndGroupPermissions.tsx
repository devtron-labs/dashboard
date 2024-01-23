import {
    ConditionalWrap,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    Progressing,
    Reload,
    showError,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { lazy, useContext, useState } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { getChartGroups } from '../../../components/charts/charts.service'
import { importComponentFromFELibrary, mapByKey } from '../../../components/common'
import { mainContext } from '../../../components/common/navigation/NavigationRoutes'
import { getJobs } from '../../../components/Jobs/Service'
import { getProjectList } from '../../../components/project/service'
import { EntityTypes } from './shared/components/userGroups/userGroups.types'
import { ACCESS_TYPE_MAP, API_STATUS_CODES, Routes, SERVER_MODE } from '../../../config'
import { getEnvironmentListHelmApps, getEnvironmentListMin, getProjectFilteredApps } from '../../../services/service'
import './authorization.scss'
import { getCustomRoles, getPermissionGroupList } from './authorization.service'
import { AuthorizationProvider } from './AuthorizationProvider'
import { getMetaPossibleRoles } from './utils'
import { UserAndGroupPermissionsWrapProps } from './types'

const APITokens = lazy(() => import('./APITokens'))
const UserPermissions = lazy(() => import('./UserPermissions'))
const PermissionGroups = lazy(() => import('./PermissionGroups'))

const AuthorizationGlobalConfigWrapper = importComponentFromFELibrary('AuthorizationGlobalConfigWrapper')

const UserAndGroupPermissionsWrap = ({ children, setIsAutoAssignFlowEnabled }: UserAndGroupPermissionsWrapProps) => {
    const getWrap = (child) => (
        <AuthorizationGlobalConfigWrapper setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
            {child}
        </AuthorizationGlobalConfigWrapper>
    )

    return (
        <ConditionalWrap condition={!!AuthorizationGlobalConfigWrapper} wrap={getWrap}>
            {children}
        </ConditionalWrap>
    )
}

const UserAndGroupPermissions = () => {
    const { serverMode } = useContext(mainContext)
    const { path } = useRouteMatch()
    const [isDataLoading, data, error, reload] = useAsync(() =>
        Promise.all([
            getPermissionGroupList(),
            getProjectList(),
            getEnvironmentListMin(),
            serverMode === SERVER_MODE.EA_ONLY ? null : getChartGroups(),
            getEnvironmentListHelmApps(),
            getCustomRoles(),
        ]),
    )
    // TODO (v3): use object instead and try to get rid of this altogether
    const [appsList, setAppsList] = useState(new Map())
    const [appsListHelmApps, setAppsListHelmApps] = useState(new Map())
    const [jobsList, setJobsList] = useState(new Map())
    // For handling the auto assign flow for enterprise
    const [isAutoAssignFlowEnabled, setIsAutoAssignFlowEnabled] = useState(false)

    // TODO (v3): possibly move to a provider
    async function fetchJobsList(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !jobsList.has(projectId))
        if (missingProjects.length === 0) {
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-shadow
        setJobsList((jobsList) => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return missingProjects.reduce((jobsList, projectId) => {
                jobsList.set(projectId, { loading: true, result: [], error: null })
                return jobsList
            }, jobsList)
        })
        try {
            const {
                result: { jobContainers },
            } = await getJobs({ teams: missingProjects })

            const jobs = [{ projectId: projectIds[0], jobsList: jobContainers }]
            const projectsMap = mapByKey(jobs || [], 'projectId')
            setJobsList(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (jobsList) =>
                    new Map(
                        // eslint-disable-next-line @typescript-eslint/no-shadow
                        missingProjects.reduce((jobsList, projectId) => {
                            jobsList.set(projectId, {
                                loading: false,
                                result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.jobsList || [] : [],
                                error: null,
                            })
                            return jobsList
                        }, jobsList),
                    ),
            )
            // eslint-disable-next-line @typescript-eslint/no-shadow
        } catch (error) {
            showError(error)
            // eslint-disable-next-line @typescript-eslint/no-shadow
            setJobsList((jobsList) => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                return missingProjects.reduce((jobsList, projectId) => {
                    jobsList.set(projectId, { loading: false, result: [], error: null })
                    return jobsList
                }, jobsList)
            })
        }
    }

    async function fetchAppList(projectIds: number[]) {
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return
        }
        const missingProjects = projectIds.filter((projectId) => !appsList.has(projectId))
        if (missingProjects.length === 0) {
            return
        }
        setAppsList((appList) => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return missingProjects.reduce((appList, projectId) => {
                appList.set(projectId, { loading: true, result: [], error: null })
                return appList
            }, appList)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects, ACCESS_TYPE_MAP.DEVTRON_APPS)
            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsList((appList) => {
                return new Map(
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    missingProjects.reduce((appList, projectId) => {
                        appList.set(projectId, {
                            loading: false,
                            result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                            error: null,
                        })
                        return appList
                    }, appList),
                )
            })
        } catch (_error) {
            showError(_error)
            setAppsList((appList) => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                return missingProjects.reduce((appList, projectId) => {
                    appList.set(projectId, { loading: false, result: [], error: _error })
                    return appList
                }, appList)
            })
        }
    }

    async function fetchAppListHelmApps(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !appsListHelmApps.has(projectId))
        if (missingProjects.length === 0) {
            return
        }
        setAppsListHelmApps((appListHelmApps) => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return missingProjects.reduce((appListHelmApps, projectId) => {
                appListHelmApps.set(projectId, { loading: true, result: [], error: null })
                return appListHelmApps
            }, appListHelmApps)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects, ACCESS_TYPE_MAP.HELM_APPS)

            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsListHelmApps((appListHelmApps) => {
                return new Map(
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    missingProjects.reduce((appListHelmApps, projectId) => {
                        appListHelmApps.set(projectId, {
                            loading: false,
                            result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                            error: null,
                        })
                        return appListHelmApps
                    }, appListHelmApps),
                )
            })
        } catch (_error) {
            showError(_error)
            setAppsListHelmApps((appListHelmApps) => {
                return missingProjects.reduce((appList, projectId) => {
                    appListHelmApps.set(projectId, { loading: false, result: [], error: _error })
                    return appListHelmApps
                }, appListHelmApps)
            })
        }
    }

    if (isDataLoading) {
        return <Progressing pageLoader />
    }

    if (error) {
        if ([API_STATUS_CODES.PERMISSION_DENIED, API_STATUS_CODES.UNAUTHORIZED].includes(error.code)) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={reload} />
    }

    const [userGroups, projects, environments, chartGroups, envClustersList, customRolesList] = data

    return (
        <div className="flexbox-col flex-grow-1 h-100 w-100">
            <AuthorizationProvider
                // TODO (v3): Simplify and move these to API service instead
                value={{
                    fetchAppList,
                    appsList,
                    userGroupsList: userGroups?.permissionGroups ?? [],
                    environmentsList: environments?.result ?? [],
                    projectsList: projects?.result ?? [],
                    chartGroupsList: chartGroups?.result?.groups ?? [],
                    envClustersList: envClustersList?.result ?? [],
                    fetchAppListHelmApps,
                    fetchJobsList,
                    jobsList,
                    appsListHelmApps,
                    customRoles: {
                        customRoles: customRolesList?.result ?? [],
                        possibleRolesMeta: getMetaPossibleRoles(
                            customRolesList?.result ?? [],
                            EntityTypes.DIRECT,
                            ACCESS_TYPE_MAP.DEVTRON_APPS,
                        ),
                        possibleRolesMetaForHelm: getMetaPossibleRoles(
                            customRolesList?.result ?? [],
                            EntityTypes.DIRECT,
                            ACCESS_TYPE_MAP.HELM_APPS,
                        ),
                        possibleRolesMetaForCluster: getMetaPossibleRoles(
                            customRolesList?.result ?? [],
                            EntityTypes.CLUSTER,
                        ),
                        possibleRolesMetaForJob: getMetaPossibleRoles(customRolesList?.result ?? [], EntityTypes.JOB),
                    },
                    isAutoAssignFlowEnabled,
                }}
            >
                <Switch>
                    <Route path={`${path}/${Routes.USER_PERMISSIONS}`}>
                        <UserAndGroupPermissionsWrap setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
                            <UserPermissions />
                        </UserAndGroupPermissionsWrap>
                    </Route>
                    <Route path={`${path}/${Routes.PERMISSION_GROUPS}`}>
                        <UserAndGroupPermissionsWrap setIsAutoAssignFlowEnabled={setIsAutoAssignFlowEnabled}>
                            <PermissionGroups />
                        </UserAndGroupPermissionsWrap>
                    </Route>
                    <Route path={`${path}/${Routes.API_TOKEN}`} component={APITokens} />
                    <Redirect to={`${path}/${Routes.USER_PERMISSIONS}`} />
                </Switch>
            </AuthorizationProvider>
        </div>
    )
}

export default UserAndGroupPermissions

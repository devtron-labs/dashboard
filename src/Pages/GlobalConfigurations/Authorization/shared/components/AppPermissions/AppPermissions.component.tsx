/* eslint-disable no-param-reassign */
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, Switch, Route, Redirect, useLocation, useRouteMatch } from 'react-router-dom'
import { GenericSectionErrorState, OptionType, showError, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { APPROVER_ACTION, CONFIG_APPROVER_ACTION } from '../userGroups/UserGroup'
import { ACCESS_TYPE_MAP, HELM_APP_UNASSIGNED_PROJECT, SELECT_ALL_VALUE, SERVER_MODE } from '../../../../../../config'
import { mapByKey } from '../../../../../../components/common'
import { mainContext, useMainContext } from '../../../../../../components/common/navigation/NavigationRoutes'
import K8sPermissions from '../K8sObjectPermissions/K8sPermissions'
import { apiGroupAll } from '../K8sObjectPermissions/K8sPermissions.utils'
import {
    getAllWorkflowsForAppNames,
    getEnvironmentListHelmApps,
    getEnvironmentListMin,
    getProjectFilteredApps,
} from '../../../../../../services/service'
import { DEFAULT_ENV } from '../../../../../../components/app/details/triggerView/Constants'
import { getJobs } from '../../../../../../components/Jobs/Service'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { getProjectList } from '../../../../../../components/project/service'
import { getChartGroups } from '../../../../../../components/charts/charts.service'
import {
    ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE,
    emptyDirectPermissionDevtronApps,
    emptyDirectPermissionHelmApps,
    emptyDirectPermissionJobs,
    SELECT_ALL_OPTION,
} from './constants'
import AppPermissionDetail from './AppPermissionDetail'
import { ChartPermission } from '../ChartPermission'
import {
    getAppPermissionDetailConfig,
    getEnvironmentClusterOptions,
    getEnvironmentOptions,
    getNavLinksConfig,
} from './utils'
import { getWorkflowOptions } from '../../../utils'
import { AppPermissionsDetailType, DirectPermissionRow } from './types'
import { APIRoleFilter, ChartGroupPermissionsFilter, DirectPermissionsRoleFilter } from '../../../types'
import { ActionTypes, EntityTypes } from '../../../constants'

const AppPermissions = () => {
    const { serverMode } = useContext(mainContext)
    const {
        directPermission,
        setDirectPermission,
        setChartPermission,
        setK8sPermission,
        currentK8sPermissionRef,
        data,
    } = usePermissionConfiguration()
    const { customRoles } = useAuthorizationContext()
    const { isSuperAdmin: superAdmin } = useMainContext()
    const { url, path } = useRouteMatch()
    const location = useLocation()

    const [isLoading, setIsLoading] = useState(false)
    // TODO (v3): use object instead
    const [appsList, setAppsList] = useState<AppPermissionsDetailType['appsList']>(new Map())
    const [appsListHelmApps, setAppsListHelmApps] = useState<AppPermissionsDetailType['appsListHelmApps']>(new Map())
    const [jobsList, setJobsList] = useState<AppPermissionsDetailType['jobsList']>(new Map())

    const [isDataLoading, configData, error, reload] = useAsync(() =>
        Promise.all([
            getProjectList(),
            getEnvironmentListMin(),
            serverMode === SERVER_MODE.EA_ONLY ? null : getChartGroups(),
            getEnvironmentListHelmApps(),
        ]),
    )

    const isNonEAMode = serverMode !== SERVER_MODE.EA_ONLY
    const projectsList = configData?.[0]?.result ?? []
    const environmentsList = configData?.[1]?.result ?? []
    const chartGroupsList = configData?.[2]?.result?.groups ?? []
    const envClustersList = configData?.[3]?.result ?? []

    const environmentClusterOptions = getEnvironmentClusterOptions(envClustersList)

    const _getEnvironmentOptions = (entity: DirectPermissionRow['permission']['entity']) =>
        getEnvironmentOptions(environmentsList, entity)

    const appPermissionDetailConfig = getAppPermissionDetailConfig(path, serverMode)
    const navLinksConfig = getNavLinksConfig(serverMode, superAdmin)

    // TODO (v3): Checkout the scope for common out
    async function fetchJobsList(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !jobsList.has(projectId))
        if (missingProjects.length === 0) {
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-shadow
        setJobsList((jobsList) =>
            missingProjects.reduce((_jobsList, projectId) => {
                _jobsList.set(projectId, { loading: true, result: [], error: null })
                return _jobsList
            }, jobsList),
        )
        try {
            const {
                result: { jobContainers },
            } = await getJobs({ teams: missingProjects })

            // TODO (v3): Why are we setting only projectIds[0] here
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
            setAppsList(
                (appList) =>
                    new Map(
                        // eslint-disable-next-line @typescript-eslint/no-shadow
                        missingProjects.reduce((appList, projectId) => {
                            appList.set(projectId, {
                                loading: false,
                                result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                                error: null,
                            })
                            return appList
                        }, appList),
                    ),
            )
        } catch (_error) {
            showError(_error)
            setAppsList((appList) =>
                missingProjects.reduce((_appList, projectId) => {
                    _appList.set(projectId, { loading: false, result: [], error: _error })
                    return _appList
                }, appList),
            )
        }
    }

    async function fetchAppListHelmApps(projectIds: number[]) {
        const missingProjects = projectIds.filter((projectId) => !appsListHelmApps.has(projectId))
        if (missingProjects.length === 0) {
            return
        }
        setAppsListHelmApps((appListHelmApps) => {
            return missingProjects.reduce((_appListHelmApps, projectId) => {
                _appListHelmApps.set(projectId, { loading: true, result: [], error: null })
                return _appListHelmApps
            }, appListHelmApps)
        })
        try {
            const { result } = await getProjectFilteredApps(missingProjects, ACCESS_TYPE_MAP.HELM_APPS)

            const projectsMap = mapByKey(result || [], 'projectId')
            setAppsListHelmApps(
                // TODO (v3): Common out
                (appListHelmApps) =>
                    new Map(
                        missingProjects.reduce((_appListHelmApps, projectId) => {
                            _appListHelmApps.set(projectId, {
                                loading: false,
                                result: projectsMap.has(+projectId) ? projectsMap.get(+projectId)?.appList || [] : [],
                                error: null,
                            })
                            return _appListHelmApps
                        }, appListHelmApps),
                    ),
            )
        } catch (_error) {
            showError(_error)
            setAppsListHelmApps((appListHelmApps) =>
                missingProjects.reduce((appList, projectId) => {
                    appListHelmApps.set(projectId, { loading: false, result: [], error: _error })
                    return appListHelmApps
                }, appListHelmApps),
            )
        }
    }

    const getListForAccessType = (accessType: ACCESS_TYPE_MAP) => {
        switch (accessType) {
            case ACCESS_TYPE_MAP.DEVTRON_APPS:
                return appsList
            case ACCESS_TYPE_MAP.HELM_APPS:
                return appsListHelmApps
            case ACCESS_TYPE_MAP.JOBS:
                return jobsList
            default:
                throw new Error(`Unknown access type ${accessType}`)
        }
    }

    const setAllApplication = (directRoleFilter: APIRoleFilter, projectId) => {
        if (directRoleFilter.team !== HELM_APP_UNASSIGNED_PROJECT) {
            const isJobs = directRoleFilter.entity === EntityTypes.JOB
            return [
                { label: isJobs ? 'All Jobs' : 'All applications', value: SELECT_ALL_VALUE },
                ...(getListForAccessType(directRoleFilter.accessType).get(projectId)?.result || []).map((app) => ({
                    label: isJobs ? app.jobName : app.name,
                    value: isJobs ? app.appName : app.name,
                })),
            ]
        }
        return [{ label: 'All applications', value: SELECT_ALL_VALUE }]
    }

    async function setAllWorkflows(jobOptions) {
        const jobNames = jobOptions.filter((job) => job.value !== SELECT_ALL_VALUE).map((job) => job.label)
        const { result } = await getAllWorkflowsForAppNames(jobNames)
        const { appIdWorkflowNamesMapping } = result

        const workflowOptions = getWorkflowOptions(appIdWorkflowNamesMapping)

        return [
            { label: 'All Workflows', value: SELECT_ALL_VALUE },
            ...workflowOptions.reduce((acc, option) => {
                acc.push(...option.options)
                return acc
            }, [] as OptionType[]),
        ]
    }

    function setClusterValues(startsWithHash, clusterName) {
        const defaultValueArr = []
        if (startsWithHash) {
            defaultValueArr.push({
                label: `All existing + future environments in ${clusterName}`,
                value: `${ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE}${clusterName}`,
                namespace: '',
                clusterName: '',
            })
        }
        defaultValueArr.push({
            label: `All existing environments in ${clusterName}`,
            value: `${SELECT_ALL_VALUE}${clusterName}`,
            namespace: '',
            clusterName: '',
        })
        const selectedCluster = envClustersList?.find((cluster) => cluster.clusterName === clusterName)

        return [
            ...defaultValueArr,
            ...(selectedCluster['environments']?.map((env) => ({
                label: env.environmentName,
                value: env.environmentIdentifier,
                namespace: env.namespace,
                clusterName,
            })) ?? []),
        ]
    }

    // eslint-disable-next-line consistent-return
    const setAllEnv = (directRoleFilter: APIRoleFilter) => {
        if (directRoleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
            if (directRoleFilter.environment) {
                return directRoleFilter.environment
                    .split(',')
                    .map((directRole) => ({ value: directRole, label: directRole }))
            }
            return [
                { label: 'All environments', value: SELECT_ALL_VALUE },
                ...environmentsList.map((env) => ({
                    label: env.environment_name,
                    value: env.environmentIdentifier,
                })),
            ]
        }
        if (directRoleFilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
            const returnArr = []
            const envArr = directRoleFilter.environment.split(',')
            const envMap: Map<string, boolean> = new Map()
            envArr.forEach((element) => {
                const endsWithStar = element.endsWith(SELECT_ALL_VALUE)
                if (endsWithStar) {
                    const clusterName = element.slice(0, -3)
                    returnArr.push(...setClusterValues(endsWithStar, clusterName))
                } else {
                    envMap.set(element, true)
                }
            })
            // TODO (v3): Potential bug as nothing is returned from some
            if (envMap.size !== 0) {
                // eslint-disable-next-line array-callback-return
                envClustersList.some((element) => {
                    // eslint-disable-next-line no-unused-expressions
                    envMap.size !== 0 &&
                        // eslint-disable-next-line consistent-return, array-callback-return
                        element.environments.some((env) => {
                            if (envMap.get(env.environmentIdentifier)) {
                                returnArr.push({
                                    label: env.environmentName,
                                    value: env.environmentIdentifier,
                                    namespace: env.namespace,
                                    clusterName: element.clusterName,
                                })
                                envMap.delete(env.environmentName)
                                if (envMap.size === 0) {
                                    return true
                                }
                            }
                        })
                })
            }
            return returnArr
        }
        if (directRoleFilter.entity === EntityTypes.JOB) {
            if (directRoleFilter.environment) {
                return directRoleFilter.environment
                    .split(',')
                    .map((directRole) => ({ value: directRole, label: directRole }))
            }
            const environmentListWithClusterCdActive = environmentsList.filter((env) => env.isClusterCdActive)
            return [
                { label: 'All environments', value: SELECT_ALL_VALUE },
                {
                    label: DEFAULT_ENV,
                    value: DEFAULT_ENV,
                },
                ...environmentListWithClusterCdActive.map((env) => ({
                    label: env.environment_name,
                    value: env.environmentIdentifier,
                })),
            ]
        }
    }

    const populateDataFromAPI = async (roleFilters: APIRoleFilter[]) => {
        setIsLoading(true)

        const projectsMap = projectsList ? mapByKey(projectsList, 'name') : new Map()
        let foundDevtronApps = false
        let foundHelmApps = false
        let foundJobs = false
        const uniqueProjectIdsDevtronApps = []
        const uniqueProjectIdsHelmApps = []
        const uniqueProjectIdsJobs = []

        // Devtron apps, helm apps and jobs
        roleFilters?.forEach((roleFilter) => {
            const projectId = projectsMap.get(roleFilter.team)?.id
            if (projectId) {
                switch (roleFilter.entity) {
                    case EntityTypes.DIRECT:
                        if (roleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                            uniqueProjectIdsDevtronApps.push(projectId)
                        } else if (roleFilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                            uniqueProjectIdsHelmApps.push(projectId)
                        }
                        break
                    case EntityTypes.JOB:
                        uniqueProjectIdsJobs.push(projectId)
                        break
                    default:
                }
            }
        })

        await Promise.all([
            fetchAppList([...new Set(uniqueProjectIdsDevtronApps)].map(Number)),
            fetchAppListHelmApps([...new Set(uniqueProjectIdsHelmApps)].map(Number)),
            fetchJobsList([...new Set(uniqueProjectIdsJobs)].map(Number)),
        ])

        const directPermissions: DirectPermissionsRoleFilter[] = await Promise.all(
            roleFilters
                ?.filter(
                    (roleFilter: APIRoleFilter) =>
                        roleFilter.entity === EntityTypes.DIRECT || roleFilter.entity === EntityTypes.JOB,
                )
                ?.map(async (directRoleFilter: APIRoleFilter) => {
                    const projectId =
                        directRoleFilter.team !== HELM_APP_UNASSIGNED_PROJECT &&
                        projectsMap.get(directRoleFilter.team)?.id

                    // Fallback for access type
                    if (!directRoleFilter.accessType && directRoleFilter.entity !== EntityTypes.JOB) {
                        // eslint-disable-next-line no-param-reassign
                        directRoleFilter.accessType = ACCESS_TYPE_MAP.DEVTRON_APPS
                    }

                    if (directRoleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                        foundDevtronApps = true
                    } else if (directRoleFilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                        foundHelmApps = true
                    } else if (directRoleFilter.entity === EntityTypes.JOB) {
                        foundJobs = true
                    }

                    let jobNameToAppNameMapping = new Map()

                    if (directRoleFilter.entity === EntityTypes.JOB) {
                        const {
                            result: { jobContainers },
                        } = await getJobs({ teams: [projectId] })

                        jobNameToAppNameMapping = new Map(jobContainers.map((job) => [job.appName, job.jobName]))
                    }

                    const updatedEntityName = directRoleFilter?.entityName
                        ? directRoleFilter.entityName.split(',').map((entity) => ({
                              value: entity,
                              label:
                                  directRoleFilter.entity === EntityTypes.JOB
                                      ? jobNameToAppNameMapping.get(entity)
                                      : entity,
                          }))
                        : setAllApplication(directRoleFilter, projectId)

                    return {
                        ...directRoleFilter,
                        accessType: directRoleFilter.accessType,
                        action: { label: directRoleFilter.action, value: directRoleFilter.action },
                        team: { label: directRoleFilter.team, value: directRoleFilter.team },
                        entity: directRoleFilter.entity,
                        entityName: updatedEntityName,
                        environment: setAllEnv(directRoleFilter),
                        ...(directRoleFilter.entity === EntityTypes.JOB && {
                            workflow: directRoleFilter.workflow
                                ? directRoleFilter.workflow
                                      .split(',')
                                      .map((workflow) => ({ value: workflow, label: workflow }))
                                : await setAllWorkflows(updatedEntityName),
                        }),
                    } as DirectPermissionsRoleFilter
                }),
        )

        if (isNonEAMode) {
            if (!foundDevtronApps) {
                directPermissions.push(emptyDirectPermissionDevtronApps)
            }

            if (!foundJobs) {
                directPermissions.push(emptyDirectPermissionJobs)
            }
        }
        if (!foundHelmApps) {
            directPermissions.push(emptyDirectPermissionHelmApps)
        }
        setDirectPermission(directPermissions)

        // Chart Permissions
        const tempChartPermission: APIRoleFilter = roleFilters?.find(
            (roleFilter) => roleFilter.entity === EntityTypes.CHART_GROUP,
        )
        if (tempChartPermission) {
            const chartPermission: ChartGroupPermissionsFilter = {
                entity: EntityTypes.CHART_GROUP,
                entityName:
                    tempChartPermission?.entityName.split(',')?.map((entity) => ({ value: entity, label: entity })) ||
                    [],
                action:
                    tempChartPermission.action === SELECT_ALL_VALUE ? ActionTypes.ADMIN : tempChartPermission.action,
            }

            setChartPermission(chartPermission)
        }

        // K8s Permissions
        const _assignedRoleFilters: APIRoleFilter[] = roleFilters?.filter(
            (roleFilter) => roleFilter.entity === EntityTypes.CLUSTER,
        )
        if (_assignedRoleFilters) {
            const _k8sPermission = _assignedRoleFilters.map((k8s) => ({
                entity: EntityTypes.CLUSTER,
                cluster: { label: k8s.cluster, value: k8s.cluster },
                namespace: {
                    label: k8s.namespace === '' ? 'All Namespaces / Cluster' : k8s.namespace,
                    value: k8s.namespace === '' ? SELECT_ALL_VALUE : k8s.namespace,
                },
                group: { label: apiGroupAll(k8s.group, true), value: apiGroupAll(k8s.group) },
                action: { label: customRoles.possibleRolesMetaForCluster[k8s.action].value, value: k8s.action },
                kind: {
                    label: k8s.kind === '' ? 'All Kinds' : k8s.kind,
                    value: k8s.kind === '' ? SELECT_ALL_VALUE : k8s.kind,
                },
                resource: k8s.resource
                    .split(',')
                    ?.map((entity) => ({ value: entity || SELECT_ALL_VALUE, label: entity || 'All resources' })),
            }))

            if (currentK8sPermissionRef?.current) {
                currentK8sPermissionRef.current = [..._k8sPermission]
            }
            setK8sPermission(_k8sPermission)
        }

        setIsLoading(false)
    }

    // TODO (v3): Refactoring
    function setEnvValues(index, selectedValue, actionMeta, tempPermissions) {
        const { action, option, name } = actionMeta
        const { value, clusterName } = option || { value: '', clusterName: '' }
        const startsWithHash = value?.startsWith(ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE)
        if (value?.startsWith(SELECT_ALL_VALUE) || startsWithHash) {
            if (tempPermissions[index].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                const _clusterName = value.substring(1)
                // uncheck all environments
                tempPermissions[index][name] = tempPermissions[index][name]?.filter(
                    (env) =>
                        env.clusterName !== _clusterName &&
                        env.value !== `${ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE}${_clusterName}` &&
                        env.value !== `${SELECT_ALL_VALUE}${_clusterName}`,
                )
                if (action === 'select-option') {
                    // check all environments
                    tempPermissions[index][name] = [
                        ...tempPermissions[index][name],
                        ...setClusterValues(startsWithHash, _clusterName),
                    ]
                    tempPermissions[index]['environmentError'] = null
                }
            } else if (action === 'select-option') {
                // check all environments
                const environmentListWithClusterCdActive = environmentsList.filter((env) => env.isClusterCdActive)
                tempPermissions[index][name] = [
                    { label: 'All environments', value: SELECT_ALL_VALUE },
                    ...(tempPermissions[index].entity === EntityTypes.JOB
                        ? environmentListWithClusterCdActive
                        : environmentsList
                    ).map((env) => ({
                        label: env.environment_name,
                        value: env.environmentIdentifier,
                    })),
                ]
                if (tempPermissions[index].entity === EntityTypes.JOB) {
                    tempPermissions[index][name].push({
                        label: DEFAULT_ENV,
                        value: DEFAULT_ENV,
                    })
                }
                tempPermissions[index]['environmentError'] = null
            } else {
                // uncheck all environments
                tempPermissions[index][name] = []
            }
        } else {
            if (tempPermissions[index].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                tempPermissions[index][name] = selectedValue.filter(
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    ({ value }) =>
                        value !== `${SELECT_ALL_VALUE}${clusterName}` &&
                        value !== `${ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE}${clusterName}`,
                )
            } else {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                tempPermissions[index][name] = selectedValue.filter(({ value }) => value !== SELECT_ALL_VALUE)
            }

            tempPermissions[index]['environmentError'] = null
        }
    }

    const _fetchListForAccessType = (accessType: ACCESS_TYPE_MAP, projectId: number) => {
        switch (accessType) {
            case ACCESS_TYPE_MAP.DEVTRON_APPS:
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                fetchAppList([projectId])
                break
            case ACCESS_TYPE_MAP.HELM_APPS:
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                fetchAppListHelmApps([projectId])
                break
            case ACCESS_TYPE_MAP.JOBS:
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                fetchJobsList([projectId])
                break
            default:
                throw new Error(`Unknown access type ${accessType}`)
        }
    }

    const _handleEntityNameChange = (index, selectedValue, actionMeta, tempPermissions) => {
        const { action, option } = actionMeta

        const { value } = option || { value: '' }
        if (value === SELECT_ALL_VALUE) {
            if (action === 'select-option') {
                if (tempPermissions[index]['team'].value !== HELM_APP_UNASSIGNED_PROJECT) {
                    const projectId = projectsList.find(
                        (project) => project.name === tempPermissions[index]['team'].value,
                    ).id
                    const isJobs = tempPermissions[index].entity === EntityTypes.JOB
                    tempPermissions[index]['entityName'] = [
                        SELECT_ALL_OPTION,
                        ...getListForAccessType(tempPermissions[index].accessType)
                            .get(projectId)
                            .result.map((app) => ({
                                label: isJobs ? app.jobName : app.name,
                                value: isJobs ? app.appName : app.name,
                            })),
                    ]
                } else {
                    tempPermissions[index]['entityName'] = [SELECT_ALL_OPTION]
                }
                tempPermissions[index]['entityNameError'] = null
            } else {
                tempPermissions[index]['entityName'] = []
            }
        } else {
            const selectedOptions = selectedValue.filter(({ value: _value }) => _value !== SELECT_ALL_VALUE)
            tempPermissions[index]['entityName'] = selectedOptions
            tempPermissions[index]['entityNameError'] = null
        }
        if (tempPermissions[index].entity === EntityTypes.JOB) {
            tempPermissions[index]['workflow'] = []
        }
    }

    const _handleWorkflowChange = (index, selectedValue, actionMeta, workflowList, tempPermissions) => {
        const { action, option, name } = actionMeta
        const { value } = option || { value: '' }
        if (value === SELECT_ALL_VALUE) {
            if (action === 'select-option') {
                const allWorkflowOptions = workflowList?.options?.reduce((acc, _option) => {
                    return [...acc, ..._option.options]
                }, [])
                tempPermissions[index]['workflow'] = [SELECT_ALL_OPTION, ...(allWorkflowOptions || [])]
                tempPermissions[index].workflowError = null
            } else {
                tempPermissions[index]['workflow'] = []
            }
        } else {
            const selectedOptions = selectedValue.filter(({ value: _value }) => _value !== SELECT_ALL_VALUE)
            tempPermissions[index][name] = selectedOptions
            tempPermissions[index]['workflowError'] = null
        }
    }

    const _handleTeamChange = (index, selectedValue, actionMeta, tempPermissions) => {
        const { name } = actionMeta

        tempPermissions[index] = {
            ...tempPermissions[index],
            [name]: selectedValue,
            entityName: [],
            environment: [],
        }

        if (tempPermissions[index].workflow) {
            tempPermissions[index].workflow = []
        }
        if (tempPermissions[index].team.value !== HELM_APP_UNASSIGNED_PROJECT) {
            const projectId = projectsList.find((project) => project.name === tempPermissions[index].team.value).id
            _fetchListForAccessType(tempPermissions[index].accessType, projectId)
        }
    }

    // TODO (v3): Refactoring
    // TODO (v3): Use the Approver permission component from fe-lib and remove the redundant if(s)
    const handleDirectPermissionChange = (index, selectedValue, actionMeta, workflowList?) => {
        const { name } = actionMeta
        const tempPermissions = [...directPermission]
        if (name.includes('entityName')) {
            _handleEntityNameChange(index, selectedValue, actionMeta, tempPermissions)
        } else if (name === 'environment') {
            setEnvValues(index, selectedValue, actionMeta, tempPermissions)
        } else if (name === 'workflow') {
            _handleWorkflowChange(index, selectedValue, actionMeta, workflowList, tempPermissions)
        } else if (name === 'team') {
            _handleTeamChange(index, selectedValue, actionMeta, tempPermissions)
        } else if (name === APPROVER_ACTION.label) {
            tempPermissions[index][name] = !tempPermissions[index][name]
        } else if (name === CONFIG_APPROVER_ACTION.label) {
            tempPermissions[index]['action'].configApprover = !tempPermissions[index]['action'].configApprover
        } else {
            if (
                tempPermissions[index][name].configApprover ||
                tempPermissions[index][name].value.includes(CONFIG_APPROVER_ACTION.value)
            ) {
                selectedValue.configApprover = true
            }
            tempPermissions[index][name] = selectedValue
        }
        setDirectPermission(tempPermissions)
    }

    const removeDirectPermissionRow = (index) => {
        setDirectPermission((permission) => {
            let foundDevtronApps = false
            let foundHelmApps = false
            let foundJobs = false

            const permissionArr = permission.filter((perm, idx) => idx !== index)

            for (let i = 0; i < permissionArr.length; i++) {
                if (permissionArr[i].accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                    foundDevtronApps = true
                } else if (permissionArr[i].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                    foundHelmApps = true
                } else if (permissionArr[i].accessType === ACCESS_TYPE_MAP.JOBS) {
                    foundJobs = true
                }
            }

            if (isNonEAMode) {
                if (!foundDevtronApps) {
                    permissionArr.push(emptyDirectPermissionDevtronApps)
                }
                if (!foundJobs) {
                    permissionArr.push(emptyDirectPermissionJobs)
                }
            }
            if (!foundHelmApps) {
                permissionArr.push(emptyDirectPermissionHelmApps)
            }
            return permissionArr
        })
    }

    const addNewPermissionRowLocal = (accessType) => {
        switch (accessType) {
            case ACCESS_TYPE_MAP.DEVTRON_APPS:
                setDirectPermission((permission) => [...permission, emptyDirectPermissionDevtronApps])
                break
            case ACCESS_TYPE_MAP.HELM_APPS:
                setDirectPermission((permission) => [...permission, emptyDirectPermissionHelmApps])
                break
            case ACCESS_TYPE_MAP.JOBS:
                setDirectPermission((permission) => [...permission, emptyDirectPermissionJobs])
                break
            default:
                throw new Error(`Unsupported access type ${accessType}`)
        }
    }

    // To persist the search params
    const _getNavLinkUrl = (tabName) => (_location) => ({
        ..._location,
        pathname: `${url}/${tabName}`,
    })

    useEffect(() => {
        if (!isDataLoading) {
            if (!data) {
                const emptyPermissionArr = [
                    emptyDirectPermissionHelmApps,
                    emptyDirectPermissionDevtronApps,
                    emptyDirectPermissionJobs,
                ]
                setDirectPermission(emptyPermissionArr)
                return
            }
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            populateDataFromAPI(data?.roleFilters ?? [])
        }
    }, [data, isDataLoading])

    if (isDataLoading || isLoading) {
        return (
            <div className="show-shimmer-loading flexbox-col dc__gap-8 w-50">
                <div className="child child-shimmer-loading h-20" />
                <div className="child child-shimmer-loading w-80 h-20" />
                <div className="child child-shimmer-loading w-90 h-20" />
            </div>
        )
    }

    if (error) {
        return <GenericSectionErrorState withBorder reload={reload} />
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <ul className="tab-list dc__border-bottom">
                {navLinksConfig.map(
                    ({ isHidden, label, tabName }) =>
                        !isHidden && (
                            <li className="tab-list__tab" key={tabName}>
                                <NavLink
                                    to={_getNavLinkUrl(tabName)}
                                    data-testid={tabName}
                                    className="tab-list__tab-link pt-8 pb-6 pl-0 pr-0 fs-13 lh-20 cn-9 dc__capitalize"
                                    activeClassName="active"
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ),
                )}
            </ul>
            <div>
                <Switch>
                    {appPermissionDetailConfig.map(
                        ({ shouldRender = true, accessType, url: _url, id }) =>
                            shouldRender && (
                                <Route path={_url} key={id}>
                                    <AppPermissionDetail
                                        accessType={accessType}
                                        removeDirectPermissionRow={removeDirectPermissionRow}
                                        handleDirectPermissionChange={handleDirectPermissionChange}
                                        AddNewPermissionRow={addNewPermissionRowLocal}
                                        appsListHelmApps={appsListHelmApps}
                                        jobsList={jobsList}
                                        appsList={appsList}
                                        projectsList={projectsList}
                                        getEnvironmentOptions={_getEnvironmentOptions}
                                        environmentClusterOptions={environmentClusterOptions}
                                        getListForAccessType={getListForAccessType}
                                    />
                                </Route>
                            ),
                    )}
                    {superAdmin && (
                        <Route path={`${path}/kubernetes-objects`}>
                            <K8sPermissions />
                        </Route>
                    )}
                    {isNonEAMode && (
                        <Route path={`${path}/chart-groups`}>
                            <ChartPermission chartGroupsList={chartGroupsList} />
                        </Route>
                    )}
                    <Redirect
                        // Preserving the search params
                        to={{
                            ...location,
                            pathname: isNonEAMode ? `${path}/devtron-apps` : `${path}/helm-apps`,
                        }}
                    />
                </Switch>
            </div>
        </div>
    )
}

export default AppPermissions

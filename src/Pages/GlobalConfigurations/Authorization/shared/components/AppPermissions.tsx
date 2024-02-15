/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/button-has-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-nested-ternary */
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, Switch, Route, Redirect, useLocation, useRouteMatch } from 'react-router-dom'
import { GenericSectionErrorState, showError, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { APPROVER_ACTION, CONFIG_APPROVER_ACTION, ChartPermission, DirectPermission } from './userGroups/UserGroup'
import { ReactComponent as AddIcon } from '../../../../../assets/icons/ic-add.svg'
import { ACCESS_TYPE_MAP, HELM_APP_UNASSIGNED_PROJECT, SERVER_MODE } from '../../../../../config'
import {
    ActionTypes,
    APIRoleFilter,
    AppPermissionsDetailType,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
} from './userGroups/userGroups.types'
import { mapByKey, removeItemsFromArray } from '../../../../../components/common'
import { mainContext, useMainContext } from '../../../../../components/common/navigation/NavigationRoutes'
import K8sPermissions from './K8sObjectPermissions/K8sPermissions'
import { apiGroupAll } from './K8sObjectPermissions/K8sPermissions.utils'
import {
    getAllWorkflowsForAppNames,
    getEnvironmentListHelmApps,
    getEnvironmentListMin,
    getProjectFilteredApps,
} from '../../../../../services/service'
import { DEFAULT_ENV } from '../../../../../components/app/details/triggerView/Constants'
import { getJobs } from '../../../../../components/Jobs/Service'
import { useAuthorizationContext } from '../../AuthorizationProvider'
import { usePermissionConfiguration } from './PermissionConfigurationForm'
import { getProjectList } from '../../../../../components/project/service'
import { getChartGroups } from '../../../../../components/charts/charts.service'

// TODO (v4): Remove these once the code is refactored
const NAV_LINK_CLASS = 'tab-list__tab-link pt-8 pb-6 pl-0 pr-0 fs-13 lh-20 cn-9 dc__capitalize'
const PERMISSION_LABEL_CLASS = 'fw-6 fs-12 cn-7 dc__uppercase mb-0'

const AppPermissionDetail = ({
    accessType,
    handleDirectPermissionChange,
    removeDirectPermissionRow,
    AddNewPermissionRow,
    appsListHelmApps,
    appsList,
    jobsList,
    projectsList,
    environmentsList,
    envClustersList,
}: AppPermissionsDetailType) => {
    const { directPermission } = usePermissionConfiguration()
    return (
        <>
            <div
                className="w-100 pt-6 pb-6 display-grid"
                style={{
                    gridTemplateColumns:
                        accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                            ? '1fr 1fr 1fr 1fr 24px'
                            : accessType === ACCESS_TYPE_MAP.HELM_APPS
                              ? '1fr 2fr 1fr 1fr 24px'
                              : '1fr 1fr 1fr 1fr 1fr 24px',
                }}
            >
                <label className={PERMISSION_LABEL_CLASS}>Project</label>
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 3 : 0 }}
                >
                    Environment{accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'or cluster/namespace' : ''}
                </label>
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 1 : 0 }}
                >
                    {accessType === ACCESS_TYPE_MAP.JOBS ? 'Job Name' : 'Application'}
                </label>
                {accessType === ACCESS_TYPE_MAP.JOBS && (
                    <label
                        className={PERMISSION_LABEL_CLASS}
                        style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 2 : 0 }}
                    >
                        Workflow
                    </label>
                )}
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 4 : 0 }}
                >
                    {accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'Permission' : 'Role'}
                </label>
                <span style={{ order: 5 }} />
            </div>

            <div className="flexbox-col dc__gap-12">
                {directPermission.map(
                    (permission, idx) =>
                        permission.accessType === accessType && (
                            <div
                                className="w-100 dc__gap-14 display-grid"
                                style={{
                                    // TODO (v3): Move to CSS
                                    gridTemplateColumns:
                                        accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                            ? '1fr 1fr 1fr 1fr 24px'
                                            : accessType === ACCESS_TYPE_MAP.HELM_APPS
                                              ? '1fr 2fr 1fr 1fr 24px'
                                              : '1fr 1fr 1fr 1fr 1fr 24px',
                                }}
                            >
                                <DirectPermission
                                    index={idx}
                                    key={idx}
                                    permission={permission}
                                    removeRow={removeDirectPermissionRow}
                                    handleDirectPermissionChange={(value, actionMeta, workflowList?) =>
                                        handleDirectPermissionChange(idx, value, actionMeta, workflowList)
                                    }
                                    appsListHelmApps={appsListHelmApps}
                                    jobsList={jobsList}
                                    appsList={appsList}
                                    projectsList={projectsList}
                                    environmentsList={environmentsList}
                                    envClustersList={envClustersList}
                                />
                            </div>
                        ),
                )}
                <div>
                    <button
                        className="anchor flex left dc__gap-4 fs-13 lh-20 fw-6 p-0"
                        onClick={() => AddNewPermissionRow(accessType)}
                    >
                        <AddIcon className="icon-dim-20 fcb-5" />
                        Add Permission
                    </button>
                </div>
            </div>
        </>
    )
}

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

    const emptyDirectPermissionDevtronApps: DirectPermissionsRoleFilter = {
        entity: EntityTypes.DIRECT,
        entityName: [],
        environment: [],
        team: null,
        action: {
            label: '',
            value: ActionTypes.VIEW,
        },
        accessType: ACCESS_TYPE_MAP.DEVTRON_APPS,
    }
    const emptyDirectPermissionHelmApps = {
        ...emptyDirectPermissionDevtronApps,
        accessType: ACCESS_TYPE_MAP.HELM_APPS,
    }
    const emptyDirectPermissionJobs: DirectPermissionsRoleFilter = {
        ...emptyDirectPermissionDevtronApps,
        accessType: ACCESS_TYPE_MAP.JOBS,
        workflow: [],
        entity: EntityTypes.JOB,
    }
    const projectsList = configData?.[0]?.result ?? []
    const environmentsList = configData?.[1]?.result ?? []
    const chartGroupsList = configData?.[2]?.result?.groups ?? []
    const envClustersList = configData?.[3]?.result ?? []

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

    function setAllApplication(directRoleFilter: APIRoleFilter, projectId) {
        if (directRoleFilter.team !== HELM_APP_UNASSIGNED_PROJECT) {
            const isJobs = directRoleFilter.entity === EntityTypes.JOB
            return [
                { label: directRoleFilter.entity === EntityTypes.JOB ? 'All Jobs' : 'All applications', value: '*' },
                ...(
                    (directRoleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                        ? appsList
                        : isJobs
                          ? jobsList
                          : appsListHelmApps
                    ).get(projectId)?.result || []
                ).map((app) => {
                    return {
                        label: isJobs ? app.jobName : app.name,
                        value: isJobs ? app.appName : app.name,
                    }
                }),
            ]
        }
        return [{ label: 'All applications', value: '*' }]
    }

    async function setAllWorkflows(jobOptions) {
        const workflowOptions = []
        const jobNames = jobOptions.filter((job) => job.value !== '*').map((job) => job.label)
        const { result } = await getAllWorkflowsForAppNames(jobNames)
        const { appIdWorkflowNamesMapping } = result
        for (const jobName in appIdWorkflowNamesMapping) {
            workflowOptions.push({
                label: jobName,
                options: appIdWorkflowNamesMapping[jobName].map((workflow) => ({
                    label: workflow,
                    value: workflow,
                })),
            })
        }

        return [
            { label: 'All Workflows', value: '*' },
            ...workflowOptions.reduce((acc, option) => {
                return [...acc, ...option.options]
            }, []),
        ]
    }

    function setClusterValues(startsWithHash, clusterName) {
        const defaultValueArr = []
        if (startsWithHash) {
            defaultValueArr.push({
                label: `All existing + future environments in ${clusterName}`,
                value: `#${clusterName}`,
                namespace: '',
                clusterName: '',
            })
        }
        defaultValueArr.push({
            label: `All existing environments in ${clusterName}`,
            value: `*${clusterName}`,
            namespace: '',
            clusterName: '',
        })
        const selectedCluster = envClustersList?.filter((cluster) => cluster.clusterName === clusterName)[0]

        return [
            ...defaultValueArr,
            // eslint-disable-next-line no-unsafe-optional-chaining
            ...selectedCluster['environments']?.map((env) => ({
                label: env.environmentName,
                value: env.environmentIdentifier,
                namespace: env.namespace,
                clusterName,
            })),
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
                { label: 'All environments', value: '*' },
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
                const endsWithStar = element.endsWith('*')
                if (endsWithStar) {
                    const clusterName = element.slice(0, -3)
                    returnArr.push(...setClusterValues(endsWithStar, clusterName))
                } else {
                    envMap.set(element, true)
                }
            })
            envMap.size !== 0 &&
                envClustersList.some((element) => {
                    envMap.size !== 0 &&
                        // eslint-disable-next-line consistent-return
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
                { label: 'All environments', value: '*' },
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
        for (const element of roleFilters || []) {
            if (element.entity === EntityTypes.DIRECT) {
                const projectId = projectsMap.get(element.team)?.id
                if (typeof projectId !== 'undefined' && projectId != null) {
                    if (element['accessType'] === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                        uniqueProjectIdsDevtronApps.push(projectId)
                    } else if (element['accessType'] === ACCESS_TYPE_MAP.HELM_APPS) {
                        uniqueProjectIdsHelmApps.push(projectId)
                    }
                }
            } else if (element.entity === EntityTypes.JOB) {
                const projectId = projectsMap.get(element.team)?.id
                if (typeof projectId !== 'undefined' && projectId != null) {
                    uniqueProjectIdsJobs.push(projectId)
                }
            }
        }

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
                    if (!directRoleFilter['accessType'] && directRoleFilter.entity !== EntityTypes.JOB) {
                        directRoleFilter['accessType'] = ACCESS_TYPE_MAP.DEVTRON_APPS
                    }
                    if (directRoleFilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                        foundDevtronApps = true
                    } else if (directRoleFilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                        foundHelmApps = true
                    } else if (directRoleFilter.entity === EntityTypes.JOB) {
                        foundJobs = true
                    }
                    const jobNameToAppNameMapping = new Map()
                    if (directRoleFilter.entity === EntityTypes.JOB) {
                        const {
                            result: { jobContainers },
                        } = await getJobs({ teams: [projectId] })
                        jobContainers.forEach((job) => {
                            jobNameToAppNameMapping.set(job.appName, job.jobName)
                        })
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

        if (!foundDevtronApps && serverMode !== SERVER_MODE.EA_ONLY) {
            directPermissions.push(emptyDirectPermissionDevtronApps)
        }
        if (!foundHelmApps) {
            directPermissions.push(emptyDirectPermissionHelmApps)
        }
        if (!foundJobs) {
            directPermissions.push(emptyDirectPermissionJobs)
        }
        setDirectPermission(directPermissions)

        const tempChartPermission: APIRoleFilter = roleFilters?.find(
            (roleFilter) => roleFilter.entity === EntityTypes.CHART_GROUP,
        )
        if (tempChartPermission) {
            const chartPermission: ChartGroupPermissionsFilter = {
                entity: EntityTypes.CHART_GROUP,
                entityName:
                    tempChartPermission?.entityName.split(',')?.map((entity) => ({ value: entity, label: entity })) ||
                    [],
                action: tempChartPermission.action === '*' ? ActionTypes.ADMIN : tempChartPermission.action,
            }

            setChartPermission(chartPermission)
        }

        const _assignedRoleFilters: APIRoleFilter[] = roleFilters?.filter(
            (roleFilter) => roleFilter.entity === EntityTypes.CLUSTER,
        )
        if (_assignedRoleFilters) {
            const _k8sPermission = _assignedRoleFilters.map((k8s) => {
                return {
                    entity: EntityTypes.CLUSTER,
                    cluster: { label: k8s.cluster, value: k8s.cluster },
                    namespace: {
                        label: k8s.namespace === '' ? 'All Namespaces / Cluster' : k8s.namespace,
                        value: k8s.namespace === '' ? '*' : k8s.namespace,
                    },
                    group: { label: apiGroupAll(k8s.group, true), value: apiGroupAll(k8s.group) },
                    action: { label: customRoles.possibleRolesMetaForCluster[k8s.action].value, value: k8s.action },
                    kind: { label: k8s.kind === '' ? 'All Kinds' : k8s.kind, value: k8s.kind === '' ? '*' : k8s.kind },
                    resource: k8s.resource
                        .split(',')
                        ?.map((entity) => ({ value: entity || '*', label: entity || 'All resources' })),
                }
            })

            if (currentK8sPermissionRef?.current) {
                currentK8sPermissionRef.current = [..._k8sPermission]
            }
            setK8sPermission(_k8sPermission)
        }

        setIsLoading(false)
    }

    function setEnvValues(index, selectedValue, actionMeta, tempPermissions) {
        const { action, option, name } = actionMeta
        const { value, clusterName } = option || { value: '', clusterName: '' }
        const startsWithHash = value && value.startsWith('#')
        if ((value && value.startsWith('*')) || startsWithHash) {
            if (tempPermissions[index].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                const clusterName = value.substring(1)
                // uncheck all environments
                tempPermissions[index][name] = tempPermissions[index][name]?.filter(
                    (env) =>
                        env.clusterName !== clusterName &&
                        env.value !== `#${clusterName}` &&
                        env.value !== `*${clusterName}`,
                )
                if (action === 'select-option') {
                    // check all environments
                    tempPermissions[index][name] = [
                        ...tempPermissions[index][name],
                        ...setClusterValues(startsWithHash, clusterName),
                    ]
                    tempPermissions[index]['environmentError'] = null
                }
            } else if (action === 'select-option') {
                // check all environments
                const environmentListWithClusterCdActive = environmentsList.filter((env) => env.isClusterCdActive)
                tempPermissions[index][name] = [
                    { label: 'All environments', value: '*' },
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
                    ({ value }) => value !== `*${clusterName}` && value !== `#${clusterName}`,
                )
            } else {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                tempPermissions[index][name] = selectedValue.filter(({ value }) => value !== '*')
            }

            tempPermissions[index]['environmentError'] = null
        }
    }

    // TODO (v3): Use the Approver permission component from fe-lib and remove the redundant if(s)
    async function handleDirectPermissionChange(index, selectedValue, actionMeta, workflowList?) {
        const { action, option, name } = actionMeta
        const tempPermissions = [...directPermission]
        if (name.includes('entityName')) {
            const { value } = option || { value: '' }
            if (value === '*') {
                if (action === 'select-option') {
                    if (tempPermissions[index]['team'].value !== HELM_APP_UNASSIGNED_PROJECT) {
                        const projectId = projectsList.find(
                            (project) => project.name === tempPermissions[index]['team'].value,
                        ).id
                        tempPermissions[index]['entityName'] = [
                            { label: 'Select all', value: '*' },
                            ...(tempPermissions[index].accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                ? appsList
                                : tempPermissions[index].accessType === ACCESS_TYPE_MAP.JOBS
                                  ? jobsList
                                  : appsListHelmApps
                            )
                                .get(projectId)
                                .result.map((app) => {
                                    const isJobs = tempPermissions[index].entity === EntityTypes.JOB
                                    return {
                                        label: isJobs ? app.jobName : app.name,
                                        value: isJobs ? app.appName : app.name,
                                    }
                                }),
                        ]
                    } else {
                        tempPermissions[index]['entityName'] = [{ label: 'Select all', value: '*' }]
                    }
                    tempPermissions[index]['entityNameError'] = null
                } else {
                    tempPermissions[index]['entityName'] = []
                }
            } else {
                const selectedOptions = selectedValue.filter(({ value }) => value !== '*')
                tempPermissions[index]['entityName'] = selectedOptions
                tempPermissions[index]['entityNameError'] = null
            }
            if (tempPermissions[index].entity === EntityTypes.JOB) {
                tempPermissions[index]['workflow'] = []
            }
        } else if (name === 'environment') {
            setEnvValues(index, selectedValue, actionMeta, tempPermissions)
        } else if (name === 'workflow') {
            const { value } = option || { value: '' }
            if (value === '*') {
                if (action === 'select-option') {
                    const allWorkflowOptions = workflowList?.options?.reduce((acc, option) => {
                        return [...acc, ...option.options]
                    }, [])
                    tempPermissions[index]['workflow'] = [
                        { label: 'Select all', value: '*' },
                        ...(allWorkflowOptions || []),
                    ]
                    tempPermissions[index].workflowError = null
                } else {
                    tempPermissions[index]['workflow'] = []
                }
            } else {
                const selectedOptions = selectedValue.filter(({ value }) => value !== '*')
                tempPermissions[index][name] = selectedOptions
                tempPermissions[index]['workflowError'] = null
            }
        } else if (name === 'team') {
            tempPermissions[index][name] = selectedValue
            tempPermissions[index]['entityName'] = []
            tempPermissions[index]['environment'] = []
            if (tempPermissions[index]['workflow']) {
                tempPermissions[index]['workflow'] = []
            }
            if (tempPermissions[index]['team'].value !== HELM_APP_UNASSIGNED_PROJECT) {
                const projectId = projectsList.find(
                    (project) => project.name === tempPermissions[index]['team'].value,
                ).id
                tempPermissions[index].accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                    ? fetchAppList([projectId])
                    : tempPermissions[index].accessType === ACCESS_TYPE_MAP.JOBS
                      ? fetchJobsList([projectId])
                      : fetchAppListHelmApps([projectId])
            }
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

    function removeDirectPermissionRow(index) {
        setDirectPermission((permission) => {
            let foundDevtronApps = false
            let foundHelmApps = false
            let foundJobs = false

            const permissionArr = removeItemsFromArray(permission, index, 1)
            for (let i = 0; i < permissionArr.length; i++) {
                if (permissionArr[i].accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                    foundDevtronApps = true
                } else if (permissionArr[i].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                    foundHelmApps = true
                } else if (permissionArr[i].accessType === ACCESS_TYPE_MAP.JOBS) {
                    foundJobs = true
                }
            }
            if (!foundDevtronApps && serverMode !== SERVER_MODE.EA_ONLY) {
                permissionArr.push(emptyDirectPermissionDevtronApps)
            }
            if (!foundHelmApps) {
                permissionArr.push(emptyDirectPermissionHelmApps)
            }
            if (!foundJobs) {
                permissionArr.push(emptyDirectPermissionJobs)
            }
            return permissionArr
        })
    }

    function AddNewPermissionRowLocal(accessType) {
        if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
            setDirectPermission((permission) => [...permission, emptyDirectPermissionDevtronApps])
        } else if (accessType === ACCESS_TYPE_MAP.HELM_APPS) {
            setDirectPermission((permission) => [...permission, emptyDirectPermissionHelmApps])
        } else if (accessType === ACCESS_TYPE_MAP.JOBS) {
            setDirectPermission((permission) => [...permission, emptyDirectPermissionJobs])
        }
    }

    // To persist the search params
    const _getNavLinkUrl = (tabName) => (location) => ({
        ...location,
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
            populateDataFromAPI(data?.roleFilters ?? [])
        }
    }, [data, isDataLoading])

    if (isDataLoading || isLoading) {
        return (
            <div className="show-shimmer-loading flexbox-col dc__gap-8 w-50">
                <div className="child child-shimmer-loading" />
                <div className="child child-shimmer-loading w-80" />
                <div className="child child-shimmer-loading w-90" />
            </div>
        )
    }

    if (error) {
        return <GenericSectionErrorState withBorder reload={reload} />
    }

    return (
        <div className="flexbox-col dc__gap-12">
            <ul role="tablist" className="tab-list dc__border-bottom">
                {serverMode !== SERVER_MODE.EA_ONLY && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('devtron-apps')}
                            data-testid="devtron-app-permission-tab"
                            className={NAV_LINK_CLASS}
                            activeClassName="active"
                        >
                            Devtron Apps
                        </NavLink>
                    </li>
                )}
                <li className="tab-list__tab">
                    <NavLink
                        to={_getNavLinkUrl('helm-apps')}
                        data-testid="helm-app-permission-tab"
                        className={NAV_LINK_CLASS}
                        activeClassName="active"
                    >
                        Helm Apps
                    </NavLink>
                </li>
                {serverMode !== SERVER_MODE.EA_ONLY && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('jobs')}
                            data-testid="jobs-permission-tab"
                            className={NAV_LINK_CLASS}
                            activeClassName="active"
                        >
                            Jobs
                        </NavLink>
                    </li>
                )}

                {superAdmin && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('kubernetes-objects')}
                            data-testid="kube-resource-permission-tab"
                            className={NAV_LINK_CLASS}
                            activeClassName="active"
                        >
                            Kubernetes Resources
                        </NavLink>
                    </li>
                )}
                {serverMode !== SERVER_MODE.EA_ONLY && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('chart-groups')}
                            data-testid="chart-group-permission-tab"
                            className={NAV_LINK_CLASS}
                            activeClassName="active"
                        >
                            Chart Groups
                        </NavLink>
                    </li>
                )}
            </ul>
            <div>
                <Switch>
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <Route path={`${path}/devtron-apps`}>
                            <AppPermissionDetail
                                accessType={ACCESS_TYPE_MAP.DEVTRON_APPS}
                                removeDirectPermissionRow={removeDirectPermissionRow}
                                handleDirectPermissionChange={handleDirectPermissionChange}
                                AddNewPermissionRow={AddNewPermissionRowLocal}
                                appsListHelmApps={appsListHelmApps}
                                jobsList={jobsList}
                                appsList={appsList}
                                projectsList={projectsList}
                                environmentsList={environmentsList}
                                envClustersList={envClustersList}
                            />
                        </Route>
                    )}
                    <Route path={`${path}/helm-apps`}>
                        <AppPermissionDetail
                            accessType={ACCESS_TYPE_MAP.HELM_APPS}
                            removeDirectPermissionRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={handleDirectPermissionChange}
                            AddNewPermissionRow={AddNewPermissionRowLocal}
                            appsListHelmApps={appsListHelmApps}
                            jobsList={jobsList}
                            appsList={appsList}
                            projectsList={projectsList}
                            environmentsList={environmentsList}
                            envClustersList={envClustersList}
                        />
                    </Route>
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <Route path={`${path}/jobs`}>
                            <AppPermissionDetail
                                accessType={ACCESS_TYPE_MAP.JOBS}
                                removeDirectPermissionRow={removeDirectPermissionRow}
                                handleDirectPermissionChange={handleDirectPermissionChange}
                                AddNewPermissionRow={AddNewPermissionRowLocal}
                                appsListHelmApps={appsListHelmApps}
                                jobsList={jobsList}
                                appsList={appsList}
                                projectsList={projectsList}
                                environmentsList={environmentsList}
                                envClustersList={envClustersList}
                            />
                        </Route>
                    )}
                    {superAdmin && (
                        <Route path={`${path}/kubernetes-objects`}>
                            <K8sPermissions />
                        </Route>
                    )}
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <Route path={`${path}/chart-groups`}>
                            <ChartPermission chartGroupsList={chartGroupsList} />
                        </Route>
                    )}
                    <Redirect
                        // Preserving the search params
                        to={{
                            ...location,
                            pathname: serverMode !== SERVER_MODE.EA_ONLY ? `${path}/devtron-apps` : `${path}/helm-apps`,
                        }}
                    />
                </Switch>
            </div>
        </div>
    )
}

export default AppPermissions

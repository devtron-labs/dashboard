import React, { useContext, useEffect } from 'react'
import { NavLink, Switch, Route, Redirect, useLocation } from 'react-router-dom'
import {
    APPROVER_ACTION,
    CONFIG_APPROVER_ACTION,
    ChartPermission,
    DirectPermission,
    useUserGroupContext,
} from './UserGroup'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import { useRouteMatch } from 'react-router'
import { ACCESS_TYPE_MAP, HELM_APP_UNASSIGNED_PROJECT, SERVER_MODE } from '../../config'
import {
    ActionTypes,
    APIRoleFilter,
    AppPermissionsDetailType,
    AppPermissionsType,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
} from './userGroups.types'
import { mapByKey, removeItemsFromArray } from '../common'
import { mainContext } from '../common/navigation/NavigationRoutes'
import K8sPermissons from './K8sObjectPermissions/K8sPermissons'
import { apiGroupAll } from './K8sObjectPermissions/K8sPermissions.utils'
import { getAllWorkflowsForAppNames } from '../../services/service'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'
import { getJobs } from '../Jobs/Service'

export default function AppPermissions({
    data = null,
    directPermission,
    setDirectPermission,
    chartPermission,
    setChartPermission,
    hideInfoLegend,
    k8sPermission,
    setK8sPermission,
    currentK8sPermissionRef,
}: AppPermissionsType) {
    const { serverMode } = useContext(mainContext)
    const {
        appsList,
        fetchAppList,
        projectsList,
        environmentsList,
        envClustersList,
        fetchAppListHelmApps,
        appsListHelmApps,
        fetchJobsList,
        jobsList,
        superAdmin,
    } = useUserGroupContext()
    const { url, path } = useRouteMatch()
    const location = useLocation()
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
    useEffect(() => {
        if (!data) {
            const emptyPermissionArr = [
                emptyDirectPermissionHelmApps,
                emptyDirectPermissionDevtronApps,
                emptyDirectPermissionJobs,
            ]
            setDirectPermission(emptyPermissionArr)
            return
        }
        populateDataFromAPI(data.roleFilters ?? [])
    }, [data])
    const { customRoles } = useUserGroupContext()
    function setAllApplication(directRolefilter: APIRoleFilter, projectId) {
        if (directRolefilter.team !== HELM_APP_UNASSIGNED_PROJECT) {
            const isJobs = directRolefilter.entity === EntityTypes.JOB
            return [
                { label: directRolefilter.entity === EntityTypes.JOB ? 'All Jobs' : 'All applications', value: '*' },
                ...(
                    (directRolefilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
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
        } else {
            return [{ label: 'All applications', value: '*' }]
        }
    }

    async function setAllWorkflows(jobOptions) {
        let jobNames
        let appIdWorkflowNamesMapping
        let workflowOptions = []
        jobNames = jobOptions.filter((job) => job.value !== '*').map((job) => job.label)
        const { result } = await getAllWorkflowsForAppNames(jobNames)
        appIdWorkflowNamesMapping = result.appIdWorkflowNamesMapping
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

    function setAllEnv(directRolefilter: APIRoleFilter) {
        if (directRolefilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
            if (directRolefilter.environment) {
                return directRolefilter.environment
                    .split(',')
                    .map((directRole) => ({ value: directRole, label: directRole }))
            } else {
                return [
                    { label: 'All environments', value: '*' },
                    ...environmentsList.map((env) => ({
                        label: env.environment_name,
                        value: env.environmentIdentifier,
                    })),
                ]
            }
        } else if (directRolefilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
            let returnArr = []
            let envArr = directRolefilter.environment.split(',')
            let envMap: Map<string, boolean> = new Map()
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
        } else if (directRolefilter.entity === EntityTypes.JOB) {
            if (directRolefilter.environment) {
                return directRolefilter.environment
                    .split(',')
                    .map((directRole) => ({ value: directRole, label: directRole }))
            } else {
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
    }

    async function populateDataFromAPI(roleFilters: APIRoleFilter[]) {
        const projectsMap = projectsList ? mapByKey(projectsList, 'name') : new Map()
        let foundDevtronApps = false,
            foundHelmApps = false,
            foundJobs = false,
            uniqueProjectIdsDevtronApps = [],
            uniqueProjectIdsHelmApps = [],
            uniqueProjectIdsJobs = []
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
                ?.map(async (directRolefilter: APIRoleFilter, index: number) => {
                    const projectId =
                        directRolefilter.team !== HELM_APP_UNASSIGNED_PROJECT &&
                        projectsMap.get(directRolefilter.team)?.id
                    if (!directRolefilter['accessType'] && directRolefilter.entity !== EntityTypes.JOB) {
                        directRolefilter['accessType'] = ACCESS_TYPE_MAP.DEVTRON_APPS
                    }
                    if (directRolefilter.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                        foundDevtronApps = true
                    } else if (directRolefilter.accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                        foundHelmApps = true
                    } else if (directRolefilter.entity === EntityTypes.JOB) {
                        foundJobs = true
                    }
                    const jobNameToAppNameMapping = new Map()
                    if (directRolefilter.entity === EntityTypes.JOB) {
                        const {
                            result: { jobContainers },
                        } = await getJobs({ teams: [projectId] })
                        jobContainers.forEach((job) => {
                            jobNameToAppNameMapping.set(job.appName, job.jobName)
                        })
                    }
                    const updatedEntityName = directRolefilter?.entityName
                        ? directRolefilter.entityName.split(',').map((entity) => ({
                              value: entity,
                              label:
                                  directRolefilter.entity === EntityTypes.JOB
                                      ? jobNameToAppNameMapping.get(entity)
                                      : entity,
                          }))
                        : setAllApplication(directRolefilter, projectId)

                    return {
                        ...directRolefilter,
                        accessType: directRolefilter.accessType,
                        action: { label: directRolefilter.action, value: directRolefilter.action },
                        team: { label: directRolefilter.team, value: directRolefilter.team },
                        entity: directRolefilter.entity,
                        entityName: updatedEntityName,
                        environment: setAllEnv(directRolefilter),
                        ...(directRolefilter.entity === EntityTypes.JOB && {
                            workflow: directRolefilter.workflow
                                ? directRolefilter.workflow
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
    }

    function setClusterValues(startsWithHash, clusterName) {
        let defaultValueArr = []
        if (startsWithHash) {
            defaultValueArr.push({
                label: 'All existing + future environments in ' + clusterName,
                value: '#' + clusterName,
                namespace: '',
                clusterName: '',
            })
        }
        defaultValueArr.push({
            label: 'All existing environments in ' + clusterName,
            value: '*' + clusterName,
            namespace: '',
            clusterName: '',
        })
        const selectedCluster = envClustersList?.filter((cluster) => cluster.clusterName === clusterName)[0]

        return [
            ...defaultValueArr,
            ...selectedCluster['environments']?.map((env) => ({
                label: env.environmentName,
                value: env.environmentIdentifier,
                namespace: env.namespace,
                clusterName: clusterName,
            })),
        ]
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
                        env.value !== '#' + clusterName &&
                        env.value !== '*' + clusterName,
                )
                if (action === 'select-option') {
                    // check all environments
                    tempPermissions[index][name] = [
                        ...tempPermissions[index][name],
                        ...setClusterValues(startsWithHash, clusterName),
                    ]
                    tempPermissions[index]['environmentError'] = null
                }
            } else {
                if (action === 'select-option') {
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
            }
        } else {
            if (tempPermissions[index].accessType === ACCESS_TYPE_MAP.HELM_APPS) {
                tempPermissions[index][name] = selectedValue.filter(
                    ({ value, label }) => value !== '*' + clusterName && value !== '#' + clusterName,
                )
            } else {
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*')
            }

            tempPermissions[index]['environmentError'] = null
        }
    }

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
                        tempPermissions[index][name] = [{ label: 'Select all', value: '*' }]
                    }
                    tempPermissions[index]['entityNameError'] = null
                } else {
                    tempPermissions[index]['entityName'] = []
                }
            } else {
                const selectedOptions = selectedValue.filter(({ value, label }) => value !== '*')
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
                const selectedOptions = selectedValue.filter(({ value, label }) => value !== '*')
                tempPermissions[index][name] = selectedOptions
                tempPermissions[index]['workflowError'] = null
            }
        } else if (name === 'team') {
            tempPermissions[index][name] = selectedValue
            tempPermissions[index]['entityName'] = []
            tempPermissions[index]['environment'] = []
            if (tempPermissions[index]['workflow']) tempPermissions[index]['workflow'] = []
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
            let foundDevtronApps = false,
                foundHelmApps = false,
                foundJobs = false

            let permissionArr = removeItemsFromArray(permission, index, 1)
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

    return (
        <>
            <ul role="tablist" className="tab-list mt-12 dc__border-bottom">
                {serverMode !== SERVER_MODE.EA_ONLY && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('devtron-apps')}
                            data-testid="devtron-app-permission-tab"
                            className="tab-list__tab-link"
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
                        className="tab-list__tab-link"
                        activeClassName="active"
                    >
                        Helm Apps
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        to={_getNavLinkUrl('jobs')}
                        data-testid="jobs-permission-tab"
                        className="tab-list__tab-link"
                        activeClassName="active"
                    >
                        Jobs
                    </NavLink>
                </li>
                {superAdmin && (
                    <li className="tab-list__tab">
                        <NavLink
                            to={_getNavLinkUrl('kubernetes-objects')}
                            data-testid="kube-resource-permission-tab"
                            className="tab-list__tab-link"
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
                            className="tab-list__tab-link"
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
                                directPermission={directPermission}
                                hideInfoLegend={hideInfoLegend}
                            />
                        </Route>
                    )}
                    <Route path={`${path}/helm-apps`}>
                        <AppPermissionDetail
                            accessType={ACCESS_TYPE_MAP.HELM_APPS}
                            removeDirectPermissionRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={handleDirectPermissionChange}
                            AddNewPermissionRow={AddNewPermissionRowLocal}
                            directPermission={directPermission}
                            hideInfoLegend={hideInfoLegend}
                        />
                    </Route>
                    <Route path={`${path}/jobs`}>
                        <AppPermissionDetail
                            accessType={ACCESS_TYPE_MAP.JOBS}
                            removeDirectPermissionRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={handleDirectPermissionChange}
                            AddNewPermissionRow={AddNewPermissionRowLocal}
                            directPermission={directPermission}
                            hideInfoLegend={hideInfoLegend}
                        />
                    </Route>
                    {superAdmin && (
                        <Route path={`${path}/kubernetes-objects`}>
                            <K8sPermissons k8sPermission={k8sPermission} setK8sPermission={setK8sPermission} />
                        </Route>
                    )}
                    {serverMode !== SERVER_MODE.EA_ONLY && (
                        <Route path={`${path}/chart-groups`}>
                            <ChartPermission
                                chartPermission={chartPermission}
                                setChartPermission={setChartPermission}
                                hideInfoLegend={hideInfoLegend}
                            />
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
        </>
    )
}

function AppPermissionDetail({
    accessType,
    handleDirectPermissionChange,
    removeDirectPermissionRow,
    AddNewPermissionRow,
    directPermission,
    hideInfoLegend,
}: AppPermissionsDetailType) {
    return (
        <>
            {!hideInfoLegend && accessType !== ACCESS_TYPE_MAP.JOBS && (
                <legend>
                    {accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                        ? 'Manage permission for custom apps created using devtron'
                        : 'Manage permission for helm apps deployed from devtron or outside devtron'}
                </legend>
            )}
            <div
                className="w-100 mt-16"
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                            ? '1fr 1fr 1fr 1fr 24px'
                            : accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? '1fr 2fr 1fr 1fr 24px'
                            : '1fr 1fr 1fr 1fr 1fr 24px',
                }}
            >
                <label className="fw-6 fs-12 cn-5">Project</label>
                <label className="fw-6 fs-12 cn-5" style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 3 : 0 }}>
                    Environment{accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'or cluster/namespace' : ''}
                </label>
                <label className="fw-6 fs-12 cn-5" style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 1 : 0 }}>
                    {accessType === ACCESS_TYPE_MAP.JOBS ? 'Job Name' : 'Application'}
                </label>
                {accessType === ACCESS_TYPE_MAP.JOBS && (
                    <label className="fw-6 fs-12 cn-5" style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 2 : 0 }}>
                        Workflow
                    </label>
                )}
                <label className="fw-6 fs-12 cn-5" style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 4 : 0 }}>
                    {accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'Permission' : 'Role'}
                </label>
                <span style={{ order: 5 }} />
            </div>

            {directPermission.map(
                (permission, idx) =>
                    permission.accessType === accessType && (
                        <div
                            className="w-100 mb-16 dc__gap-14"
                            style={{
                                display: 'grid',
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
                            />
                        </div>
                    ),
            )}
            <b
                className="anchor pointer flex left"
                style={{ width: '90px' }}
                onClick={(e) => AddNewPermissionRow(accessType)}
            >
                <AddIcon className="add-svg mr-12" /> Add row
            </b>
        </>
    )
}

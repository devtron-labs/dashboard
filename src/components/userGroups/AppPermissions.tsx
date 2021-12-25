import React, { useEffect } from 'react';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { ChartPermission, DirectPermission, useUserGroupContext } from './UserGroup';
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg';
import { useRouteMatch } from 'react-router';
import { AccessTypeMap } from '../../config';
import {
    ActionTypes,
    APIRoleFilter,
    ChartGroupPermissionsFilter,
    CreateGroup,
    CreateUser,
    DirectPermissionsRoleFilter,
    EntityTypes,
} from './userGroups.types';
import { mapByKey, removeItemsFromArray } from '../common';
interface AppPermissionsType {
    data: CreateGroup | CreateUser;
    directPermission: DirectPermissionsRoleFilter[];
    setDirectPermission: (...rest) => void;
    chartPermission: ChartGroupPermissionsFilter;
    setChartPermission: (ChartGroupPermissionsFilter: ChartGroupPermissionsFilter) => void;
}
interface AppPermissionsDetailType {
    accessType: AccessTypeMap.DEVTRON_APPS | AccessTypeMap.HELM_APPS;
    handleDirectPermissionChange: (...rest) => void;
    removeDirectPermissionRow: (index: number) => void;
    AddNewPermissionRow: (accessType: AccessTypeMap.DEVTRON_APPS | AccessTypeMap.HELM_APPS) => void;
    directPermission: DirectPermissionsRoleFilter[];
}

export default function AppPermissions({
    data = null,
    directPermission,
    setDirectPermission,
    chartPermission,
    setChartPermission,
}: AppPermissionsType) {
    const { appsList, fetchAppList, projectsList, environmentsList } = useUserGroupContext();
    const { url, path } = useRouteMatch();
    const emptyDirectPermissionDevtronApps: DirectPermissionsRoleFilter = {
        entity: EntityTypes.DIRECT,
        entityName: [],
        environment: [],
        team: null,
        action: {
            label: '',
            value: ActionTypes.VIEW,
        },
        accessType: AccessTypeMap.DEVTRON_APPS,
    };
    const emptyDirectPermissionHelmApps = {
        ...emptyDirectPermissionDevtronApps,
        accessType: AccessTypeMap.HELM_APPS,
    };
    useEffect(() => {
        if (!data) {
            setDirectPermission([emptyDirectPermissionDevtronApps, emptyDirectPermissionHelmApps]);
            return;
        }
        populateDataFromAPI(data.roleFilters);
    }, [data]);

    async function populateDataFromAPI(roleFilters: APIRoleFilter[]) {
        const allProjects = roleFilters.map((roleFilter) => roleFilter.team).filter(Boolean);
        const projectsMap = mapByKey(projectsList, 'name');
        const allProjectIds = allProjects.map((p) => projectsMap.get(p).id);
        const uniqueProjectIds = Array.from(new Set(allProjectIds));
        await fetchAppList(uniqueProjectIds);
        let foundDevtronApps = false,
            foundHelmApps = false;
        const directPermissions: DirectPermissionsRoleFilter[] = roleFilters
            ?.filter((roleFilter: APIRoleFilter) => roleFilter.entity === EntityTypes.DIRECT)
            ?.map((directRolefilter: APIRoleFilter, index: number) => {
                const projectId = projectsMap.get(directRolefilter.team).id;
                directRolefilter['accessType'] = index % 2 === 0 ? AccessTypeMap.DEVTRON_APPS : AccessTypeMap.HELM_APPS;
                if (directRolefilter.accessType === AccessTypeMap.DEVTRON_APPS) {
                    foundDevtronApps = true;
                } else if (directRolefilter.accessType === AccessTypeMap.HELM_APPS) {
                    foundHelmApps = true;
                }
                return {
                    ...directRolefilter,
                    action: { label: directRolefilter.action, value: directRolefilter.action },
                    team: { label: directRolefilter.team, value: directRolefilter.team },
                    entity: EntityTypes.DIRECT,
                    entityName: directRolefilter?.entityName
                        ? directRolefilter.entityName.split(',').map((entity) => ({ value: entity, label: entity }))
                        : [
                              { label: 'All applications', value: '*' },
                              ...(appsList.get(projectId)?.result || []).map((app) => ({
                                  label: app.name,
                                  value: app.name,
                              })),
                          ],
                    environment: directRolefilter.environment
                        ? directRolefilter.environment
                              .split(',')
                              .map((directRole) => ({ value: directRole, label: directRole }))
                        : [
                              { label: 'All environments', value: '*' },
                              ...environmentsList.map((env) => ({
                                  label: env.environment_name,
                                  value: env.environment_name,
                              })),
                          ],
                } as DirectPermissionsRoleFilter;
            });
        if (!foundDevtronApps) {
            directPermissions.push(emptyDirectPermissionDevtronApps);
        }
        if (!foundHelmApps) {
            directPermissions.push(emptyDirectPermissionHelmApps);
        }
        setDirectPermission(directPermissions);

        const tempChartPermission: APIRoleFilter = roleFilters?.find(
            (roleFilter) => roleFilter.entity === EntityTypes.CHART_GROUP,
        );
        if (tempChartPermission) {
            const chartPermission: ChartGroupPermissionsFilter = {
                entity: EntityTypes.CHART_GROUP,
                entityName:
                    tempChartPermission?.entityName.split(',')?.map((entity) => ({ value: entity, label: entity })) ||
                    [],
                action: tempChartPermission.action === '*' ? ActionTypes.ADMIN : tempChartPermission.action,
            };

            setChartPermission(chartPermission);
        }
    }

    function handleDirectPermissionChange(index, selectedValue, actionMeta) {
        const { action, option, name } = actionMeta;
        const tempPermissions = [...directPermission];
        if (name === 'entityName') {
            const { label, value } = option;
            if (value === '*') {
                if (action === 'select-option') {
                    const projectId = projectsList.find(
                        (project) => project.name === tempPermissions[index]['team'].value,
                    ).id;
                    tempPermissions[index][name] = [
                        { label: 'Select all', value: '*' },
                        ...appsList.get(projectId).result.map((app) => ({ label: app.name, value: app.name })),
                    ];
                    tempPermissions[index]['entityNameError'] = null;
                } else {
                    tempPermissions[index][name] = [];
                }
            } else {
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*');
                tempPermissions[index]['entityNameError'] = null;
            }
        } else if (name === 'environment') {
            const { label, value } = option;
            if (value === '*') {
                if (action === 'select-option') {
                    // check all environments
                    tempPermissions[index][name] = [
                        { label: 'All environments', value: '*' },
                        ...environmentsList.map((env) => ({
                            label: env.environment_name,
                            value: env.environment_name,
                        })),
                    ];
                    tempPermissions[index]['environmentError'] = null;
                } else {
                    // uncheck all environments
                    tempPermissions[index][name] = [];
                }
            } else {
                tempPermissions[index][name] = selectedValue.filter(({ value, label }) => value !== '*');
                tempPermissions[index]['environmentError'] = null;
            }
        } else if (name === 'team') {
            tempPermissions[index][name] = selectedValue;
            const projectId = projectsList.find((project) => project.name === tempPermissions[index]['team'].value).id;
            tempPermissions[index]['entityName'] = [];
            tempPermissions[index]['environment'] = [];
            fetchAppList([projectId]);
        } else {
            tempPermissions[index][name] = selectedValue;
        }
        setDirectPermission(tempPermissions);
    }

    function removeDirectPermissionRow(index) {
        if (index === 0 && directPermission.length === 1) {
            setDirectPermission([emptyDirectPermissionDevtronApps]);
        } else {
            setDirectPermission((permission) => removeItemsFromArray(permission, index, 1));
        }
    }

    function AddNewPermissionRowLocal(accessType) {
        if (accessType === AccessTypeMap.DEVTRON_APPS) {
            setDirectPermission((permission) => [...permission, emptyDirectPermissionDevtronApps]);
        } else if (accessType === AccessTypeMap.HELM_APPS) {
            setDirectPermission((permission) => [...permission, emptyDirectPermissionHelmApps]);
        }
    }

    return (
        <>
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab">
                    <NavLink to={`${url}/devtron-apps`} className="tab-list__tab-link" activeClassName="active">
                        Devtron Apps
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink to={`${url}/helm-apps`} className="tab-list__tab-link" activeClassName="active">
                        Helm Apps
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink to={`${url}/chart-groups`} className="tab-list__tab-link" activeClassName="active">
                        Chart Groups
                    </NavLink>
                </li>
            </ul>
            <div>
                <Switch>
                    <Route path={`${path}/devtron-apps`}>
                        <AppPermissionDetail
                            accessType={AccessTypeMap.DEVTRON_APPS}
                            removeDirectPermissionRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={handleDirectPermissionChange}
                            AddNewPermissionRow={AddNewPermissionRowLocal}
                            directPermission={directPermission}
                        />
                    </Route>
                    <Route path={`${path}/helm-apps`}>
                        <AppPermissionDetail
                            accessType={AccessTypeMap.HELM_APPS}
                            removeDirectPermissionRow={removeDirectPermissionRow}
                            handleDirectPermissionChange={handleDirectPermissionChange}
                            AddNewPermissionRow={AddNewPermissionRowLocal}
                            directPermission={directPermission}
                        />
                    </Route>
                    <Route path={`${path}/chart-groups`}>
                        <ChartPermission chartPermission={chartPermission} setChartPermission={setChartPermission} />
                    </Route>
                    <Redirect to={`${path}/devtron-apps`} />
                </Switch>
            </div>
        </>
    );
}

function AppPermissionDetail({
    accessType,
    handleDirectPermissionChange,
    removeDirectPermissionRow,
    AddNewPermissionRow,
    directPermission,
}: AppPermissionsDetailType) {
    return (
        <>
            <legend>{accessType === AccessTypeMap.DEVTRON_APPS ? 'Direct ' : 'Manage '}permissions</legend>
            <div
                className="w-100 mb-26"
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        accessType === AccessTypeMap.DEVTRON_APPS ? '1fr 1fr 1fr 1fr 24px' : '1fr 2fr 1fr 1fr 24px',
                    gridGap: '16px',
                }}
            >
                <label className="fw-6 fs-12 cn-5">Project</label>
                <label className="fw-6 fs-12 cn-5">
                    Environment{accessType === AccessTypeMap.DEVTRON_APPS ? '' : ' or cluster/namespace'}
                </label>
                <label className="fw-6 fs-12 cn-5">Application</label>
                <label className="fw-6 fs-12 cn-5">
                    {accessType === AccessTypeMap.DEVTRON_APPS ? 'Role' : 'Permission'}
                </label>
                <span />
                {directPermission.map(
                    (permission, idx) =>
                        permission.accessType === accessType && (
                            <DirectPermission
                                index={idx}
                                key={idx}
                                permission={permission}
                                removeRow={removeDirectPermissionRow}
                                handleDirectPermissionChange={(value, actionMeta) =>
                                    handleDirectPermissionChange(idx, value, actionMeta)
                                }
                            />
                        ),
                )}
            </div>
            <b
                className="anchor pointer flex left"
                style={{ width: '90px' }}
                onClick={(e) => AddNewPermissionRow(accessType)}
            >
                <AddIcon className="add-svg mr-12" /> Add row
            </b>
        </>
    );
}

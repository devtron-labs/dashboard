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

import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Switch, Route, Redirect, useParams, useRouteMatch } from 'react-router-dom'
import {
    showError,
    Progressing,
    stopPropagation,
    OptionType,
    DeleteDialog,
    ErrorScreenManager,
    ResourceKindType,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { MultiValue } from 'react-select'
import { ErrorBoundary, sortOptionsByLabel } from '../../common'
import { APP_TYPE, URLS } from '../../../config'
import AppConfig from '../../../Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import { getAppMetaInfo } from '../service'
import { AppMetaInfo } from '../types'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import { AppDetailsProps } from './triggerView/types'
import Overview from '../Overview/Overview'
import { AppHeader } from './AppHeader'
import './appDetails/appDetails.scss'
import './app.scss'
import { AppFilterTabs } from '../../ApplicationGroup/Constants'
import { CreateGroupAppListType, FilterParentType, GroupOptionType } from '../../ApplicationGroup/AppGroup.types'
import { getAppOtherEnvironmentMin } from '../../../services/service'
import { appGroupPermission, deleteEnvGroup, getEnvGroupList } from '../../ApplicationGroup/AppGroup.service'
import CreateAppGroup from '../../ApplicationGroup/CreateAppGroup'

const TriggerView = lazy(() => import('./triggerView/TriggerView'))
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'))
const CIDetails = lazy(() => import('./cIDetails/CIDetails'))
const AppDetails = lazy(() => import('./appDetails/AppDetails'))
const IndexComponent = lazy(() => import('../../v2/index'))

const CDDetails = lazy(() => import('./cdDetails/CDDetails'))
const TestRunList = lazy(() => import('./testViewer/TestRunList'))

export default function AppDetailsPage({ isV2 }: AppDetailsProps) {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()
    const [appName, setAppName] = useState('')
    const [appMetaInfo, setAppMetaInfo] = useState<AppMetaInfo>()
    const [reloadMandatoryProjects, setReloadMandatoryProjects] = useState<boolean>(true)

    const [appListOptions, setAppListOptions] = useState<OptionType[]>([])
    const [selectedAppList, setSelectedAppList] = useState<MultiValue<OptionType>>([])
    const [appListLoading, setAppListLoading] = useState<boolean>(false)
    const [selectedFilterTab, setSelectedFilterTab] = useState<AppFilterTabs>(AppFilterTabs.GROUP_FILTER)
    const [groupFilterOptions, setGroupFilterOptions] = useState<GroupOptionType[]>([])
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<MultiValue<GroupOptionType>>([])
    const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false)
    const [mapUnauthorizedApp, setMapUnauthorizedApp] = useState<Map<string, boolean>>(new Map())
    const [allAppsList, setAllAppsList] = useState<CreateGroupAppListType[]>([])
    const [clickedGroup, setClickedGroup] = useState<GroupOptionType>(null)
    const [showDeleteGroup, setShowDeleteGroup] = useState<boolean>(false)
    const [isPopupBox, setIsPopupBox] = useState(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const [apiError, setApiError] = useState(null)

    useEffect(() => {
        getAppMetaInfoRes()

        getSavedFilterData()
        getAppListData()
        return () => {
            setSelectedAppList([])
            setSelectedGroupFilter([])
            setAppListOptions([])
        }
    }, [appId])

    const getSavedFilterData = async (groupId?: number): Promise<void> => {
        setSelectedAppList([])
        setAppListLoading(true)
        setGroupFilterOptions([])
        const { result } = await getEnvGroupList(+appId, FilterParentType.app)
        if (result) {
            const _groupFilterOption = []
            let _selectedGroup
            for (const group of result) {
                const processedGroupData = {
                    value: group.id.toString(),
                    label: group.name,
                    // @ts-ignore
                    appIds: group.resourceIds,
                    description: group.description,
                }
                _groupFilterOption.push(processedGroupData)
                if (groupId && groupId === group.id) {
                    _selectedGroup = processedGroupData
                }
            }
            if (_selectedGroup) {
                const selectedAppsMap: Record<string, boolean> = {}
                const groupAppIds = _selectedGroup?.appIds || []
                for (const appId of groupAppIds) {
                    selectedAppsMap[appId] = true
                }
                setSelectedAppList(appListOptions.filter((app) => selectedAppsMap[app.value]))
                setSelectedGroupFilter([_selectedGroup])
            } else {
                setSelectedAppList([])
                setSelectedGroupFilter([])
            }
            _groupFilterOption.sort(sortOptionsByLabel)
            setGroupFilterOptions(_groupFilterOption)
        }
        setAppListLoading(false)
    }

    const getAppListData = async (): Promise<void> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getAppOtherEnvironmentMin(appId)
        if (result?.length) {
            setAppListOptions(
                result
                    .map((app): OptionType => {
                        return {
                            value: `${app.environmentId}`,
                            label: app.environmentName,
                        }
                    })
                    .sort(sortOptionsByLabel),
            )
        }
        setAppListLoading(false)
    }

    const getAppMetaInfoRes = async (): Promise<AppMetaInfo> => {
        try {
            setApiError(null)
            const { result } = await getAppMetaInfo(Number(appId))
            if (result) {
                setAppName(result.appName)
                setAppMetaInfo(result)
                setReloadMandatoryProjects(!reloadMandatoryProjects)
                return result
            }
        } catch (err) {
            setApiError(err)
            showError(err)
        }
    }

    const handleToast = (action: string) =>
        ToastManager.showToast({
            variant: ToastVariantType.notAuthorized,
            title: `Cannot ${action} filter`,
            description: `You can ${action} a filter with only those environments for which you have admin/manager permission.`,
        })

    async function getPermissionCheck(payload, _edit?: boolean, _delete?: boolean): Promise<void> {
        try {
            const { result } = await appGroupPermission(appId, payload)
            if (result && !_delete) {
                setShowCreateGroup(true)
            } else if (result && _delete) {
                setIsPopupBox(true)
                setShowDeleteGroup(true)
            }
        } catch (err) {
            const _map = new Map<string, boolean>()
            if (err['code'] === 403) {
                let arrUnauthorized = []
                let unauthorizedCount = 0
                err['errors'].map((errors) => {
                    arrUnauthorized.push([...errors['userMessage']['unauthorizedApps']])
                    errors['userMessage']['unauthorizedApps'].forEach((element) => {
                        if (!_map.get(element)) {
                            _map.set(element, true)
                        }
                        for (const idx in selectedAppList) {
                            if (element === selectedAppList[idx].label) {
                                unauthorizedCount++
                            }
                        }
                    })
                    setMapUnauthorizedApp(_map)
                })
                if (_edit && arrUnauthorized.length > 0) {
                    handleToast('edit')
                } else if (_delete && arrUnauthorized.length > 0) {
                    handleToast('delete')
                } else if (unauthorizedCount && unauthorizedCount === selectedAppList.length) {
                    setIsPopupBox(false)
                    handleToast('create')
                } else {
                    setShowCreateGroup(true)
                }
                arrUnauthorized = []
                unauthorizedCount = 0
                return
            }
            setShowCreateGroup(true)
            setShowDeleteGroup(false)
            if (_delete) {
                setIsPopupBox(true)
            }

            showError(err)
        }
    }

    const openCreateGroup = (e, groupId?: string, _edit?: boolean) => {
        stopPropagation(e)
        const selectedAppsMap: Record<string, boolean> = {}
        const _allAppList: { id: string; appName: string; isSelected: boolean }[] = []
        let _selectedGroup
        const _allAppIds: number[] = []
        if (groupId) {
            _selectedGroup = groupFilterOptions.find((group) => group.value === groupId)
            const groupAppIds = _selectedGroup?.appIds || []
            for (const appId of groupAppIds) {
                _allAppIds.push(appId)
                selectedAppsMap[appId] = true
            }
        } else {
            for (const selectedApp of selectedAppList) {
                selectedAppsMap[selectedApp.value] = true
            }
        }
        for (const app of appListOptions) {
            _allAppList.push({ id: app.value, appName: app.label, isSelected: selectedAppsMap[app.value] })
        }
        setClickedGroup(_selectedGroup)
        setAllAppsList(_allAppList)
        const _allAppLists: number[] = []
        for (const app of _allAppList) {
            _allAppLists.push(+app.id)
        }
        const _permissionData = {
            id: +appId,
            resourceIds: _allAppLists,
            parentResourceId: +appId,
            groupType: FilterParentType.app,
        }
        if (_edit) {
            getPermissionCheck({ resourceIds: _allAppIds, groupType: FilterParentType.app }, _edit)
        } else {
            getPermissionCheck(_permissionData)
        }
    }

    const closeCreateGroup = (e, groupId?: number) => {
        stopPropagation(e)
        setShowCreateGroup(false)
        if (groupId) {
            getSavedFilterData(groupId)
        }
    }

    async function handleDelete() {
        if (deleting) {
            return
        }
        setDeleting(true)
        try {
            await deleteEnvGroup(appId, clickedGroup.value, FilterParentType.app)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully deleted',
            })
            setShowDeleteGroup(false)
            getSavedFilterData(
                selectedGroupFilter[0] && clickedGroup.value !== selectedGroupFilter[0].value
                    ? +selectedGroupFilter[0].value
                    : null,
            )
        } catch (serverError) {
            showError(serverError)
        } finally {
            setDeleting(false)
        }
    }

    const closeDeleteGroup = () => {
        setShowDeleteGroup(false)
    }

    const openDeleteGroup = (e, groupId: string) => {
        stopPropagation(e)
        const selectedGroupId = groupFilterOptions.find((group) => group.value === groupId)
        setClickedGroup(selectedGroupId)
        getPermissionCheck({ resourceIds: selectedGroupId.appIds, groupType: FilterParentType.app }, false, true)
    }

    if (appListLoading) {
        return <Progressing pageLoader />
    }

    if (apiError) {
        return <ErrorScreenManager code={apiError.code} reload={getAppMetaInfoRes} />
    }

    const _filteredEnvIds = selectedAppList.length > 0 ? selectedAppList.map((app) => +app.value).join(',') : null
    return (
        <div className="app-details-page dc__overflow-scroll">
            {!isV2 && (
                <AppHeader
                    appName={appName}
                    appMetaInfo={appMetaInfo}
                    reloadMandatoryProjects={reloadMandatoryProjects}
                    appListOptions={appListOptions}
                    selectedAppList={selectedAppList}
                    setSelectedAppList={setSelectedAppList}
                    selectedFilterTab={selectedFilterTab}
                    setSelectedFilterTab={setSelectedFilterTab}
                    groupFilterOptions={groupFilterOptions}
                    selectedGroupFilter={selectedGroupFilter}
                    setSelectedGroupFilter={setSelectedGroupFilter}
                    openCreateGroup={openCreateGroup}
                    openDeleteGroup={openDeleteGroup}
                    isSuperAdmin
                />
            )}
            {showCreateGroup && (
                <CreateAppGroup
                    unAuthorizedApps={mapUnauthorizedApp}
                    appList={allAppsList}
                    selectedAppGroup={clickedGroup}
                    closePopup={closeCreateGroup}
                    filterParentType={FilterParentType.app}
                />
            )}
            {showDeleteGroup && isPopupBox && (
                <DeleteDialog
                    title={`Delete filter '${clickedGroup?.label}' ?`}
                    description="Are you sure you want to delete this filter?"
                    delete={handleDelete}
                    closeDelete={closeDeleteGroup}
                />
            )}
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        {isV2 ? (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <IndexComponent envType={EnvType.APPLICATION} />}
                            />
                        ) : (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <AppDetails filteredEnvIds={_filteredEnvIds} />}
                            />
                        )}
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <Overview
                                appType={APP_TYPE.DEVTRON_APPS}
                                appMetaInfo={appMetaInfo}
                                getAppMetaInfoRes={getAppMetaInfoRes}
                                filteredEnvIds={_filteredEnvIds}
                            />
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_TRIGGER}`}
                            render={(props) => <TriggerView filteredEnvIds={_filteredEnvIds} />}
                        />
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <CIDetails key={appId} filteredEnvIds={_filteredEnvIds} />
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`}
                            render={(props) => {
                                return <DeploymentMetrics {...props} filteredEnvIds={_filteredEnvIds} />
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        >
                            <CDDetails key={appId} filteredEnvIds={_filteredEnvIds} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`}>
                            <AppConfig
                                appName={appName}
                                resourceKind={ResourceKindType.devtronApplication}
                                filteredEnvIds={_filteredEnvIds}
                            />
                        </Route>
                        {/* commented for time being */}
                        {/* <Route path={`${path}/tests/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            render={() => <TestRunList />}
                        /> */}
                        <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

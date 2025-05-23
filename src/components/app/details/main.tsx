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

import { lazy, PropsWithChildren, ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { Switch, Route, Redirect, useParams, useRouteMatch } from 'react-router-dom'
import {
    showError,
    Progressing,
    stopPropagation,
    OptionType,
    ErrorScreenManager,
    ResourceKindType,
    ToastManager,
    ToastVariantType,
    URLS as CommonURLS,
    DeleteConfirmationModal,
    API_STATUS_CODES,
    useUserPreferences,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { MultiValue } from 'react-select'
import {
    ErrorBoundary,
    getAndSetAppGroupFilters,
    importComponentFromFELibrary,
    setAppGroupFilterInLocalStorage,
    sortOptionsByLabel,
    useAppContext,
} from '../../common'
import { APP_TYPE, URLS } from '../../../config'
import AppConfig from '../../../Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import { getAppMetaInfo } from '../service'
import { AppMetaInfo } from '../types'
import Overview from '../Overview/Overview'
import { AppHeader } from './AppHeader'
import './appDetails/appDetails.scss'
import './app.scss'
import { AppFilterTabs } from '../../ApplicationGroup/Constants'
import { CreateGroupAppListType, FilterParentType, GroupOptionType } from '../../ApplicationGroup/AppGroup.types'
import { getAppOtherEnvironmentMin } from '../../../services/service'
import { appGroupPermission, deleteEnvGroup, getEnvGroupList } from '../../ApplicationGroup/AppGroup.service'
import CreateAppGroup from '../../ApplicationGroup/CreateAppGroup'
import { DeleteComponentsName } from '@Config/constantMessaging'

const TriggerView = lazy(() => import('./triggerView/TriggerView'))
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'))
const CIDetails = lazy(() => import('./cIDetails/CIDetails'))
const AppDetails = lazy(() => import('./appDetails/AppDetails'))
const CDDetails = lazy(() => import('./cdDetails/CDDetails'))

const AIChat = importComponentFromFELibrary('AIChat', null, 'function')

const AIAgentContextSetterWrapper = ({ children, appName }: PropsWithChildren<{ appName: string }>) => {
    const { setAIAgentContext } = useAppContext()
    const params = useParams()
    const { path, url } = useRouteMatch()

    useEffect(() => {
        setAIAgentContext({ path, context: { appName, ...params }})
    }, [path, url])

    return <>{children}</>
}

export default function AppDetailsPage() {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()
    const { setIntelligenceConfig } = useMainContext()
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
    const [apiError, setApiError] = useState(null)
    const [initLoading, setInitLoading] = useState<boolean>(false)

    const { aiAgentContext } = useAppContext()

    const parentRef = useRef<HTMLDivElement>(null)

    const { fetchRecentlyVisitedParsedApps } = useUserPreferences({})

    const getAppMetaInfoRes = async (shouldResetAppName: boolean = false): Promise<AppMetaInfo> => {
        try {
            if (shouldResetAppName) {
                setAppName('')
            }
            setApiError(null)
            const { result } = await getAppMetaInfo(Number(appId))
            if (result) {
                setAppName(result.appName)
                setAppMetaInfo(result)
                setReloadMandatoryProjects(!reloadMandatoryProjects)
                return result
            }
        } catch (err) {
            if (err.code === API_STATUS_CODES.NOT_FOUND || err.code === API_STATUS_CODES.PERMISSION_DENIED) {
                try {
                    await fetchRecentlyVisitedParsedApps({ appId, appName: '' })
                } catch {
                    // Do nothing
                }
            }
            setApiError(err)
            showError(err)
        }
    }

    const getAppMetaInfoAndResetAppName = () => getAppMetaInfoRes(true)

    useEffect(() => {
        setInitLoading(true)
        getAppMetaInfoAndResetAppName()
        Promise.all([getSavedFilterData(), getAppListData()])
            .then((response) => {
                const groupFilterOptionsList = response[0]
                const appListOptionsList = response[1]

                getAndSetAppGroupFilters({
                    filterParentType: FilterParentType.app,
                    resourceId: appId,
                    appListOptions: appListOptionsList,
                    groupFilterOptions: groupFilterOptionsList,
                    setSelectedAppList,
                    setSelectedGroupFilter,
                })
            })
            .finally(() => {
                setInitLoading(false)
            })
        return () => {
            setSelectedAppList([])
            setSelectedGroupFilter([])
            setAppListOptions([])
            setIntelligenceConfig(null)
        }
    }, [appId])

    const getSavedFilterData = async (groupId?: number): Promise<GroupOptionType[]> => {
        setSelectedAppList([])
        setAppListLoading(true)
        setGroupFilterOptions([])
        const { result } = await getEnvGroupList(+appId, FilterParentType.app)
        const _groupFilterOption = []
        if (result) {
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
                const filteredAppList = appListOptions.filter((app) => selectedAppsMap[app.value])
                setSelectedAppList(filteredAppList)
                setSelectedGroupFilter([_selectedGroup])
                setAppGroupFilterInLocalStorage({
                    filterParentType: FilterParentType.app,
                    resourceId: appId,
                    resourceList: filteredAppList,
                    groupList: [_selectedGroup],
                })
            } else {
                setSelectedAppList([])
                setSelectedGroupFilter([])
            }
            _groupFilterOption.sort(sortOptionsByLabel)
            setGroupFilterOptions(_groupFilterOption)
        }
        setAppListLoading(false)
        return _groupFilterOption
    }

    const getAppListData = async (): Promise<OptionType[]> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getAppOtherEnvironmentMin(appId, false)
        const appListOptionsList = result?.length
            ? result
                  .map((app): OptionType => {
                      return {
                          value: `${app.environmentId}`,
                          label: app.environmentName,
                      }
                  })
                  .sort(sortOptionsByLabel)
            : []

        setAppListOptions(appListOptionsList)
        setAppListLoading(false)
        return appListOptionsList
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
        await deleteEnvGroup(appId, clickedGroup.value, FilterParentType.app)
        getSavedFilterData(
            selectedGroupFilter[0] && clickedGroup.value !== selectedGroupFilter[0].value
                ? +selectedGroupFilter[0].value
                : null,
        )
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

    if (appListLoading || initLoading) {
        return <Progressing pageLoader />
    }

    if (apiError) {
        return <ErrorScreenManager code={apiError.code} reload={getAppMetaInfoAndResetAppName} />
    }

    const _filteredEnvIds = selectedAppList.length > 0 ? selectedAppList.map((app) => +app.value).join(',') : null

    return (
        <div ref={parentRef} className="app-details-page flexbox-col w-100 h-100 dc__overflow-auto">
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
                <DeleteConfirmationModal
                    title={clickedGroup?.label}
                    component={DeleteComponentsName.Filter}
                    onDelete={handleDelete}
                    closeConfirmationModal={closeDeleteGroup}
                />
            )}

            {AIChat && window._env_?.FEATURE_AI_APP_DETAILS_ENABLE && <AIChat parentRef={parentRef} {...aiAgentContext} />}

            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route
                            path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                            render={() => <AppDetails detailsType="app" filteredResourceIds={_filteredEnvIds} />}
                        />
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
                            render={() => (
                                <AIAgentContextSetterWrapper appName={appName}>
                                    <TriggerView filteredEnvIds={_filteredEnvIds} />
                                </AIAgentContextSetterWrapper>
                            )}
                        />
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <AIAgentContextSetterWrapper appName={appName}>
                                <CIDetails key={appId} filteredEnvIds={_filteredEnvIds} />
                            </AIAgentContextSetterWrapper>
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`}
                            render={(props) => {
                                const envId = props.match.params.envId
                                const match = {
                                    ...props.match,
                                    params: {
                                        appId: appId,
                                        envId: envId,
                                    },
                                }
                                return <DeploymentMetrics {...props} match={match} filteredEnvIds={_filteredEnvIds} />
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        >
                            <AIAgentContextSetterWrapper appName={appName}>
                                <CDDetails key={appId} filteredEnvIds={_filteredEnvIds} />
                            </AIAgentContextSetterWrapper>
                        </Route>
                        <Route path={`${path}/${CommonURLS.APP_CONFIG}`}>
                            <AppConfig
                                appName={appName}
                                resourceKind={ResourceKindType.devtronApplication}
                                filteredEnvIds={_filteredEnvIds}
                            />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>

            <div className="dc__no-shrink" id="cluster-meta-data-bar__container" />
        </div>
    )
}

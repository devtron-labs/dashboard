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

import React, { Suspense, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import {
    Switch,
    Route,
    Redirect,
    useParams,
    useRouteMatch,
    useHistory,
    generatePath,
    useLocation,
} from 'react-router-dom'
import {
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    stopPropagation,
    DeleteDialog,
    showError,
    GenericEmptyState,
    useAsync,
    PageHeader,
    TabGroup,
    TabProps,
    ToastManager,
    ToastVariantType,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { MultiValue } from 'react-select'
import {
    ErrorBoundary,
    getAndSetAppGroupFilters,
    setAppGroupFilterInLocalStorage,
    sortOptionsByLabel,
    useAppContext,
} from '../common'
import { URLS } from '../../config'
import EnvTriggerView from './Details/TriggerView/EnvTriggerView'
import EnvConfig from './Details/EnvironmentConfig/EnvConfig'
import EnvironmentOverview from './Details/EnvironmentOverview/EnvironmentOverview'
import { EnvSelector } from './EnvSelector'
import EmptyFolder from '../../assets/img/empty-folder.webp'
import { AppFilterTabs, EMPTY_LIST_MESSAGING, ENV_APP_GROUP_GA_EVENTS, NO_ACCESS_TOAST_MESSAGE } from './Constants'
import { ReactComponent as Settings } from '../../assets/icons/ic-settings.svg'
import {
    deleteEnvGroup,
    getAppGroupList,
    getEnvAppList,
    getEnvGroupList,
    appGroupPermission,
    editDescription,
} from './AppGroup.service'
import {
    AppGroupAdminType,
    AppGroupAppFilterContextType,
    AppGroupListType,
    ApplistEnvType,
    CheckPermissionType,
    CreateGroupAppListType,
    EnvHeaderType,
    FilterParentType,
    GroupOptionType,
} from './AppGroup.types'
import { EditDescRequest, OptionType } from '../app/types'
import AppGroupAppFilter from './AppGroupAppFilter'
import EnvCIDetails from './Details/EnvCIDetails/EnvCIDetails'
import EnvCDDetails from './Details/EnvCDDetails/EnvCDDetails'
import '../app/details/app.scss'
import { CONTEXT_NOT_AVAILABLE_ERROR } from '../../config/constantMessaging'
import CreateAppGroup from './CreateAppGroup'

export const AppGroupAppFilterContext = React.createContext<AppGroupAppFilterContextType>(null)

export function useAppGroupAppFilterContext() {
    const context = React.useContext(AppGroupAppFilterContext)
    if (!context) {
        throw new Error(CONTEXT_NOT_AVAILABLE_ERROR)
    }
    return context
}

export default function AppGroupDetailsRoute({ isSuperAdmin }: AppGroupAdminType) {
    const { path } = useRouteMatch()
    const { envId } = useParams<{ envId: string }>()
    const [envName, setEnvName] = useState<string>('')
    const [showEmpty, setShowEmpty] = useState<boolean>(false)
    const [appListLoading, setAppListLoading] = useState<boolean>(false)
    const [deleting, setDeleting] = useState<boolean>(false)
    const [loading, envList] = useAsync(getEnvAppList, [])
    const [appListOptions, setAppListOptions] = useState<OptionType[]>([])
    const [selectedAppList, setSelectedAppList] = useState<MultiValue<OptionType>>([])
    const [appGroupListData, setAppGroupListData] = useState<AppGroupListType>()
    const [selectedFilterTab, setSelectedFilterTab] = useState<AppFilterTabs>(AppFilterTabs.GROUP_FILTER)
    const [groupFilterOptions, setGroupFilterOptions] = useState<GroupOptionType[]>([])
    const [selectedGroupFilter, setSelectedGroupFilter] = useState<MultiValue<GroupOptionType>>([])
    const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false)
    const [showDeleteGroup, setShowDeleteGroup] = useState<boolean>(false)
    const [clickedGroup, setClickedGroup] = useState<GroupOptionType>(null)
    const [allAppsList, setAllAppsList] = useState<CreateGroupAppListType[]>([])
    const [isVirtualEnv, setIsVirtualEnv] = useState<boolean>(false)
    const [isPopupBox, setIsPopupBox] = useState(false)
    const [mapUnauthorizedApp, setMapUnauthorizedApp] = useState<Map<string, boolean>>(new Map())
    const [description, setDescription] = useState<string>(
        appGroupListData?.description ? appGroupListData?.description : '',
    )
    const [initLoading, setInitLoading] = useState<boolean>(false)

    const filterParentType = FilterParentType.env

    useEffect(() => {
        if (envList?.result) {
            const environment = envList.result.envList?.find((env) => env.id === +envId)
            setIsVirtualEnv(environment?.isVirtualEnvironment)
            setEnvName(environment?.environment_name)
            setShowEmpty(!environment?.appCount)
        }
    }, [envList, envId])

    useEffect(() => {
        if (envId && !showEmpty) {
            setInitLoading(true)

            Promise.all([getSavedFilterData(), getAppListData()])
                .then((response) => {
                    const groupFilterOptionsList = response[0]
                    const appListOptionsList = response[1]

                    getAndSetAppGroupFilters({
                        filterParentType,
                        appListOptions: appListOptionsList,
                        groupFilterOptions: groupFilterOptionsList,
                        resourceId: envId,
                        setSelectedAppList,
                        setSelectedGroupFilter,
                    })
                })
                .finally(() => {
                    setInitLoading(false)
                })
        }
        return () => {
            setSelectedAppList([])
            setSelectedGroupFilter([])
            setAppListOptions([])
            setAppGroupListData(null)
            setDescription('')
        }
    }, [envId])

    const getSavedFilterData = async (groupId?: number): Promise<GroupOptionType[]> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getEnvGroupList(+envId)

        const _groupFilterOption = []
        if (result) {
            let _selectedGroup
            for (const group of result) {
                const processedGroupData = {
                    value: group.id ? group.id.toString() : group.name,
                    label: group.name,
                    appIds: group.appIds,
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
                    filterParentType,
                    resourceId: envId,
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

    const handleSaveDescription = async (value: string) => {
        const payload: EditDescRequest = {
            id: appGroupListData.environmentId,
            environment_name: appGroupListData.environmentName,
            cluster_id: appGroupListData.clusterId,
            namespace: appGroupListData.namespace,
            active: true,
            default: !(appGroupListData.environmentType === 'Non-Production'),
            description: value?.trim(),
        }
        try {
            await editDescription(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
            setDescription(value?.trim())
        } catch (err) {
            showError(err)
            throw err
        }
    }

    const getAppListData = async (): Promise<OptionType[]> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getAppGroupList(+envId)
        setAppGroupListData(result)
        setDescription(result.description)
        const _appListOptions = result.apps?.length
            ? result.apps
                  .map((app): OptionType => {
                      return {
                          value: `${app.appId}`,
                          label: app.appName,
                      }
                  })
                  .sort(sortOptionsByLabel)
            : []

        setAppListOptions(_appListOptions)
        if (selectedGroupFilter.length) {
            setSelectedAppList(_appListOptions.filter((app) => selectedGroupFilter[0].appIds.includes(+app.value)))
        }
        setAppListLoading(false)
        return _appListOptions
    }

    const handleToast = (action: string) => {
        return ToastManager.showToast({
            variant: ToastVariantType.notAuthorized,
            title: `Cannot ${action} filter`,
            description: `You can ${action} a filter with only those applications for which you have admin/manager permission.`,
        })
    }

    async function getPermissionCheck(payload: CheckPermissionType, _edit?: boolean, _delete?: boolean): Promise<void> {
        try {
            const { result } = await appGroupPermission(envId, payload)
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
            } else {
                setShowCreateGroup(true)
                setShowDeleteGroup(false)
                if (_delete) {
                    setIsPopupBox(true)
                }
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
            id: +envId,
            appIds: _allAppLists,
            envId: +envId,
        }
        if (_edit) {
            getPermissionCheck({ appIds: _allAppIds }, _edit)
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

    const openDeleteGroup = (e, groupId: string) => {
        stopPropagation(e)
        const selectedGroupId = groupFilterOptions.find((group) => group.value === groupId)
        setClickedGroup(selectedGroupId)
        getPermissionCheck({ appIds: selectedGroupId.appIds }, false, true)
    }

    async function handleDelete() {
        if (deleting) {
            return
        }
        setDeleting(true)
        try {
            await deleteEnvGroup(envId, clickedGroup.value)
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

    const renderEmpty = () => {
        return (
            <GenericEmptyState
                image={EmptyFolder}
                title={isSuperAdmin ? EMPTY_LIST_MESSAGING.TITLE : EMPTY_LIST_MESSAGING.UNAUTHORIZE_TEXT}
                subTitle={isSuperAdmin ? NO_ACCESS_TOAST_MESSAGE.SUPER_ADMIN : NO_ACCESS_TOAST_MESSAGE.NON_ADMIN}
            />
        )
    }

    const filteredAppListData = useMemo(() => {
        const _appListData = { ...appGroupListData }
        const _filteredApps: ApplistEnvType[] = []
        if (selectedAppList?.length > 0) {
            const _filteredAppMap = new Map<number, string>()
            selectedAppList.forEach((app) => {
                _filteredAppMap.set(+app.value, app.label)
            })
            appGroupListData?.apps.forEach((app) => {
                if (_filteredAppMap.get(app.appId)) {
                    _filteredApps.push(app)
                }
            })
            _appListData.apps = _filteredApps
        }
        return _appListData
    }, [selectedAppList, appGroupListData?.apps, appGroupListData?.description])

    const renderRoute = () => {
        if (initLoading || loading || appListLoading) {
            return <Progressing pageLoader />
        }
        if (showEmpty) {
            return <div className="env-empty-state flex w-100">{renderEmpty()}</div>
        }
        const _filteredAppsIds = selectedAppList.length > 0 ? selectedAppList.map((app) => +app.value).join(',') : null
        return (
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}`}>
                            <div>Env detail</div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <EnvironmentOverview
                                filteredAppIds={_filteredAppsIds}
                                appGroupListData={filteredAppListData}
                                isVirtualEnv={isVirtualEnv}
                                getAppListData={getAppListData}
                                handleSaveDescription={handleSaveDescription}
                                description={description}
                            />
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                            <EnvTriggerView filteredAppIds={_filteredAppsIds} isVirtualEnv={isVirtualEnv} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <EnvCIDetails filteredAppIds={_filteredAppsIds} />
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_CD_DETAILS}/:appId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        >
                            <EnvCDDetails filteredAppIds={_filteredAppsIds} />
                        </Route>
                        <Route path={`${path}/${CommonURLS.APP_CONFIG}/:appId(\\d+)?`}>
                            <EnvConfig filteredAppIds={_filteredAppsIds} envName={envName} />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        )
    }

    return (
        <div className="env-details-page h-100vh flexbox-col">
            <EnvHeader
                envName={envName}
                setEnvName={setEnvName}
                setShowEmpty={setShowEmpty}
                showEmpty={showEmpty}
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
                isSuperAdmin={isSuperAdmin}
            />
            {renderRoute()}
            {showCreateGroup && (
                <CreateAppGroup
                    unAuthorizedApps={mapUnauthorizedApp}
                    appList={allAppsList}
                    selectedAppGroup={clickedGroup}
                    closePopup={closeCreateGroup}
                    filterParentType={filterParentType}
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
        </div>
    )
}

export const EnvHeader = ({
    envName,
    setEnvName,
    setShowEmpty,
    showEmpty,
    appListOptions,
    selectedAppList,
    setSelectedAppList,
    selectedFilterTab,
    setSelectedFilterTab,
    groupFilterOptions,
    selectedGroupFilter,
    setSelectedGroupFilter,
    openCreateGroup,
    openDeleteGroup,
    isSuperAdmin,
}: EnvHeaderType) => {
    const { envId } = useParams<{ envId: string }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')
    const { setCurrentEnvironmentName } = useAppContext()

    const [isMenuOpen, setMenuOpen] = useState(false)

    const contextValue = useMemo(
        () => ({
            resourceId: envId,
            appListOptions,
            isMenuOpen,
            setMenuOpen,
            selectedAppList,
            setSelectedAppList,
            selectedFilterTab,
            setSelectedFilterTab,
            groupFilterOptions,
            selectedGroupFilter,
            setSelectedGroupFilter,
            openCreateGroup,
            openDeleteGroup,
            isSuperAdmin,
            filterParentType: FilterParentType.env,
        }),
        [
            appListOptions,
            isMenuOpen,
            selectedAppList,
            selectedFilterTab,
            groupFilterOptions,
            selectedGroupFilter,
            isSuperAdmin,
            envId,
        ],
    )

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    useEffect(() => {
        setCurrentEnvironmentName(envName)
    }, [envName])

    const handleEnvChange = useCallback(
        ({ label, value, appCount }) => {
            if (+envId !== value) {
                setEnvName(label)
                setShowEmpty(!appCount)
                const tab = currentPathname.current.replace(match.url, '').split('/')[1]
                const newUrl = generatePath(match.path, { envId: value })
                history.push(`${newUrl}/${tab}`)
                ReactGA.event({
                    category: 'Env Selector',
                    action: 'Env Selection Changed',
                    label,
                })
            }
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':envId': {
                    component: <EnvSelector onChange={handleEnvChange} envId={+envId} envName={envName} />,
                    linked: false,
                },
                'application-group': {
                    component: <span className="cb-5 fs-16 dc__capitalize">Application groups</span>,
                    linked: true,
                },
            },
        },
        [envId, envName],
    )

    const onClickTabPreventDefault = (event: React.MouseEvent<Element, MouseEvent>, className: string) => {
        const linkDisabled = (event.target as Element)?.classList.contains(className)
        if (linkDisabled) {
            event.preventDefault()
        }
    }

    const handleEventRegistration = (event: React.MouseEvent<Element, MouseEvent>, eventType?: string) => {
        switch (eventType) {
            case ENV_APP_GROUP_GA_EVENTS.OverviewClicked.action:
                ReactGA.event(ENV_APP_GROUP_GA_EVENTS.OverviewClicked)
                break
            case ENV_APP_GROUP_GA_EVENTS.BuildDeployClicked.action:
                ReactGA.event(ENV_APP_GROUP_GA_EVENTS.BuildDeployClicked)
                break
            case ENV_APP_GROUP_GA_EVENTS.ConfigurationClicked.action:
                ReactGA.event(ENV_APP_GROUP_GA_EVENTS.ConfigurationClicked)
                break
            default:
                break
        }
        onClickTabPreventDefault(event, 'active')
    }

    const renderEnvDetailsTabs = () => {
        const tabs: TabProps[] = [
            {
                id: 'overview-tab',
                label: 'Overview',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_OVERVIEW}`,
                    onClick: (event) => handleEventRegistration(event, ENV_APP_GROUP_GA_EVENTS.OverviewClicked.action),
                },
            },
            {
                id: 'build-&-deploy-tab',
                label: 'Build & Deploy',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_TRIGGER}`,
                    onClick: (event) =>
                        handleEventRegistration(event, ENV_APP_GROUP_GA_EVENTS.BuildDeployClicked.action),
                    'data-testid': 'group-build-deploy',
                },
            },
            {
                id: 'build-history-tab',
                label: 'Build history',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_CI_DETAILS}`,
                    onClick: handleEventRegistration,
                    'data-testid': 'app-group-build-history',
                },
            },
            {
                id: 'deployment-history-tab',
                label: 'Deployment history',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_CD_DETAILS}`,
                    onClick: handleEventRegistration,
                },
            },
            {
                id: 'group-configurations-tab',
                label: 'Configurations',
                tabType: 'navLink',
                icon: Settings,
                props: {
                    to: `${match.url}/${CommonURLS.APP_CONFIG}`,
                    onClick: (event) =>
                        handleEventRegistration(event, ENV_APP_GROUP_GA_EVENTS.ConfigurationClicked.action),
                    'data-testid': 'group-configuration',
                },
            },
        ]

        return <TabGroup tabs={tabs} hideTopPadding alignActiveBorderWithContainer />
    }

    const renderBreadcrumbs = () => {
        return (
            <>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className="dc__border-right ml-8 mr-8 h-16" />
                <AppGroupAppFilterContext.Provider value={contextValue}>
                    {!showEmpty && <AppGroupAppFilter />}
                </AppGroupAppFilterContext.Provider>
            </>
        )
    }

    return (
        <PageHeader
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs
            showTabs={!showEmpty}
            renderHeaderTabs={renderEnvDetailsTabs}
        />
    )
}

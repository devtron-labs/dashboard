import React, { Suspense, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, useAsync, sortOptionsByLabel } from '../common'
import {
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    stopPropagation,
    DeleteDialog,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ReactGA from 'react-ga4'
import { URLS } from '../../config'
import PageHeader from '../common/header/PageHeader'
import EnvTriggerView from './Details/TriggerView/EnvTriggerView'
import EnvConfig from './Details/EnvironmentConfig/EnvConfig'
import EnvironmentOverview from './Details/EnvironmentOverview/EnvironmentOverview'
import { EnvSelector } from './EnvSelector'
import ResourceListEmptyState from '../ResourceBrowser/ResourceList/ResourceListEmptyState'
import EmptyFolder from '../../assets/img/Empty-folder.png'
import { AppFilterTabs, EMPTY_LIST_MESSAGING, ENV_APP_GROUP_GA_EVENTS, NO_ACCESS_TOAST_MESSAGE } from './Constants'
import { ReactComponent as Settings } from '../../assets/icons/ic-settings.svg'
import { deleteEnvGroup, getAppGroupList, getEnvAppList, getEnvGroupList } from './AppGroup.service'
import {
    AppGroupAdminType,
    AppGroupAppFilterContextType,
    AppGroupListType,
    ApplistEnvType,
    CreateGroupAppListType,
    EnvHeaderType,
    GroupOptionType,
} from './AppGroup.types'
import { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import AppGroupAppFilter from './AppGroupAppFilter'
import EnvCIDetails from './Details/EnvCIDetails/EnvCIDetails'
import EnvCDDetails from './Details/EnvCDDetails/EnvCDDetails'
import '../app/details/app.scss'
import { CONTEXT_NOT_AVAILABLE_ERROR } from '../../config/constantMessaging'
import { toast } from 'react-toastify'
import CreateAppGroup from './CreateAppGroup'

const AppGroupAppFilterContext = React.createContext<AppGroupAppFilterContextType>(null)

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

    useEffect(() => {
        if (envList?.result) {
            const environment = envList.result.envList?.find((env) => env.id === +envId)
            setEnvName(environment.environment_name)
            setShowEmpty(!environment.appCount)
        }
    }, [envList, envId])

    useEffect(() => {
        if (envId) {
            getSavedFilterData()
            getAppListData()
        }
        return () => {
            setSelectedAppList([])
            setSelectedGroupFilter([])
            setAppListOptions([])
            setAppGroupListData(null)
        }
    }, [envId])

    const getSavedFilterData = async (groupId?: number): Promise<void> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getEnvGroupList(+envId)
        if (result) {
            const _groupFilterOption = []
            let _selectedGroup
            for (const group of result) {
                const processedGroupData = {
                    value: group.id.toString(),
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
                setSelectedAppList(appListOptions.filter((app) => selectedAppsMap[app.value]))
                setSelectedGroupFilter([_selectedGroup])
            } else {
                setSelectedAppList([])
                setSelectedGroupFilter([])
            }
            setGroupFilterOptions(_groupFilterOption)
        }
        setAppListLoading(false)
    }

    const getAppListData = async (): Promise<void> => {
        setSelectedAppList([])
        setAppListLoading(true)
        const { result } = await getAppGroupList(+envId)
        setAppGroupListData(result)
        if (result.apps?.length) {
            setAppListOptions(
                result.apps
                    .map((app): OptionType => {
                        return {
                            value: `${app.appId}`,
                            label: app.appName,
                        }
                    })
                    .sort(sortOptionsByLabel),
            )
        }
        setAppListLoading(false)
    }

    const openCreateGroup = (e, groupId?: string) => {
        stopPropagation(e)
        const selectedAppsMap: Record<string, boolean> = {}
        const _allAppList: { id: string; appName: string; isSelected: boolean }[] = []
        let _selectedGroup
        if (groupId) {
            _selectedGroup = groupFilterOptions.find((group) => group.value === groupId)
            const groupAppIds = _selectedGroup?.appIds || []
            for (const appId of groupAppIds) {
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
        setShowCreateGroup(true)
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
        setClickedGroup(groupFilterOptions.find((group) => group.value === groupId))
        setShowDeleteGroup(true)
    }

    async function handleDelete() {
        if (deleting) {
            return
        }
        setDeleting(true)
        try {
            await deleteEnvGroup(envId, clickedGroup.value)
            toast.success('Successfully deleted')
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
            <ResourceListEmptyState
                imgSource={EmptyFolder}
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
    }, [selectedAppList, appGroupListData?.apps])

    const renderRoute = () => {
        if (loading || appListLoading) {
            return <Progressing pageLoader />
        } else if (showEmpty) {
            return <div className="env-empty-state flex w-100">{renderEmpty()}</div>
        } else {
            const _filteredAppsIds =
                selectedAppList.length > 0 ? selectedAppList.map((app) => +app.value).join(',') : null
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
                                />
                            </Route>
                            <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                                <EnvTriggerView filteredAppIds={_filteredAppsIds} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                                <EnvCIDetails filteredAppIds={_filteredAppsIds} />
                            </Route>
                            <Route
                                path={`${path}/${URLS.APP_CD_DETAILS}/:appId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            >
                                <EnvCDDetails filteredAppIds={_filteredAppsIds} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_CONFIG}/:appId(\\d+)?`}>
                                <EnvConfig filteredAppIds={_filteredAppsIds} />
                            </Route>
                            <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                        </Switch>
                    </Suspense>
                </ErrorBoundary>
            )
        }
    }

    return (
        <div className="env-details-page">
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
            {isSuperAdmin && showCreateGroup && (
                <CreateAppGroup appList={allAppsList} selectedAppGroup={clickedGroup} closePopup={closeCreateGroup} />
            )}
            {isSuperAdmin && showDeleteGroup && (
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

export function EnvHeader({
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
}: EnvHeaderType) {
    const { envId } = useParams<{ envId: string }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')
    const [isMenuOpen, setMenuOpen] = useState(false)

    const contextValue = useMemo(
        () => ({
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
        }),
        [
            appListOptions,
            isMenuOpen,
            selectedAppList,
            selectedFilterTab,
            groupFilterOptions,
            selectedGroupFilter,
            isSuperAdmin,
        ],
    )

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

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
                    label: label,
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

    const handleOverViewClick = (): void => {
        ReactGA.event(ENV_APP_GROUP_GA_EVENTS.OverviewClicked)
    }

    const handleBuildClick = (): void => {
        ReactGA.event(ENV_APP_GROUP_GA_EVENTS.BuildDeployClicked)
    }

    const handleConfigClick = (): void => {
        ReactGA.event(ENV_APP_GROUP_GA_EVENTS.ConfigurationClicked)
    }

    const renderEnvDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_OVERVIEW}`}
                        className="tab-list__tab-link"
                        onClick={handleOverViewClick}
                    >
                        Overview
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        onClick={handleBuildClick}
                    >
                        Build & Deploy
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                    >
                        Build history
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CD_DETAILS}`}
                        className="tab-list__tab-link"
                    >
                        Deployment history
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link flex"
                        onClick={handleConfigClick}
                    >
                        <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                        Configurations
                    </NavLink>
                </li>
            </ul>
        )
    }

    const renderBreadcrumbs = () => {
        return (
            <>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className="dc__border-right ml-8 mr-8 h-16" />
                <AppGroupAppFilterContext.Provider value={contextValue}>
                    <AppGroupAppFilter />
                </AppGroupAppFilterContext.Provider>
            </>
        )
    }

    return (
        <PageHeader
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs={true}
            showTabs={!showEmpty}
            renderHeaderTabs={renderEnvDetailsTabs}
        />
    )
}

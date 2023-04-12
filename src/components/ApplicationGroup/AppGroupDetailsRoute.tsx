import React, { Suspense, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, useAsync, sortOptionsByLabel } from '../common'
import { Progressing, BreadCrumb, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
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
import { EMPTY_LIST_MESSAGING, ENV_APP_GROUP_GA_EVENTS, NO_ACCESS_TOAST_MESSAGE } from './Constants'
import { ReactComponent as Settings } from '../../assets/icons/ic-settings.svg'
import { getAppGroupList, getEnvAppList } from './AppGroup.service'
import { AppGroupAdminType, AppGroupAppFilterContextType, AppGroupListType, EnvHeaderType } from './AppGroup.types'
import { getAppList } from '../app/service'
import { MultiValue } from 'react-select'
import { OptionType } from '../app/types'
import AppGroupAppFilter from './AppGroupAppFilter'
import EnvCIDetails from './Details/EnvCIDetails/EnvCIDetails'
import EnvCDDetails from './Details/EnvCDDetails/EnvCDDetails'
import '../app/details/app.scss'
import { CONTEXT_NOT_AVAILABLE_ERROR } from '../../config/constantMessaging'

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
    const [loading, envList] = useAsync(getEnvAppList, [])
    const [appListOptions, setAppListOptions] = useState<OptionType[]>([])
    const [selectedAppList, setSelectedAppList] = useState<MultiValue<OptionType>>([])
    const [appGroupListData, setAppGroupListData] = useState<AppGroupListType>()
 
    useEffect(() => {
        if (envList?.result) {
            const environment = envList.result.envList?.find((env) => env.id === +envId)
            setEnvName(environment.environment_name)
            setShowEmpty(!environment.appCount)
        }
    }, [envList, envId])

    useEffect(() => {
        if (envId) {
            getAppListData()
        }
    }, [envId])

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

    const renderEmpty = () => {
        return (
            <ResourceListEmptyState
                imgSource={EmptyFolder}
                title={isSuperAdmin ? EMPTY_LIST_MESSAGING.TITLE : EMPTY_LIST_MESSAGING.UNAUTHORIZE_TEXT}
                subTitle={isSuperAdmin ? NO_ACCESS_TOAST_MESSAGE.SUPER_ADMIN : NO_ACCESS_TOAST_MESSAGE.NON_ADMIN}
            />
        )
    }

    const renderRoute = () => {
        if (loading || appListLoading) {
            return <Progressing pageLoader />
        } else if (showEmpty) {
            return <div className="env-empty-state flex w-100">{renderEmpty()}</div>
        } else {
            const _filteredApps = selectedAppList.length > 0 ? selectedAppList : appListOptions
            return (
                <ErrorBoundary>
                    <Suspense fallback={<Progressing pageLoader />}>
                        <Switch>
                            <Route path={`${path}/${URLS.APP_DETAILS}`}>
                                <div>Env detail</div>
                            </Route>
                            <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                                <EnvironmentOverview filteredApps={_filteredApps} appGroupListData={appGroupListData} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                                <EnvTriggerView filteredApps={_filteredApps} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                                <EnvCIDetails filteredApps={_filteredApps} />
                            </Route>
                            <Route
                                path={`${path}/${URLS.APP_CD_DETAILS}/:appId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            >
                                <EnvCDDetails filteredApps={_filteredApps} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_CONFIG}/:appId(\\d+)?`}>
                                <EnvConfig filteredApps={_filteredApps} />
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
            />
            {renderRoute()}
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
        }),
        [appListOptions, isMenuOpen, selectedAppList],
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

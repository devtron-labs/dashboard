import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, showError, useAsync } from '../common'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ReactGA from 'react-ga4'
import { URLS } from '../../config'
import PageHeader from '../common/header/PageHeader'
import EnvTriggerView from './Details/TriggerView/EnvTriggerView'
import EnvConfig from './EnvironmentConfig/EnvConfig'
import EnvironmentOverview from './EnvironmentOverview/EnvironmentOverview'
import { EnvSelector } from './EnvSelector'
import ResourceListEmptyState from '../ResourceBrowser/ResourceList/ResourceListEmptyState'
import EmptyFolder from '../../assets/img/Empty-folder.png'
import { EMPTY_LIST_MESSAGING, ENV_APP_GROUP_GA_EVENTS, NO_ACCESS_TOAST_MESSAGE } from './Constants'
import { ReactComponent as Settings } from '../../assets/icons/ic-settings.svg'
import { getEnvAppList } from './Environment.service'
import { EnvHeaderType } from './Environments.types'

export default function EnvironmentDetailsRoute({isSuperAdmin}:{isSuperAdmin: boolean}) {
    const { path } = useRouteMatch()
    const { envId } = useParams<{ envId: string }>()
    const [envName, setEnvName] = useState('')
    const [showEmpty, setShowEmpty] = useState<boolean>(true)
    const [loading, envList] = useAsync(getEnvAppList, [])

    useEffect(() => {
        if (envList?.result) {
            const environment = envList.result.envList?.find((env) => env.id === +envId)
            setEnvName(environment.environment_name)
            setShowEmpty(!environment.appCount)
        }
    }, [envList])

    const renderEmptyAndLoading = () => {
        if (loading) {
            return <Progressing pageLoader />
        }
        return (
            <ResourceListEmptyState
                imgSource={EmptyFolder}
                title={isSuperAdmin ? EMPTY_LIST_MESSAGING.TITLE : EMPTY_LIST_MESSAGING.UNAUTHORIZE_TEXT}
                subTitle={isSuperAdmin ? NO_ACCESS_TOAST_MESSAGE.SUPER_ADMIN : NO_ACCESS_TOAST_MESSAGE.NON_ADMIN}
            />
        )
    }

    const renderRoute = () => {
        if (showEmpty) return <div className="env-empty-state flex w-100">{renderEmptyAndLoading()}</div>
        return (
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}`}>
                            <div>Env detail</div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <EnvironmentOverview />
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                            <EnvTriggerView />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`}>
                            <EnvConfig />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        )
    }

    return (
        <div className="env-details-page">
            <EnvHeader envName={envName} setEnvName={setEnvName} setShowEmpty={setShowEmpty} showEmpty={showEmpty} />
            {renderRoute()}
        </div>
    )
}

export function EnvHeader({ envName, setEnvName, setShowEmpty, showEmpty }: EnvHeaderType) {
    const { envId } = useParams<{ envId: string }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleEnvChange = useCallback(
        ({ label, value, appCount }) => {
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
        return <BreadCrumb breadcrumbs={breadcrumbs} />
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

import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, showError, useAsync } from '../common'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ReactGA from 'react-ga4'
import { URLS } from '../../config'
import PageHeader from '../common/header/PageHeader'
import EnvTriggerView from './Details/TriggerView/EnvTriggerView'
import EnvConfig from './EnvironmentConfig/EnvConfig'
import { getEnvAppList } from './EnvironmentListService'
import EnvironmentOverview from './EnvironmentOverview/EnvironmentOverview'
import { EnvSelector } from './EnvSelector'
import ResourceListEmptyState from '../ResourceBrowser/ResourceList/ResourceListEmptyState'
import EmptyFolder from '../../assets/img/Empty-folder.png'
import { EMPTY_LIST_MESSAGING } from './Constants'

export default function EnvironmentDetailsRoute() {
    const { path } = useRouteMatch()
    const { envId } = useParams<{ envId }>()
    const [envName, setEnvName] = useState('')
    const [showEmpty, setShowEmpty] = useState<boolean>(true)
    const [loading, envList] = useAsync(() => getEnvAppList({ size: '1000' }), [])

    useEffect(() => {
        if (envList?.result) {
            const environment = envList.result.envList?.find((env) => env.id === +envId)
            setEnvName(environment.environment_name)
            setShowEmpty(!environment.appCount)
        }
    }, [envList])

    const renderRoute = () => {
        if (showEmpty)
            return (
                <div className="empty-state flex w-100">
                    {loading ? (
                        <Progressing pageLoader />
                    ) : (
                        <ResourceListEmptyState
                            imgSource={EmptyFolder}
                            title={EMPTY_LIST_MESSAGING.TITLE}
                            subTitle={EMPTY_LIST_MESSAGING.SUBTITLE}
                        />
                    )}
                </div>
            )
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

export function EnvHeader({
    envName,
    setEnvName,
    setShowEmpty,
    showEmpty,
}: {
    envName: string
    setEnvName: (label: string) => void
    setShowEmpty: (empty: boolean) => void
    showEmpty: boolean
}) {
    const { envId } = useParams<{ envId }>()
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
                    component: <EnvSelector onChange={handleEnvChange} envId={envId} envName={envName} />,
                    linked: false,
                },
                environment: {
                    component: <span className="cb-5 fs-16 dc__capitalize">Environments</span>,
                    linked: true,
                },
            },
        },
        [envId, envName],
    )

    const handleOverViewClick = () => {
        ReactGA.event({
            category: 'Environment',
            action: 'Overview Clicked',
        })
    }

    const handleBuildClick = () => {
        ReactGA.event({
            category: 'Environment',
            action: 'Build & Deploy Clicked',
        })
    }

    const handleConfigClick = () => {
        ReactGA.event({
            category: 'Configuration',
            action: 'Configuration Clicked',
        })
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
                        className="tab-list__tab-link"
                        onClick={handleConfigClick}
                    >
                        Configuration
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

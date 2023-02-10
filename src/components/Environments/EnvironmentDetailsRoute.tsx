import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, showError } from '../common'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ReactGA from 'react-ga4'
import { URLS } from '../../config'
import { AppSelector } from '../AppSelector'
import PageHeader from '../common/header/PageHeader'
import EnvTriggerView from './Details/TriggerView/EnvTriggerView'

export default function EnvironmentDetailsRoute() {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()
    const [envName, setEnvName] = useState('')

    useEffect(() => {
        getEnvMetaInfoRes()
    }, [appId])

    const getEnvMetaInfoRes = async (): Promise<void> => {
        try {
        } catch (err) {
            showError(err)
        }
    }

    return (
        <div className="app-details-page">
            <EnvHeader envName={envName} />
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}>
                            <div>Env detail</div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <div>Env Overview</div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                            <EnvTriggerView />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

export function EnvHeader({ envName }: { envName: string }) {
    const { envId } = useParams<{ envId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleEnvChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'Env Selector',
                action: 'Env Selection Changed',
                label: tab,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':envId(\\d+)': {
                    component: <AppSelector onChange={handleEnvChange} appId={envId} appName={envName} />,
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

    const renderEnvDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_OVERVIEW}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'Environment',
                                action: 'Overview Clicked',
                            })
                        }}
                    >
                        Overview
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'Environment',
                                action: 'Build & Deploy Clicked',
                            })
                        }}
                    >
                        Build & Deploy
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
            showTabs={true}
            renderHeaderTabs={renderEnvDetailsTabs}
        />
    )
}

import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb, showError, useAsync } from '../common'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import ReactGA from 'react-ga4'
import { URLS } from '../../config'
import { AppSelector } from '../AppSelector'
import PageHeader from '../common/header/PageHeader'
import EnvConfig from './EnvironmentConfig/EnvConfig'
import { getEnvAppList } from './EnvironmentListService'
import EnvironmentOverview from './EnvironmentOverview/EnvironmentOverview'
import { EnvSelector } from './EnvSelector'

export default function EnvironmentDetailsRoute() {
    const { path } = useRouteMatch()
    const { envId } = useParams<{ envId }>()
    const [envName, setEnvName] = useState('')
    const [loading, envList] = useAsync(() => getEnvAppList({}), [])

    useEffect(() => {
        if(envList?.result){
            let environmentName = envList.result.find((env) => env.id === +envId)
            setEnvName(environmentName.environment_name)
        }
    },[envList])

    


    return (
        <div className="app-details-page">
            <EnvHeader envName={envName} setEnvName={setEnvName} />
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
                            <div>Build & Deploy</div>
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`}>
                            <EnvConfig />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

export function EnvHeader({ envName, setEnvName  }: { envName: string, setEnvName: (label: string) => void }) {
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
            setEnvName(label)
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
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'Configuration',
                                action: 'Configuration Clicked',
                            })
                        }}
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
            showTabs={true}
            renderHeaderTabs={renderEnvDetailsTabs}
        />
    )
}

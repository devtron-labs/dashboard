import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import {
    generatePath,
    NavLink,
    Redirect,
    Route,
    Switch,
    useHistory,
    useLocation,
    useParams,
    useRouteMatch,
} from 'react-router-dom'
import { BreadCrumb, Progressing, showError, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import AppConfig from '../../app/details/appConfig/AppConfig'
import Overview from '../../app/Overview/Overview'
import CIDetails from '../../app/details/cIDetails/CIDetails'
import TriggerView from '../../app/details/triggerView/TriggerView'
import { getAppMetaInfo } from '../../app/service'
import { AppMetaInfo } from '../../app/types'
import { ErrorBoundary, trackByGAEvent } from '../../common'
import PageHeader from '../../common/header/PageHeader'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { AppSelector } from '../../AppSelector'
import '../../app/details/appDetails/appDetails.scss'

export default function JobDetails() {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId: string }>()
    const [jobName, setJobName] = useState('')
    const [appMetaInfo, setAppMetaInfo] = useState<AppMetaInfo>()

    useEffect(() => {
        getAppMetaInfoRes()
    }, [appId])

    const getAppMetaInfoRes = async (): Promise<AppMetaInfo> => {
        try {
            const { result } = await getAppMetaInfo(Number(appId))
            if (result) {
                setJobName(result.appName)
                setAppMetaInfo(result)
                return result
            }
        } catch (err) {
            showError(err)
        }
    }

    return (
        <div className="job-details-page">
            <JobHeader jobName={jobName} />
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <Overview
                                appMetaInfo={appMetaInfo}
                                getAppMetaInfoRes={getAppMetaInfoRes}
                                isJobOverview={true}
                            />
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                            <TriggerView isJobView={true} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <CIDetails key={appId} isJobView={true} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`}>
                            <AppConfig appName={jobName} isJobView={true} />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

function JobHeader({ jobName }: { jobName: string }) {
    const { appId } = useParams<{ appId: string }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')

    function onClickTabPreventDefault(event: React.MouseEvent<Element, MouseEvent>, className: string) {
        const linkDisabled = (event.target as Element)?.classList.contains(className)
        if (linkDisabled) {
            event.preventDefault()
        }
    }

    function handleEventClick(event) {
        trackByGAEvent('Job', event.currentTarget.dataset.action)
        onClickTabPreventDefault(event, 'active')
    }

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'Job Selector',
                action: 'Job Selection Changed',
                label: tab,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                            onChange={handleAppChange}
                            appId={Number(appId)}
                            appName={jobName}
                            isJobView={true}
                        />
                    ),
                    linked: false,
                },
                app: {
                    component: <span className="cb-5 fs-16 dc__capitalize">Jobs</span>,
                    linked: true,
                },
            },
        },
        [appId, jobName],
    )

    const renderAppDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_OVERVIEW}`}
                        className="tab-list__tab-link"
                        data-action="Overview Clicked"
                        onClick={handleEventClick}
                    >
                        Overview
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        data-action="Trigger Job Clicked"
                        onClick={handleEventClick}
                    >
                        Trigger job
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                        data-action="Run History Clicked"
                        onClick={handleEventClick}
                    >
                        Run history
                    </NavLink>
                </li>
                <li className="tab-list__tab tab-list__config-tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link flex"
                        data-action="Job Configurations Clicked"
                        onClick={handleEventClick}
                    >
                        <Settings className="tab-list__icon icon-dim-16 mr-4" />
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
        <div className="job-header-wrapper">
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderAppDetailsTabs}
            />
        </div>
    )
}

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

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import ReactGA from 'react-ga4'
import {
    generatePath,
    Redirect,
    Route,
    Switch,
    useHistory,
    useLocation,
    useParams,
    useRouteMatch,
} from 'react-router-dom'
import { APP_TYPE, URLS } from '../../../config'
import {
    BreadCrumb,
    Progressing,
    showError,
    useBreadcrumb,
    PageHeader,
    ResourceKindType,
    TabProps,
    TabGroup,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'
import AppConfig from '../../../Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import Overview from '../../app/Overview/Overview'
import CIDetails from '../../app/details/cIDetails/CIDetails'
import TriggerView from '../../app/details/triggerView/TriggerView'
import { getAppMetaInfo } from '../../app/service'
import { AppMetaInfo } from '../../app/types'
import { ErrorBoundary, trackByGAEvent } from '../../common'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { AppSelector } from '../../AppSelector'
import '../../app/details/appDetails/appDetails.scss'

export default function JobDetails() {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId: string }>()
    const [jobName, setJobName] = useState('')
    const [appMetaInfo, setAppMetaInfo] = useState<AppMetaInfo>()
    const [jobListLoading, setJobListLoading] = useState<boolean>(false)

    useEffect(() => {
        setJobListLoading(true)
        getAppMetaInfoRes().finally(() => setJobListLoading(false))
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
    if (jobListLoading) {
        return <Progressing pageLoader />
    }

    return (
        <div className="job-details-page">
            <JobHeader jobName={jobName} />
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <Overview
                                appType={APP_TYPE.JOB}
                                appMetaInfo={appMetaInfo}
                                getAppMetaInfoRes={getAppMetaInfoRes}
                            />
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`}>
                            <TriggerView isJobView />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <CIDetails key={appId} isJobView />
                        </Route>
                        <Route path={`${path}/${CommonURLS.APP_CONFIG}`}>
                            <AppConfig appName={jobName} resourceKind={ResourceKindType.job} />
                        </Route>
                        <Redirect to={`${path}/${URLS.APP_OVERVIEW}`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

const JobHeader = ({ jobName }: { jobName: string }) => {
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
                        <AppSelector onChange={handleAppChange} appId={Number(appId)} appName={jobName} isJobView />
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
        const tabs: TabProps[] = [
            {
                id: 'overview-tab',
                label: 'Overview',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_OVERVIEW}`,
                    onClick: handleEventClick,
                    ['data-testid']: 'overview-link',
                    ['data-action']: 'Overview Clicked',
                },
            },
            {
                id: 'trigger-job-tab',
                label: 'Trigger Job',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_TRIGGER}`,
                    onClick: handleEventClick,
                    ['data-testid']: 'trigger-job-link',
                    ['data-action']: 'Trigger Job Clicked',
                },
            },
            {
                id: 'run-history-tab',
                label: 'Run History',
                tabType: 'navLink',
                props: {
                    to: `${match.url}/${URLS.APP_CI_DETAILS}`,
                    onClick: handleEventClick,
                    ['data-testid']: 'run-history-link',
                    ['data-action']: 'Run History Clicked',
                },
            },
            {
                id: 'job-config-tab',
                label: 'Configurations',
                tabType: 'navLink',
                icon: Settings,
                props: {
                    to: `${match.url}/${CommonURLS.APP_CONFIG}`,
                    onClick: handleEventClick,
                    ['data-testid']: 'job-config-link',
                    ['data-action']: 'Job Configurations Clicked',
                },
            },
        ]

        return <TabGroup tabs={tabs} hideTopPadding />
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    return (
        <div className="job-header-wrapper">
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs
                showTabs
                renderHeaderTabs={renderAppDetailsTabs}
            />
        </div>
    )
}

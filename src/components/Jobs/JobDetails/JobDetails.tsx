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
import { generatePath, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
    BASE_ROUTES,
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getAutomationEnablementBreadcrumb,
    handleAnalyticsEvent,
    PageHeader,
    Progressing,
    ResourceKindType,
    ROUTER_URLS,
    showError,
    TabGroup,
    TabProps,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { APP_TYPE } from '../../../config'
import AppConfig from '../../../Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import CIDetails from '../../app/details/cIDetails/CIDetails'
import TriggerView from '../../app/details/triggerView/TriggerView'
import Overview from '../../app/Overview/Overview'
import { getAppMetaInfo } from '../../app/service'
import { AppMetaInfo } from '../../app/types'
import { AppSelector } from '../../AppSelector'
import { ErrorBoundary } from '../../common'

import '../../app/details/appDetails/appDetails.scss'

const JOB_DETAIL_ROUTES = BASE_ROUTES.AUTOMATION_AND_ENABLEMENT.JOBS.DETAIL

const JobDetails = () => {
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
                    <Routes>
                        <Route
                            path={JOB_DETAIL_ROUTES.OVERVIEW}
                            element={
                                <Overview
                                    appType={APP_TYPE.JOB}
                                    appMetaInfo={appMetaInfo}
                                    getAppMetaInfoRes={getAppMetaInfoRes}
                                />
                            }
                        />
                        <Route path={`${JOB_DETAIL_ROUTES.TRIGGER}/*`} element={<TriggerView isJobView />} />
                        <Route
                            path={`${JOB_DETAIL_ROUTES.CI_DETAILS}/:pipelineId?/:buildId?/*`}
                            element={<CIDetails key={appId} isJobView />}
                        />
                        <Route
                            path={`${JOB_DETAIL_ROUTES.CONFIGURATIONS}/*`}
                            element={<AppConfig appName={jobName} resourceKind={ResourceKindType.job} />}
                        />
                        <Route path="*" element={<Navigate to={JOB_DETAIL_ROUTES.OVERVIEW} />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}

const JobHeader = ({ jobName }: { jobName: string }) => {
    const { appId } = useParams<{ appId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const currentPathname = useRef('')

    function onClickTabPreventDefault(event: React.MouseEvent<Element, MouseEvent>, className: string) {
        const linkDisabled = (event.target as Element)?.classList.contains(className)
        if (linkDisabled) {
            event.preventDefault()
        }
    }

    function handleEventClick(event) {
        handleAnalyticsEvent({ category: 'Job', action: event.currentTarget.dataset.action })
        onClickTabPreventDefault(event, 'active')
    }

    const handleAppChange = useCallback(
        ({ value }) => {
            const currenUrl = generatePath(ROUTER_URLS.JOB_DETAIL.ROOT, { appId })
            const tab = currentPathname.current.replace(currenUrl, '').split('/')[1]
            const newUrl = generatePath(ROUTER_URLS.JOB_DETAIL.ROOT, { appId: value })
            navigate(`${newUrl}/${tab}`)
            handleAnalyticsEvent({
                category: 'Job Selector',
                action: 'Job Selection Changed',
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.JOB_DETAIL.ROOT,
        {
            alias: {
                ...getAutomationEnablementBreadcrumb(),
                ':appId': {
                    component: (
                        <AppSelector onChange={handleAppChange} appId={Number(appId)} appName={jobName} isJobView />
                    ),
                    linked: false,
                },
                job: {
                    component: <BreadcrumbText heading="Job" />,
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
                    to: JOB_DETAIL_ROUTES.OVERVIEW,
                    onClick: handleEventClick,
                    'data-testid': 'overview-link',
                    'data-action': 'Overview Clicked',
                },
            },
            {
                id: 'trigger-job-tab',
                label: 'Trigger Job',
                tabType: 'navLink',
                props: {
                    to: JOB_DETAIL_ROUTES.TRIGGER,
                    onClick: handleEventClick,
                    'data-testid': 'trigger-job-link',
                    'data-action': 'Trigger Job Clicked',
                },
            },
            {
                id: 'run-history-tab',
                label: 'Run History',
                tabType: 'navLink',
                props: {
                    to: JOB_DETAIL_ROUTES.CI_DETAILS,
                    onClick: handleEventClick,
                    'data-testid': 'run-history-link',
                    'data-action': 'Run History Clicked',
                },
            },
            {
                id: 'job-config-tab',
                label: 'Configurations',
                tabType: 'navLink',
                icon: Settings,
                props: {
                    to: JOB_DETAIL_ROUTES.CONFIGURATIONS,
                    onClick: handleEventClick,
                    'data-testid': 'job-config-link',
                    'data-action': 'Job Configurations Clicked',
                },
            },
        ]

        return <TabGroup tabs={tabs} hideTopPadding />
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.JOB_DETAIL.ROOT} />

    return (
        <div className="job-header-wrapper">
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs
                showTabs
                renderHeaderTabs={renderAppDetailsTabs}
                docPath={DOCUMENTATION.AUTOMATION_AND_ENABLEMENT}
            />
        </div>
    )
}

export default JobDetails

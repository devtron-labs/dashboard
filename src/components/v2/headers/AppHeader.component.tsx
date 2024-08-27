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

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BreadCrumb, useBreadcrumb, PageHeader } from '@devtron-labs/devtron-fe-common-lib'
import ReactGA from 'react-ga4'
import { NavLink, useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router-dom'
import { AppSelector } from '../../AppSelector'
import { URLS } from '../../../config'
import { OptionType } from './appHeader.type'
import { useSharedState } from '../utils/useSharedState'
import './header.scss'
import IndexStore from '../appDetails/index.store'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'

const AppHeaderComponent = () => {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const [showInfoModal, setShowInfoModal] = useState(false)
    const currentPathname = useRef('')
    const [result, setResult] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [labelTags, setLabelTags] = useState<{ tags: OptionType[]; inputTagValue: string; tagError: string }>({
        tags: [],
        inputTagValue: '',
        tagError: '',
    })
    const params = useParams<{ appId: string }>()
    const [envDetails] = useSharedState(IndexStore.getEnvDetails(), IndexStore.getEnvDetailsObservable())
    const [appName, setAppName] = useState('')

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            // const tab = currentPathname.current.replace(match.url, "").split("/")[1];
            const newUrl = generatePath(match.path, { appId: value })
            history.push(newUrl)
            ReactGA.event({
                category: 'App Selector',
                action: 'App Selection Changed',
                label,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: <AppSelector onChange={handleAppChange} appId={appId} appName={appName} />,
                    linked: false,
                },
                app: {
                    component: <span className="cn-5 fs-16 dc__lowercase">apps</span>,
                    linked: true,
                },
            },
        },
        [appId],
    )

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 2)} />
    }

    const renderHelmDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right fs-13">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/env/${envDetails.envId}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Details Clicked',
                            })
                        }}
                    >
                        App Details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_VALUES}/${envDetails.envId}`}
                        className="tab-list__tab-link flex"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Values Clicked',
                            })
                        }}
                    >
                        <Settings className="tab-list__icon icon-dim-16 fcn-7 mr-4" />
                        Configure
                    </NavLink>
                </li>
            </ul>
        )
    }

    return (
        <div className="app-header-wrapper">
            <PageHeader
                isBreadcrumbs
                breadCrumbs={renderBreadcrumbs}
                showTabs
                renderHeaderTabs={renderHelmDetailsTabs}
                showAnnouncementHeader
            />
        </div>
    )
}

export default AppHeaderComponent

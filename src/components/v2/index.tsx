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

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouteMatch, useParams, Redirect, useLocation, useHistory, Switch, Route } from 'react-router-dom'
import {
    ErrorScreenManager,
    DetailsProgressing,
    showError,
    getIsRequestAborted,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { sortOptionsByValue } from '../common'
import ValuesComponent from './values/ChartValues.component'
import AppHeaderComponent from './headers/AppHeader.component'
import ChartHeaderComponent from './headers/ChartHeader.component'
import {
    getInstalledAppDetail,
    getInstalledChartDetail,
    getInstalledChartResourceTree,
} from './appDetails/appDetails.api'
import AppDetailsComponent from './appDetails/AppDetails.component'
import { AppDetails, AppType, EnvType } from './appDetails/appDetails.type'
import IndexStore from './appDetails/index.store'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import ChartDeploymentHistory from './chartDeploymentHistory/ChartDeploymentHistory.component'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../externalLinks/ExternalLinks.type'
import { getExternalLinks } from '../externalLinks/ExternalLinks.service'
import { sortByUpdatedOn } from '../externalLinks/ExternalLinks.utils'
import { AppDetailsEmptyState } from '../common/AppDetailsEmptyState'
import { HelmAppOverview } from './HelmAppOverview/HelmAppOverview'

let initTimer = null

const RouterComponent = ({ envType }) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const { path } = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loadingResourceTree, setLoadingResourceTree] = useState(false)
    const [helmAppPackageName, setHelmAppPackageName] = useState('')
    // NOTE: this might seem like a duplicate of loadingResourceTree
    // but its not since loadingResourceTree runs a loader on the whole page
    // maybe we can rename loadingResourceTree
    // this variable actually tells us if resource tree call is in progress
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)
    const appDetailsRef = useRef({} as AppDetails)
    const isVirtualRef = useRef(false)

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)
        setLoadingDetails(true)
        setLoadingResourceTree(true)

        if (initTimer) {
            clearTimeout(initTimer)
        }
        if (location.search.includes('newDeployment')) {
            setTimeout(() => {
                _init(true)
            }, 30000)
        } else {
            _init(true)
        }
    }, [params.appId, params.envId])

    useEffect(() => {
        return () => {
            abortControllerRef.current.abort()
        }
    }, [])

    // clearing the timer on component unmount
    useEffect(() => {
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
            IndexStore.clearAppDetails() // Cleared out the data on unmount
        }
    }, [])

    useEffect(() => {
        if (checkIfToRefetchData(location)) {
            setTimeout(() => {
                _getAndSetAppDetail(true)
                deleteRefetchDataFromUrl(history, location)
            }, 5000)
        }
    }, [location.search])

    const _init = (fetchExternalLinks?: boolean) => {
        _getAndSetAppDetail(fetchExternalLinks)
        initTimer = setTimeout(() => {
            _init()
        }, window._env_.HELM_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const handleAppDetailsCallError = (e: any) => {
        if (getIsRequestAborted(e)) {
            // FIXME: initTimer
            return
        }

        setErrorResponseCode(e.code)
        if (e.code === 404 && initTimer) {
            clearTimeout(initTimer)
        }
    }

    const handlePublishAppDetails = (response) => {
        appDetailsRef.current = {
            ...appDetailsRef.current,
            ...response.result,
            helmReleaseStatus: response.result?.releaseStatus || appDetailsRef.current?.helmReleaseStatus,
        }
        IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_HELM_CHART)
        setErrorResponseCode(undefined)
    }

    const _getAndSetAppDetail = async (fetchExternalLinks: boolean) => {
        if (envType === EnvType.CHART) {
            // Get App Details
            getInstalledChartDetail(+params.appId, +params.envId, abortControllerRef)
                .then((response) => {
                    handlePublishAppDetails(response)
                    isVirtualRef.current = response.result?.isVirtualEnvironment
                    setHelmAppPackageName(response.result?.helmPackageName)
                    if (fetchExternalLinks) {
                        getExternalLinksAndTools(response.result?.clusterId)
                    }
                })
                .catch(handleAppDetailsCallError)
                .finally(() => {
                    setLoadingDetails(false)
                })

            // Get App Resource Tree
            getInstalledChartResourceTree(+params.appId, +params.envId, abortControllerRef)
                .then(handlePublishAppDetails)
                .catch(handleAppDetailsCallError)
                .finally(() => {
                    setLoadingResourceTree(false)
                })
        } else {
            try {
                // Revisit this flow
                const response = await getInstalledAppDetail(+params.appId, +params.envId)
                IndexStore.publishAppDetails(response.result, AppType.DEVTRON_APP)
                setErrorResponseCode(undefined)
            } catch (e: any) {
                if (e.code) {
                    setErrorResponseCode(e.code)
                }
            }
        }
    }

    const handleReloadResourceTree = () => {
        if (envType === EnvType.CHART) {
            setIsReloadResourceTreeInProgress(true)
            getInstalledChartResourceTree(+params.appId, +params.envId, abortControllerRef)
                .then(handlePublishAppDetails)
                .catch((err) => {
                    if (!getIsRequestAborted(err)) {
                        showError(err)
                    }
                })
                .finally(() => {
                    setLoadingResourceTree(false)
                    setIsReloadResourceTreeInProgress(false)
                })
        }
    }

    const getExternalLinksAndTools = (clusterId) => {
        if (clusterId) {
            getExternalLinks(clusterId, params.appId, ExternalLinkIdentifierType.DevtronInstalledApp)
                .then((externalLinksRes) => {
                    setExternalLinksAndTools({
                        externalLinks: externalLinksRes.result?.ExternalLinks?.sort(sortByUpdatedOn) || [],
                        monitoringTools:
                            externalLinksRes.result?.Tools?.map((tool) => ({
                                label: tool.name,
                                value: tool.id,
                                icon: tool.icon,
                            })).sort(sortOptionsByValue) || [],
                    })
                })
                .catch((e) => {
                    setExternalLinksAndTools(externalLinksAndTools)
                })
        }
    }

    const renderErrorScreen = () => {
        if (errorResponseCode === 404) {
            return (
                <div className="h-100">
                    {EnvType.APPLICATION === envType ? (
                        <AppHeaderComponent />
                    ) : (
                        <ChartHeaderComponent errorResponseCode={errorResponseCode} />
                    )}
                    <AppDetailsEmptyState envType={EnvType.CHART} />
                </div>
            )
        }
        if (errorResponseCode) {
            return (
                <div className="flex-grow-1">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )
        }
        return null
    }

    return (
        <>
            {renderErrorScreen()}
            {!errorResponseCode && (
                <>
                    {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}
                    <Suspense fallback={<DetailsProgressing fullHeight loadingText="Please wait…" size={24} />}>
                        <Switch>
                            <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                                <HelmAppOverview
                                    key={params.appId}
                                    appId={params.appId}
                                    setErrorResponseCode={setErrorResponseCode}
                                />
                            </Route>
                            <Route path={`${path}/${URLS.APP_DETAILS}`}>
                                <AppDetailsComponent
                                    externalLinks={externalLinksAndTools.externalLinks}
                                    monitoringTools={externalLinksAndTools.monitoringTools}
                                    isExternalApp={false}
                                    _init={_init}
                                    loadingDetails={loadingDetails}
                                    loadingResourceTree={loadingResourceTree}
                                    handleReloadResourceTree={handleReloadResourceTree}
                                    isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
                                />
                            </Route>
                            <Route path={`${path}/${URLS.APP_VALUES}`}>
                                <ValuesComponent appId={params.appId} init={_init} />
                            </Route>
                            <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                                <ChartDeploymentHistory
                                    appId={params.appId}
                                    isExternal={false}
                                    isLoadingDetails={loadingDetails}
                                    isVirtualEnvironment={isVirtualRef.current}
                                    helmAppPackageName={helmAppPackageName}
                                />
                            </Route>
                            <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                        </Switch>
                    </Suspense>
                </>
            )}
        </>
    )
}

export default RouterComponent

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
import { Route, Routes, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'

import {
    abortPreviousRequests,
    API_STATUS_CODES,
    DetailsProgressing,
    ErrorScreenManager,
    GenericEmptyState,
    getIsRequestAborted,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '../../config'
import { sortOptionsByValue } from '../common'
import { getExternalLinks } from '../externalLinks/ExternalLinks.service'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '../externalLinks/ExternalLinks.utils'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import { getInstalledChartDetail, getInstalledChartResourceTree } from './appDetails/appDetails.api'
import AppDetailsComponent from './appDetails/AppDetails.component'
import { AppDetails, AppType, EnvType } from './appDetails/appDetails.type'
import IndexStore from './appDetails/index.store'
import ChartDeploymentHistory from './chartDeploymentHistory/ChartDeploymentHistory.component'
import ChartHeaderComponent from './headers/ChartHeader.component'
import { HelmAppOverview } from './HelmAppOverview/HelmAppOverview'
import ValuesComponent from './values/ChartValues.component'
import { ERROR_EMPTY_SCREEN } from '@Config/constantMessaging'

let initTimer = null

const RouterComponent = () => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [loadingResourceTree, setLoadingResourceTree] = useState(false)
    // NOTE: this might seem like a duplicate of loadingResourceTree
    // but its not since loadingResourceTree runs a loader on the whole page
    // maybe we can rename loadingResourceTree
    // this variable actually tells us if resource tree call is in progress
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)
    const appDetailsRef = useRef({} as AppDetails)
    const isVirtualRef = useRef(false)
    const handledFirstCall = useRef(false)

    useEffect(() => {
        IndexStore.setEnvDetails(EnvType.CHART, +params.appId, +params.envId)
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

    useEffect(
        () => () => {
            abortControllerRef.current.abort()
        },
        [],
    )

    // clearing the timer on component unmount
    useEffect(
        () => (): void => {
            if (initTimer) {
                clearTimeout(initTimer)
            }
            IndexStore.clearAppDetails() // Cleared out the data on unmount
        },
        [],
    )

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>

        if (checkIfToRefetchData(location)) {
            timer = setTimeout(() => {
                abortPreviousRequests(() => _getAndSetAppDetail(true), abortControllerRef)
                deleteRefetchDataFromUrl(navigate, location)
            }, 5000)
        }

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [location.search])

    const _init = (fetchExternalLinks?: boolean) => {
        abortPreviousRequests(() => _getAndSetAppDetail(fetchExternalLinks), abortControllerRef)
    }

    const handleAppDetailsCallError = (e: any) => {
        if (getIsRequestAborted(e)) {
            return
        }

        if (!handledFirstCall.current || e.code === API_STATUS_CODES.NOT_FOUND) {
            setErrorResponseCode(e.code)
        }

        if (e.code === API_STATUS_CODES.NOT_FOUND && initTimer) {
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

    const handleInitiatePolling = () => {
        if (initTimer) {
            clearTimeout(initTimer)
        }

        initTimer = setTimeout(() => {
            _init()
        }, window._env_.HELM_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const handleFetchAppDetails = async (fetchExternalLinks: boolean): Promise<{ isAborted: boolean }> => {
        try {
            const response = await getInstalledChartDetail(+params.appId, +params.envId, abortControllerRef)
            handlePublishAppDetails(response)
            isVirtualRef.current = response.result?.isVirtualEnvironment
            if (fetchExternalLinks) {
                getExternalLinksAndTools(response.result?.clusterId)
            }
            setLoadingDetails(false)
        } catch (error) {
            const isAborted = getIsRequestAborted(error)

            if (!isAborted) {
                handleAppDetailsCallError(error)
            }
            setLoadingDetails(false)

            return { isAborted }
        }

        return { isAborted: false }
    }

    const handleFetchResourceTree = async () => {
        try {
            const response = await getInstalledChartResourceTree(+params.appId, +params.envId, abortControllerRef)
            handlePublishAppDetails(response)
            setLoadingResourceTree(false)
        } catch (error) {
            const isAborted = getIsRequestAborted(error)

            if (!isAborted) {
                handleAppDetailsCallError(error)
            }
            setLoadingResourceTree(false)

            return { isAborted }
        }

        return { isAborted: false }
    }

    const _getAndSetAppDetail = async (fetchExternalLinks: boolean) => {
        // Intentionally not setting await since it was not awaited earlier when in thens as well
        Promise.allSettled([handleFetchAppDetails(fetchExternalLinks), handleFetchResourceTree()])
            .then((results) => {
                const isAborted = results.some((result) => result.status === 'fulfilled' && result.value.isAborted)
                if (!isAborted) {
                    handleInitiatePolling()
                }
            })
            .finally(() => {
                handledFirstCall.current = true
            })
    }

    const handleReloadResourceTree = () => {
        setIsReloadResourceTreeInProgress(true)
        abortPreviousRequests(
            () => getInstalledChartResourceTree(+params.appId, +params.envId, abortControllerRef),
            abortControllerRef,
        )
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
                    <ChartHeaderComponent errorResponseCode={errorResponseCode} />
                    <GenericEmptyState
                        imgName="img-no-result"
                        classname="w-100 dc__text-center"
                        title={ERROR_EMPTY_SCREEN.APP_NOT_AVAILABLE}
                        subTitle={ERROR_EMPTY_SCREEN.DEPLOYMENT_NOT_EXIST}
                    />
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
                    <ChartHeaderComponent />
                    <Suspense fallback={<DetailsProgressing fullHeight loadingText="Please wait…" size={24} />}>
                        <Routes>
                            <Route
                                path={URLS.APP_OVERVIEW}
                                element={
                                    <HelmAppOverview
                                        key={params.appId}
                                        appId={params.appId}
                                        setErrorResponseCode={setErrorResponseCode}
                                    />
                                }
                            />
                            <Route
                                path={`${URLS.APP_DETAILS}/*`}
                                element={
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
                                }
                            />

                            <Route
                                path={URLS.APP_VALUES}
                                element={<ValuesComponent appId={params.appId} init={_init} />}
                            />
                            <Route
                                path={URLS.APP_DEPLOYMNENT_HISTORY}
                                element={
                                    <ChartDeploymentHistory
                                        appId={params.appId}
                                        isExternal={false}
                                        isLoadingDetails={loadingDetails}
                                        isVirtualEnvironment={isVirtualRef.current}
                                    />
                                }
                            />
                            <Route path="*" element={<Navigate to={URLS.APP_DETAILS} replace />} />
                        </Routes>
                    </Suspense>
                </>
            )}
        </>
    )
}

export default RouterComponent

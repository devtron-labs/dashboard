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

import { useState, useEffect, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ServerErrors,
    DeploymentAppTypes,
    getIsRequestAborted,
    abortPreviousRequests,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { sortOptionsByValue } from '../../../common'
import {
    getAppDetail,
    HelmAppDetailResponse,
    HelmAppDetailAndInstalledAppInfo,
} from '../../../external-apps/ExternalAppService'
import IndexStore from '../index.store'
import { AppDetails, AppType } from '../appDetails.type'
import AppDetailsComponent from '../AppDetails.component'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../../../util/URLUtil'
import { getExternalLinks } from '../../../externalLinks/ExternalLinks.service'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../../../externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils'

let initTimer = null

const ExternalAppDetail = ({ appId, appName, isExternalApp }) => {
    const location = useLocation()
    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)

    const abortControllerRef = useRef<AbortController>(new AbortController())

    let isAPICallInProgress = false

    // component load
    useEffect(() => {
        _init()
        return (): void => {
            abortControllerRef.current.abort()

            if (initTimer) {
                clearTimeout(initTimer)
            }
            IndexStore.clearAppDetails() // Cleared out the data on unmount
        }
    }, [])

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>

        if (checkIfToRefetchData(location)) {
            timer = setTimeout(() => {
                _getAndSetAppDetail()
                deleteRefetchDataFromUrl(history, location)
            }, 2000)
        }

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [location.search])

    const _init = () => {
        if (!isAPICallInProgress) {
            _getAndSetAppDetail()
        }
    }

    const _convertToGenericAppDetailModel = (
        helmAppDetailAndInstalledAppInfo: HelmAppDetailAndInstalledAppInfo,
    ): AppDetails => {
        const helmAppDetail = helmAppDetailAndInstalledAppInfo.appDetail
        const { installedAppInfo } = helmAppDetailAndInstalledAppInfo
        const genericAppDetail: AppDetails = {
            appType: AppType.EXTERNAL_HELM_CHART,
            appId,
            appName,
            environmentName: `${helmAppDetail.environmentDetails.clusterName}__${helmAppDetail.environmentDetails.namespace}`,
            namespace: helmAppDetail.environmentDetails.namespace,
            lastDeployedTime: moment(
                new Date(helmAppDetail.lastDeployed.seconds * 1000),
                'YYYY-MM-DDTHH:mm:ssZ',
            ).format('YYYY-MM-DDTHH:mm:ssZ'),
            resourceTree: {
                ...helmAppDetail.resourceTreeResponse,
                status: helmAppDetail.applicationStatus,
            },
            appStoreAppName: helmAppDetail.chartMetadata.chartName,
            appStoreAppVersion: helmAppDetail.chartMetadata.chartVersion,
            helmReleaseStatus: helmAppDetail.releaseStatus,
            clusterId: helmAppDetail.environmentDetails.clusterId,
            notes: helmAppDetail.chartMetadata.notes,
            deploymentAppType: DeploymentAppTypes.HELM,
        }

        if (installedAppInfo) {
            genericAppDetail.appStoreChartId = installedAppInfo.appStoreChartId
            genericAppDetail.environmentName = installedAppInfo.environmentName
            genericAppDetail.environmentId = installedAppInfo.environmentId
        }

        return genericAppDetail
    }

    const handleInitiatePolling = () => {
        if (initTimer) {
            clearTimeout(initTimer)
        }

        initTimer = setTimeout(() => {
            _init()
        }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const _getAndSetAppDetail = () => {
        isAPICallInProgress = true
        setIsReloadResourceTreeInProgress(true)

        abortPreviousRequests(() => getAppDetail(appId, abortControllerRef), abortControllerRef)
            .then((appDetailResponse: HelmAppDetailResponse) => {
                IndexStore.publishAppDetails(
                    _convertToGenericAppDetailModel(appDetailResponse.result),
                    AppType.EXTERNAL_HELM_CHART,
                )

                if (appDetailResponse.result?.appDetail.environmentDetails.clusterId) {
                    getExternalLinks(
                        appDetailResponse.result.appDetail.environmentDetails.clusterId,
                        appName,
                        ExternalLinkIdentifierType.ExternalHelmApp,
                    )
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
                            setIsLoading(false)
                            isAPICallInProgress = false
                        })
                        .catch((e) => {
                            setExternalLinksAndTools(externalLinksAndTools)
                            setIsLoading(false)
                            isAPICallInProgress = false
                        })
                } else {
                    setIsLoading(false)
                    isAPICallInProgress = false
                }

                setErrorResponseCode(undefined)

                handleInitiatePolling()
            })
            .catch((errors: ServerErrors) => {
                setIsLoading(false)
                isAPICallInProgress = false

                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                    setErrorResponseCode(errors.code)
                    handleInitiatePolling()
                }
            })
            .finally(() => {
                setIsReloadResourceTreeInProgress(false)
            })
    }

    return (
        <>
            {isLoading && (
                <div className="flex-grow-1">
                    <Progressing pageLoader />
                </div>
            )}

            {!isLoading && errorResponseCode && (
                <div className="flex-grow-1">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}

            {!isLoading && !errorResponseCode && (
                <AppDetailsComponent
                    externalLinks={externalLinksAndTools.externalLinks}
                    monitoringTools={externalLinksAndTools.monitoringTools}
                    isExternalApp={isExternalApp}
                    loadingDetails={false}
                    loadingResourceTree={false}
                    isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
                    handleReloadResourceTree={_getAndSetAppDetail}
                />
            )}
        </>
    )
}

export default ExternalAppDetail

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
import { getArgoAppDetail } from '../external-apps/ExternalAppService'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import AppDetailsComponent from '../v2/appDetails/AppDetails.component'
import { AppDetails, AppType } from '../v2/appDetails/appDetails.type'
import IndexStore from '../v2/appDetails/index.store'
import { ExternalArgoAppDetailType } from './externalArgoApp.type'

const ExternalArgoAppDetail = ({ appName, clusterId, isExternalApp, namespace }: ExternalArgoAppDetailType) => {
    const location = useLocation()
    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true)
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)

    let initTimer = null
    let isAPICallInProgress = false

    const abortControllerRef = useRef<AbortController>(new AbortController())

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
        if (checkIfToRefetchData(location)) {
            setTimeout(() => {
                _getAndSetAppDetail()
                deleteRefetchDataFromUrl(history, location)
            }, 2000)
        }
    }, [location.search])

    const _init = () => {
        if (!isAPICallInProgress) {
            _getAndSetAppDetail(true)
        }
    }

    const _getAndSetAppDetail = async (shouldTriggerPolling: boolean = false) => {
        isAPICallInProgress = true
        setIsReloadResourceTreeInProgress(true)

        abortPreviousRequests(
            () => getArgoAppDetail({ appName, clusterId, namespace, abortControllerRef }),
            abortControllerRef,
        )
            .then((appDetailResponse) => {
                const genericAppDetail: AppDetails = {
                    ...appDetailResponse.result,
                    deploymentAppType: DeploymentAppTypes.GITOPS,
                }
                IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_ARGO_APP)
                setErrorResponseCode(undefined)
            })
            .catch((errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)
                    setErrorResponseCode(errors.code)
                }
            })
            .finally(() => {
                setIsLoading(false)
                isAPICallInProgress = false
                setIsReloadResourceTreeInProgress(false)

                if (shouldTriggerPolling) {
                    initTimer = setTimeout(() => {
                        _init()
                    }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
                }
            })
    }

    if (isLoading) {
        return (
            <div className="flex-grow-1">
                <Progressing pageLoader />
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

    return (
        <AppDetailsComponent
            isExternalApp={isExternalApp}
            loadingDetails={false}
            _init={_init}
            loadingResourceTree={false}
            handleReloadResourceTree={_getAndSetAppDetail}
            isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
        />
    )
}

export default ExternalArgoAppDetail

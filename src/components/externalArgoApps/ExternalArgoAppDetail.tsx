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
    API_STATUS_CODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { getArgoAppDetail } from '../external-apps/ExternalAppService'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil'
import AppDetailsComponent from '../v2/appDetails/AppDetails.component'
import { AppDetails, AppType } from '../v2/appDetails/appDetails.type'
import IndexStore from '../v2/appDetails/index.store'
import { ExternalArgoAppDetailType } from './externalArgoApp.type'

let initTimer = null

const ExternalArgoAppDetail = ({ appName, clusterId, isExternalApp, namespace }: ExternalArgoAppDetailType) => {
    const location = useLocation()
    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true)
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)

    const handledFirstCall = useRef(false)

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

    const handleInitiatePolling = () => {
        if (initTimer) {
            clearTimeout(initTimer)
        }

        initTimer = setTimeout(() => {
            _init()
        }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const _getAndSetAppDetail = async () => {
        isAPICallInProgress = true
        setIsReloadResourceTreeInProgress(true)

        abortPreviousRequests(
            () => getArgoAppDetail({ appName, clusterId, namespace, abortControllerRef }),
            abortControllerRef,
        )
            .then((appDetailResponse) => {
                const genericAppDetail: AppDetails = {
                    ...appDetailResponse.result,
                    deploymentAppType: DeploymentAppTypes.ARGO,
                }

                isAPICallInProgress = false
                handleInitiatePolling()

                IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_ARGO_APP)
                setErrorResponseCode(undefined)
            })
            .catch((errors: ServerErrors) => {
                if (!getIsRequestAborted(errors)) {
                    showError(errors)

                    if (!handledFirstCall.current || errors.code === API_STATUS_CODES.NOT_FOUND) {
                        setErrorResponseCode(errors.code)
                    }

                    isAPICallInProgress = false
                    handleInitiatePolling()
                }
            })
            .finally(() => {
                setIsLoading(false)
                isAPICallInProgress = false
                setIsReloadResourceTreeInProgress(false)
                handledFirstCall.current = true
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

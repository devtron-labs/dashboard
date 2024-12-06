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

import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ServerErrors,
    DeploymentAppTypes,
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
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)

    let initTimer = null
    let isAPICallInProgress = false

    // component load
    useEffect(() => {
        _init()
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
                _getAndSetAppDetail()
                deleteRefetchDataFromUrl(history, location)
            }, 2000)
        }
    }, [location.search])

    const _init = () => {
        if (!isAPICallInProgress) {
            _getAndSetAppDetail()
        }
        initTimer = setTimeout(() => {
            _init()
        }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
    }

    const _getAndSetAppDetail = async () => {
        isAPICallInProgress = true
        getArgoAppDetail(appName, clusterId, namespace)
            .then((appDetailResponse) => {
                const genericAppDetail: AppDetails = {
                    ...appDetailResponse.result,
                    deploymentAppType: DeploymentAppTypes.GITOPS,
                }
                IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_ARGO_APP)
                setErrorResponseCode(undefined)
                setIsLoading(false)
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setErrorResponseCode(errors.code)
                setIsLoading(false)
                isAPICallInProgress = false
            })
    }

    if (isLoading) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    }
    if (errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
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
        />
    )
}

export default ExternalArgoAppDetail

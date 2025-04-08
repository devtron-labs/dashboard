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

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
    AppType,
    DeploymentAppTypes,
    ERROR_STATUS_CODE,
    ErrorScreenManager,
    IndexStore,
    noop,
    ResponseType,
    showError,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { FluxCDTemplateType } from '../../../../components/app/list-new/AppListType'
import AppDetailsComponent from '../../../../components/v2/appDetails/AppDetails.component'
import { AppDetails } from '../../../../components/v2/appDetails/appDetails.type'
import { getExternalFluxCDAppDetails } from './service'
import { ExternalFluxAppDetailParams } from './types'
import { getAppStatus } from './utils'

let initTimer = null

const ExternalFluxAppDetails = () => {
    const { clusterId, appName, namespace, templateType } = useParams<ExternalFluxAppDetailParams>()
    const { isSuperAdmin } = useMainContext()
    const isKustomization = templateType === FluxCDTemplateType.KUSTOMIZATION
    const [initialLoading, setInitialLoading] = useState(true)
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(true)
    const [appDetailsError, setAppDetailsError] = useState(null)

    const handleUpdateIndexStoreWithDetails = (response: ResponseType<any>) => {
        const genericAppDetail: AppDetails = {
            ...response.result,
            appStatus: getAppStatus(response.result.appStatus),
            deploymentAppType: DeploymentAppTypes.FLUX,
            fluxTemplateType: templateType,
        }

        IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_FLUX_APP)
        setAppDetailsError(null)
    }

    const handleFetchExternalFluxCDAppDetails = () =>
        // NOTE: returning a promise so that we can trigger the next timeout after this api call completes
        new Promise<void>((resolve) => {
            setIsReloadResourceTreeInProgress(true)

            getExternalFluxCDAppDetails(clusterId, namespace, appName, isKustomization)
                .then(handleUpdateIndexStoreWithDetails)
                .catch((error) => {
                    if (!initialLoading) {
                        showError(error)
                    } else {
                        setAppDetailsError(error)
                    }
                })
                .finally(() => {
                    setIsReloadResourceTreeInProgress(false)
                    setInitialLoading(false)
                    resolve()
                })
        })

    const initializePageDetails = () => {
        handleFetchExternalFluxCDAppDetails()
            .then(() => {
                // NOTE: using timeouts instead of intervals since we want the next api call after the last one finishes
                // https://stackoverflow.com/questions/729921/whats-the-difference-between-recursive-settimeout-versus-setinterval
                initTimer = setTimeout(initializePageDetails, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
            })
            .catch(noop)
    }

    const handleReloadResourceTree = async () => {
        await handleFetchExternalFluxCDAppDetails()
    }

    useEffect(() => {
        if (isSuperAdmin) {
            setInitialLoading(true)
            initializePageDetails()
        }

        return () => {
            IndexStore.clearAppDetails()
            clearTimeout(initTimer)
        }
    }, [clusterId, appName, namespace, templateType, isSuperAdmin])

    if (appDetailsError || !isSuperAdmin) {
        return (
            <ErrorScreenManager
                code={appDetailsError?.code ?? ERROR_STATUS_CODE.PERMISSION_DENIED}
                reload={handleReloadResourceTree}
            />
        )
    }

    return (
        <AppDetailsComponent
            isExternalApp
            // NOTE: in case of DA & Helm Apps, when we delete that app _init is called
            // since we can't delete flux app, sending in noop
            _init={noop}
            loadingDetails={initialLoading}
            loadingResourceTree={initialLoading}
            handleReloadResourceTree={handleReloadResourceTree}
            isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
        />
    )
}

export default ExternalFluxAppDetails

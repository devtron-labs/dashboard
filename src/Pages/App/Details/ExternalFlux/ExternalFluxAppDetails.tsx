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

import {
    AppType,
    ErrorScreenManager,
    IndexStore,
    useMainContext,
    DeploymentAppTypes,
    showError,
    ResponseType,
    noop,
    ERROR_STATUS_CODE,
} from '@devtron-labs/devtron-fe-common-lib'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalFluxAppDetailParams } from './types'
import { getExternalFluxCDAppDetails } from './service'
import { FluxCDTemplateType } from '../../../../components/app/list-new/AppListType'
import AppDetailsComponent from '../../../../components/v2/appDetails/AppDetails.component'
import { getAppStatus } from './utils'
import { AppDetails } from '../../../../components/v2/appDetails/appDetails.type'

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

    const handleFetchExternalFluxCDAppDetails = (isReload?: boolean) =>
        // NOTE: returning a promise so that we can trigger the next timeout after this api call completes
        new Promise<void>((resolve) => {
            if (isReload) {
                setIsReloadResourceTreeInProgress(true)
            } else {
                setInitialLoading(true)
            }

            getExternalFluxCDAppDetails(clusterId, namespace, appName, isKustomization)
                .then(handleUpdateIndexStoreWithDetails)
                .catch((error) => {
                    if (isReload) {
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

    const _init = (isReload = true) => {
        handleFetchExternalFluxCDAppDetails(isReload)
            .then(() => {
                // NOTE: using timeouts instead of intervals due since we want api calls after the last one finishes
                // https://stackoverflow.com/questions/729921/whats-the-difference-between-recursive-settimeout-versus-setinterval
                initTimer = setTimeout(_init, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
            })
            .catch(noop)
    }

    const handleReloadResourceTree = async () => {
        await handleFetchExternalFluxCDAppDetails(true)
    }

    const handleReloadPageOnError = async () => {
        await handleFetchExternalFluxCDAppDetails()
    }

    useEffect(() => {
        if (isSuperAdmin) {
            _init(false)
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
                reload={handleReloadPageOnError}
            />
        )
    }

    return (
        <AppDetailsComponent
            isExternalApp
            _init={_init}
            loadingDetails={initialLoading}
            loadingResourceTree={initialLoading}
            handleReloadResourceTree={handleReloadResourceTree}
            isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
        />
    )
}

export default ExternalFluxAppDetails

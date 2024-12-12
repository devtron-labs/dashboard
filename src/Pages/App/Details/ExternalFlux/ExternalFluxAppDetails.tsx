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
    useAsync,
    useMainContext,
    noop,
    DeploymentAppTypes,
    Progressing,
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
    const [isPublishing, setIsPublishing] = useState<boolean>(true)
    const { isSuperAdmin } = useMainContext()
    const isKustomization = templateType === FluxCDTemplateType.KUSTOMIZATION

    const [isAppDetailsLoading, appDetailsResult, appDetailsError, reloadAppDetails] = useAsync(
        () => getExternalFluxCDAppDetails(clusterId, namespace, appName, isKustomization),
        [clusterId, appName, namespace, templateType],
        isSuperAdmin,
        {
            resetOnChange: false,
        },
    )

    useEffect(
        () => () => {
            IndexStore.clearAppDetails()
            clearTimeout(initTimer)
        },
        [],
    )

    useEffect(() => {
        if (appDetailsResult && !appDetailsError) {
            initTimer = setTimeout(reloadAppDetails, window._env_.EA_APP_DETAILS_POLLING_INTERVAL || 30000)
            const genericAppDetail: AppDetails = {
                ...appDetailsResult.result,
                appStatus: getAppStatus(appDetailsResult.result.appStatus),
                deploymentAppType: DeploymentAppTypes.FLUX,
                fluxTemplateType: templateType,
            }
            IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_FLUX_APP)
            setIsPublishing(false)
        }
    }, [appDetailsResult])

    if (!isSuperAdmin) {
        return <ErrorScreenManager code={403} />
    }

    if (appDetailsError) {
        return <ErrorScreenManager code={appDetailsError.code} reload={reloadAppDetails} />
    }

    // To show loader on first render only
    const isLoadingOnMount = isAppDetailsLoading && !appDetailsResult

    if (isLoadingOnMount || isPublishing) {
        return <Progressing pageLoader />
    }

    return (
        <AppDetailsComponent
            isExternalApp
            _init={noop}
            loadingDetails={isLoadingOnMount}
            loadingResourceTree={isLoadingOnMount}
        />
    )
}

export default ExternalFluxAppDetails

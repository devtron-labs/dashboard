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
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect } from 'react'
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

    const [isAppDetailsLoading, appDetailsResult, appDetailsError, reloadAppDetails] = useAsync(
        () => getExternalFluxCDAppDetails(clusterId, namespace, appName, isKustomization),
        [clusterId, appName, namespace, templateType],
        isSuperAdmin,
        {
            resetOnChange: false,
        },
    )

    useEffect(() => {
        return () => {
            IndexStore.publishAppDetails({} as AppDetails, AppType.EXTERNAL_FLUX_APP)
            clearTimeout(initTimer)
        }
    }, [])

    useEffect(() => {
        if (appDetailsResult && !appDetailsError) {
            initTimer = setTimeout(reloadAppDetails, 30000)
            const genericAppDetail = {
                ...appDetailsResult.result,
                appStatus: getAppStatus(appDetailsResult.result.appStatus),
            }
            IndexStore.publishAppDetails(genericAppDetail, AppType.EXTERNAL_FLUX_APP)
        }
    }, [appDetailsResult])

    if (!isSuperAdmin) {
        return <ErrorScreenManager code={403} />
    }

    if (appDetailsError) {
        return <ErrorScreenManager code={appDetailsError.code} reload={reloadAppDetails} />
    }

    const isLoading = isAppDetailsLoading && !appDetailsResult

    return <AppDetailsComponent isExternalApp _init={noop} loadingDetails={isLoading} loadingResourceTree={isLoading} />
}

export default ExternalFluxAppDetails

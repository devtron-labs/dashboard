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
    APIOptions,
    DeploymentAppTypes,
    get,
    getIsRequestAborted,
    getUrlWithSearchParams,
    ImageWithFallback,
    post,
    showError,
    stringComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import { getArgoInstalledExternalApps } from '@Components/app/list-new/AppListService'
import { ReactComponent as ICDefaultChart } from '@Icons/ic-default-chart.svg'
import { ReactComponent as ICArgoCDApp } from '@Icons/ic-argocd-app.svg'
import {
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
    ValidateMigrationSourceInfoType,
    ValidateMigrationSourceServiceParamsType,
} from '../cdPipeline.types'
import {
    generateMigrateAppOption,
    getValidateMigrationSourcePayload,
    sanitizeValidateMigrationSourceResponse,
} from './utils'
import {
    ExternalHelmAppDTO,
    ExternalHelmAppType,
    GetMigrateAppOptionsParamsType,
    SelectMigrateAppOptionType,
} from './types'

export const validateMigrationSource = async (
    params: ValidateMigrationSourceServiceParamsType,
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<ValidateMigrationSourceInfoType> => {
    try {
        const { result } = await post<ValidateMigrationSourceDTO, ValidateMigrateToDevtronPayloadType>(
            Routes.APP_CD_PIPELINE_VALIDATE_LINK_REQUEST,
            getValidateMigrationSourcePayload(params),
            { abortControllerRef },
        )
        return sanitizeValidateMigrationSourceResponse(result, params.migrateToDevtronFormState.deploymentAppType)
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

const getExternalHelmAppList = async (
    clusterId: number,
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<ExternalHelmAppType[]> => {
    const { result } = await get<ExternalHelmAppDTO[]>(
        getUrlWithSearchParams(Routes.APPLICATION_EXTERNAL_HELM_RELEASE, { clusterId }),
        { abortControllerRef },
    )

    return (result || []).map((app) => ({
        releaseName: app.releaseName || '',
        clusterId: app.clusterId,
        namespace: app.namespace || '',
        environmentId: app.environmentId,
        status: app.status || '',
        icon: (
            <ImageWithFallback
                imageProps={{ src: app.chartAvatar, alt: 'Helm Release', width: '100%', height: '100%' }}
                fallbackImage={<ICDefaultChart />}
            />
        ),
    }))
}

export const getMigrateAppOptions = async ({
    clusterId,
    deploymentAppType,
    abortControllerRef,
}: GetMigrateAppOptionsParamsType): Promise<SelectMigrateAppOptionType[]> => {
    try {
        if (deploymentAppType === DeploymentAppTypes.GITOPS) {
            const { result } = await getArgoInstalledExternalApps(String(clusterId), abortControllerRef)
            return (result || [])
                .map<SelectMigrateAppOptionType>((argoApp) =>
                    generateMigrateAppOption({
                        appName: argoApp.appName,
                        namespace: argoApp.namespace,
                        startIcon: <ICArgoCDApp />,
                    }),
                )
                .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))
        }

        const externalHelmApps = await getExternalHelmAppList(clusterId, abortControllerRef)
        return externalHelmApps
            .map<SelectMigrateAppOptionType>((helmApp) =>
                generateMigrateAppOption({
                    appName: helmApp.releaseName,
                    namespace: helmApp.namespace,
                    startIcon: helmApp.icon,
                }),
            )
            .sort((a, b) => stringComparatorBySortOrder(a.label as string, b.label as string))
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

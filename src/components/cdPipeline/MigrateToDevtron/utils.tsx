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

import { Link } from 'react-router-dom'

import { DeploymentAppTypes, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { GenericAppType } from '@Components/app/list-new/AppListType'
import { URLS } from '@Config/routes'

import {
    MigrateToDevtronBaseFormStateType,
    MigrateToDevtronFormState,
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
    ValidateMigrationSourceInfoType,
    ValidateMigrationSourceServiceParamsType,
} from '../cdPipeline.types'
import { SelectClusterOptionType, SelectMigrateAppOptionType } from './types'

const sanitizeDestinationData = (
    destination: ValidateMigrationSourceInfoType['destination'],
): ValidateMigrationSourceInfoType['destination'] => ({
    clusterName: destination?.clusterName || '',
    clusterServerUrl: destination?.clusterServerUrl || '',
    namespace: destination?.namespace || '',
    environmentName: destination?.environmentName || '',
    environmentId: destination?.environmentId || null,
})

export const sanitizeValidateMigrationSourceResponse = (
    response: ValidateMigrationSourceDTO,
    deploymentAppType: ValidateMigrateToDevtronPayloadType['deploymentAppType'],
): ValidateMigrationSourceInfoType => {
    const { isLinkable, errorDetail, applicationMetadata, helmReleaseMetadata, fluxReleaseMetadata } = response || {}

    const baseData = {
        isLinkable: isLinkable || false,
        errorDetail: {
            validationFailedReason: errorDetail?.validationFailedReason,
            validationFailedMessage: errorDetail?.validationFailedMessage || '',
        },
    }

    if (deploymentAppType === DeploymentAppTypes.ARGO) {
        const { destination, source, status } = applicationMetadata || {}
        return {
            ...baseData,
            destination: sanitizeDestinationData(destination),
            requiredChartName: source?.chartMetadata?.requiredChartName || '',
            savedChartName: source?.chartMetadata?.savedChartName || '',
            requiredChartVersion: source?.chartMetadata?.requiredChartVersion || '',
            deploymentAppType,
            status,
        }
    }
    if (deploymentAppType === DeploymentAppTypes.FLUX) {
        const { destination, savedChartName, requiredChartName, requiredChartVersion, status } =
            fluxReleaseMetadata || {}
        return {
            ...baseData,
            status,
            deploymentAppType,
            destination: sanitizeDestinationData(destination),
            requiredChartName: requiredChartName || '',
            savedChartName: savedChartName || '',
            requiredChartVersion: requiredChartVersion || '',
        }
    }
    const { destination, chart, info } = helmReleaseMetadata || {}
    return {
        ...baseData,
        destination: sanitizeDestinationData(destination),
        requiredChartName: chart?.metadata?.requiredChartName || '',
        savedChartName: chart?.metadata?.savedChartName || '',
        requiredChartVersion: chart?.metadata?.requiredChartVersion || '',
        deploymentAppType,
        status: info?.status,
        chartIcon: chart?.metadata?.icon,
    }
}

export const generateClusterOption = (clusterName: string, clusterId: number): SelectClusterOptionType => ({
    label: clusterName,
    value: clusterId,
})

export const generateMigrateAppOption = ({
    appName,
    namespace,
    startIcon,
}: Pick<GenericAppType, 'appName' | 'namespace'> &
    Pick<SelectPickerOptionType, 'startIcon'>): SelectMigrateAppOptionType => ({
    label: appName || '',
    value: {
        appName: appName || '',
        namespace: namespace || '',
    },
    description: `Namespace: ${namespace || '--'}`,
    startIcon,
})

export const renderGitOpsNotConfiguredDescription = () => (
    <p className="m-0">
        GitOps credentials is required to deploy applications via GitOps.&nbsp;
        <Link to={URLS.GLOBAL_CONFIG_GITOPS} data-testid="configure-gitops-button" target="_blank" className="anchor">
            Configure
        </Link>
        &nbsp;and try again.
    </p>
)

export const getValidateMigrationSourcePayload = ({
    migrateToDevtronFormState,
    appId,
}: ValidateMigrationSourceServiceParamsType): ValidateMigrateToDevtronPayloadType => {
    if (migrateToDevtronFormState.deploymentAppType === DeploymentAppTypes.ARGO) {
        return {
            appId,
            deploymentAppType: migrateToDevtronFormState.deploymentAppType,
            deploymentAppName: migrateToDevtronFormState.migrateFromArgoFormState.appName,
            applicationMetadata: {
                applicationObjectClusterId: migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
                applicationObjectNamespace: migrateToDevtronFormState.migrateFromArgoFormState.namespace,
            },
        }
    }

    if (migrateToDevtronFormState.deploymentAppType === DeploymentAppTypes.FLUX) {
        return {
            appId,
            deploymentAppType: migrateToDevtronFormState.deploymentAppType,
            deploymentAppName: migrateToDevtronFormState.migrateFromFluxFormState.appName,
            fluxReleaseMetadata: {
                releaseClusterId: migrateToDevtronFormState.migrateFromFluxFormState.clusterId,
                releaseNamespace: migrateToDevtronFormState.migrateFromFluxFormState.namespace,
            },
        }
    }

    return {
        appId,
        deploymentAppType: DeploymentAppTypes.HELM,
        deploymentAppName: migrateToDevtronFormState.migrateFromHelmFormState.appName,
        helmReleaseMetadata: {
            releaseClusterId: migrateToDevtronFormState.migrateFromHelmFormState.clusterId,
            releaseNamespace: migrateToDevtronFormState.migrateFromHelmFormState.namespace,
        },
    }
}

export const getDeploymentAppTypeLabel = (deploymentAppType: DeploymentAppTypes) => {
    switch (deploymentAppType) {
        case DeploymentAppTypes.HELM:
            return 'Helm Release'
        case DeploymentAppTypes.ARGO:
            return 'Argo CD Application'
        case DeploymentAppTypes.FLUX:
            return 'Flux CD Application'
        default:
            return ''
    }
}

export const getTargetClusterTooltipInfo = (deploymentAppType: DeploymentAppTypes) => ({
    heading: 'Target cluster',
    infoList: [`Cluster in which the ${getDeploymentAppTypeLabel(deploymentAppType)} is deploying your microservice`],
})

export const getTargetNamespaceTooltipInfo = (deploymentAppType: DeploymentAppTypes) => ({
    heading: 'Target Namespace',
    infoList: [`Namespace in which the ${getDeploymentAppTypeLabel(deploymentAppType)} is deploying your microservice`],
})

export const getSelectedFormState = (
    migrateToDevtronFormState: MigrateToDevtronFormState,
): MigrateToDevtronBaseFormStateType => {
    switch (migrateToDevtronFormState.deploymentAppType) {
        case DeploymentAppTypes.ARGO:
            return migrateToDevtronFormState.migrateFromArgoFormState
        case DeploymentAppTypes.FLUX:
            return migrateToDevtronFormState.migrateFromFluxFormState
        case DeploymentAppTypes.HELM:
        default:
            return migrateToDevtronFormState.migrateFromHelmFormState
    }
}

export const getIsExternalAppLinkable = (migrateToDevtronFormState: MigrateToDevtronFormState) => {
    const { validationResponse } = getSelectedFormState(migrateToDevtronFormState)
    return validationResponse.isLinkable
}

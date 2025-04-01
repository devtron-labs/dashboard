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
import { GenericAppType } from '@Components/app/list-new/AppListType'
import { URLS } from '@Config/routes'
import { DeploymentAppTypes, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import {
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
    ValidateMigrationSourceInfoBaseType,
    ValidateMigrationSourceInfoType,
    ValidateMigrationSourceServiceParamsType,
} from '../cdPipeline.types'
import { SelectMigrateAppOptionType, SelectClusterOptionType } from './types'

export const sanitizeValidateMigrationSourceResponse = (
    response: ValidateMigrationSourceDTO,
    deploymentAppType: ValidateMigrateToDevtronPayloadType['deploymentAppType'],
): ValidateMigrationSourceInfoType => {
    const { isLinkable, errorDetail, applicationMetadata, helmReleaseMetadata } = response || {}
    const {
        source: argoAppSourceDetails,
        destination: argoChartDestination,
        status: argoAppStatus,
    } = applicationMetadata || {}

    const destination =
        deploymentAppType === DeploymentAppTypes.GITOPS ? argoChartDestination : helmReleaseMetadata?.destination

    const chartInfoSource =
        deploymentAppType === DeploymentAppTypes.GITOPS
            ? argoAppSourceDetails?.chartMetadata
            : helmReleaseMetadata?.chart?.metadata

    const baseData: ValidateMigrationSourceInfoBaseType = {
        isLinkable: isLinkable || false,
        errorDetail: {
            validationFailedReason: errorDetail?.validationFailedReason,
            validationFailedMessage: errorDetail?.validationFailedMessage || '',
        },
        destination: {
            clusterName: destination?.clusterName || '',
            clusterServerUrl: destination?.clusterServerUrl || '',
            namespace: destination?.namespace || '',
            environmentName: destination?.environmentName || '',
            environmentId: destination?.environmentId || null,
        },

        requiredChartName: chartInfoSource?.requiredChartName || '',
        savedChartName: chartInfoSource?.savedChartName || '',
        requiredChartVersion: chartInfoSource?.requiredChartVersion || '',
    }

    return {
        ...baseData,
        ...(deploymentAppType === DeploymentAppTypes.GITOPS
            ? {
                  deploymentAppType: DeploymentAppTypes.GITOPS,
                  status: argoAppStatus,
              }
            : {
                  deploymentAppType: DeploymentAppTypes.HELM,
                  status: helmReleaseMetadata?.info?.status,
                  chartIcon: helmReleaseMetadata?.chart?.metadata?.icon || null,
              }),
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
    if (migrateToDevtronFormState.deploymentAppType === DeploymentAppTypes.GITOPS) {
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

export const getDeploymentAppTypeLabel = (isMigratingFromHelm: boolean) =>
    isMigratingFromHelm ? 'Helm Release' : 'Argo CD Application'

export const getTargetClusterTooltipInfo = (isMigratingFromHelm: boolean) => ({
    heading: 'Target cluster',
    infoList: [`Cluster in which the ${getDeploymentAppTypeLabel(isMigratingFromHelm)} is deploying your microservice`],
})

export const getTargetNamespaceTooltipInfo = (isMigratingFromHelm: boolean) => ({
    heading: 'Target Namespace',
    infoList: [
        `Namespace in which the ${getDeploymentAppTypeLabel(isMigratingFromHelm)} is deploying your microservice`,
    ],
})

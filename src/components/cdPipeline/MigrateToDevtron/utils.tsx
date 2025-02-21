import { Link } from 'react-router-dom'
import { GenericAppType } from '@Components/app/list-new/AppListType'
import { URLS } from '@Config/routes'
import { DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
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

        requiredChartName:
            deploymentAppType === DeploymentAppTypes.GITOPS
                ? argoAppSourceDetails?.chartMetadata?.requiredChartName || ''
                : helmReleaseMetadata?.chart?.metadata?.requiredChartName || '',

        savedChartName:
            deploymentAppType === DeploymentAppTypes.GITOPS
                ? argoAppSourceDetails?.chartMetadata?.savedChartName || ''
                : helmReleaseMetadata?.chart?.metadata?.savedChartName || '',

        requiredChartVersion:
            deploymentAppType === DeploymentAppTypes.GITOPS
                ? argoAppSourceDetails?.chartMetadata?.requiredChartVersion || ''
                : helmReleaseMetadata?.chart?.metadata?.version || '',
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
}: Pick<GenericAppType, 'appName' | 'namespace'>): SelectMigrateAppOptionType => ({
    label: appName || '',
    value: {
        appName: appName || '',
        namespace: namespace || '',
    },
    description: `Namespace: ${namespace || '--'}`,
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

export const getTargetClusterTooltipInfo = (isMigratingFromHelm: boolean) => ({
    heading: 'Target cluster',
    infoList: [
        `Cluster in which the ${isMigratingFromHelm ? 'Helm Release' : 'Argo CD application'} is deploying your microservice`,
    ],
})

export const getTargetNamespaceTooltipInfo = (isMigratingFromHelm: boolean) => ({
    heading: 'Target Namespace',
    infoList: [
        `Namespace in which the ${isMigratingFromHelm ? 'Helm Release' : 'Argo CD application'} is deploying your microservice`,
    ],
})

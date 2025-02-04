import { Link } from 'react-router-dom'
import { GenericAppType } from '@Components/app/list-new/AppListType'
import { URLS } from '@Config/routes'
import { ValidateMigrationSourceDTO } from '../cdPipeline.types'
import { SelectArgoAppOptionType, SelectClusterOptionType } from './types'

export const sanitizeValidateMigrationSourceResponse = (
    response: ValidateMigrationSourceDTO,
): ValidateMigrationSourceDTO => {
    const { isLinkable, errorDetail, applicationMetadata } = response || {}
    const { source, destination, status } = applicationMetadata || {}

    return {
        isLinkable: isLinkable || false,
        errorDetail: {
            validationFailedReason: errorDetail?.validationFailedReason,
            validationFailedMessage: errorDetail?.validationFailedMessage || '',
        },
        applicationMetadata: {
            status,
            source: {
                repoURL: source?.repoURL || '',
                chartPath: source?.chartPath || '',
                chartMetadata: {
                    requiredChartVersion: source?.chartMetadata?.requiredChartVersion || '',
                    savedChartName: source?.chartMetadata?.savedChartName || '',
                    valuesFileName: source?.chartMetadata?.valuesFileName || '',
                    requiredChartName: source?.chartMetadata?.requiredChartName || '',
                },
            },
            destination: {
                clusterName: destination?.clusterName || '',
                clusterServerUrl: destination?.clusterServerUrl || '',
                namespace: destination?.namespace || '',
                environmentName: destination?.environmentName || '',
                environmentId: destination?.environmentId || 0,
            },
        },
    }
}

export const generateClusterOption = (clusterName: string, clusterId: number): SelectClusterOptionType => ({
    label: clusterName,
    value: clusterId,
})

export const generateArgoAppOption = ({
    appName,
    namespace,
}: Pick<GenericAppType, 'appName' | 'namespace'>): SelectArgoAppOptionType => ({
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

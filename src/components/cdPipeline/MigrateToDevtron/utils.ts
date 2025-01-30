import { ValidateMigrationSourceDTO } from '../cdPipeline.types'

export const sanitizeValidateMigrationSourceResponse = (
    response: ValidateMigrationSourceDTO,
): ValidateMigrationSourceDTO => {
    const { isLinkable, errorDetail, applicationMetadata } = response
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

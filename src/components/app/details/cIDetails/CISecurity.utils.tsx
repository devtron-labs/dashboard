import { getSecurityScan, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { getLastExecutionByAppArtifactId } from '@Services/service'
import { UseGetCISecurityDetailsProps, UseGetCISecurityDetailsReturnType } from './types'

export const useGetCISecurityDetails = ({
    appId,
    artifactId,
    isJobCard,
    isSecurityScanV2Enabled,
}: UseGetCISecurityDetailsProps): UseGetCISecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ artifactId, ...(isJobCard && { appId }) }),
        [artifactId, appId],
        isSecurityScanV2Enabled,
    )

    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getLastExecutionByAppArtifactId(artifactId, isJobCard ? appId : null),
        [artifactId, appId],
        !isSecurityScanV2Enabled,
    )

    return {
        scanDetailsLoading: scanResultLoading || executionDetailsLoading,
        scanResultResponse,
        executionDetailsResponse,
        scanDetailsError: scanResultError || executionDetailsError,
        reloadScanDetails: isSecurityScanV2Enabled ? reloadScanResult : reloadExecutionDetails,
    }
}

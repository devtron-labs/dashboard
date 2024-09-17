import { ApiResponseResultType, AppDetailsPayload, ResponseType, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { getLastExecutionByAppArtifactId } from '@Services/service'
import { importComponentFromFELibrary } from '@Components/common'
import { UseGetCISecurityDetailsProps, UseGetCISecurityDetailsReturnType } from './types'

const getSecurityScan: ({
    appId,
    envId,
    installedAppId,
}: AppDetailsPayload) => Promise<ResponseType<ApiResponseResultType>> = importComponentFromFELibrary(
    'getSecurityScan',
    null,
    'function',
)

export const useGetCISecurityDetails = ({
    appId,
    artifactId,
    isSecurityScanV2Enabled,
}: UseGetCISecurityDetailsProps): UseGetCISecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ artifactId, appId }),
        [artifactId, appId],
        isSecurityScanV2Enabled,
    )

    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getLastExecutionByAppArtifactId(artifactId, appId),
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

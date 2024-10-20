import {
    ApiResponseResultType,
    AppDetailsPayload,
    getSeverityCountFromSummary,
    getTotalSeverityCount,
    ResponseType,
    SeverityCount,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
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

    const severityCount: SeverityCount = isSecurityScanV2Enabled
        ? getSeverityCountFromSummary(scanResultResponse?.result.imageScan.vulnerability?.summary.severities)
        : (executionDetailsResponse?.result.severityCount ?? { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 })

    const totalCount = getTotalSeverityCount(severityCount)

    return {
        scanDetailsLoading: scanResultLoading || executionDetailsLoading,
        scanResultResponse,
        executionDetailsResponse,
        scanDetailsError: scanResultError || executionDetailsError,
        reloadScanDetails: isSecurityScanV2Enabled ? reloadScanResult : reloadExecutionDetails,
        severityCount,
        totalCount,
    }
}

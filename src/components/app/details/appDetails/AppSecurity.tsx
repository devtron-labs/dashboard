import {
    ApiResponseResultType,
    AppDetailsPayload,
    getExecutionDetails,
    getSeverityCountFromSummary,
    getTotalSeverityCount,
    ResponseType,
    SeverityCount,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { UseGetAppSecurityDetailsProps, UseGetAppSecurityDetailsReturnType } from './appDetails.type'

const getSecurityScan: ({
    appId,
    envId,
    installedAppId,
}: AppDetailsPayload) => Promise<ResponseType<ApiResponseResultType>> = importComponentFromFELibrary(
    'getSecurityScan',
    null,
    'function',
)

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    installedAppId,
    artifactId,
    imageScanDeployInfoId,
    isSecurityScanV2Enabled,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, installedAppId }),
        [appId, envId, installedAppId],
        getSecurityScan && isSecurityScanV2Enabled && (!!appId || !!installedAppId),
    )

    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getExecutionDetails(artifactId ? { appId, envId, artifactId } : { appId, envId, imageScanDeployInfoId }),
        [appId, envId, imageScanDeployInfoId, artifactId],
        !isSecurityScanV2Enabled && !!appId,
    )

    const scanDetailsResponse = isSecurityScanV2Enabled ? scanResultResponse : executionDetailsResponse

    const severities = isSecurityScanV2Enabled
        ? scanResultResponse?.result.imageScan.vulnerability?.summary.severities
        : executionDetailsResponse?.result.imageScan.vulnerability?.summary.severities
    const severityCount: SeverityCount = getSeverityCountFromSummary(severities)

    const totalCount = getTotalSeverityCount(severityCount)

    return {
        scanDetailsLoading: scanResultLoading || executionDetailsLoading,
        scanDetailsResponse,
        scanDetailsError: scanResultError || executionDetailsError,
        reloadScanDetails: isSecurityScanV2Enabled ? reloadScanResult : reloadExecutionDetails,
        severityCount,
        totalCount,
    }
}

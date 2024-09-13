import { getSecurityScan, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { getLastExecutionMinByAppAndEnv } from '@Services/service'
import { UseGetAppSecurityDetailsProps, UseGetAppSecurityDetailsReturnType } from './appDetails.type'

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    isSecurityScanV2Enabled,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId }),
        [appId, envId],
        isSecurityScanV2Enabled,
    )

    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getLastExecutionMinByAppAndEnv(appId, envId),
        [appId, envId],
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

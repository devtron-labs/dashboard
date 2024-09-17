import {
    ApiResponseResultType,
    AppDetailsPayload,
    getExecutionDetails,
    ResponseType,
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
    isSecurityScanV2Enabled,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, installedAppId }),
        [appId, envId, installedAppId],
        getSecurityScan && isSecurityScanV2Enabled,
    )

    const [executionDetailsLoading, executionDetailsResponse, executionDetailsError, reloadExecutionDetails] = useAsync(
        () => getExecutionDetails({ appId, envId }),
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

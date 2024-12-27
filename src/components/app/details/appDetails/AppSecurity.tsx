import { useAsync, getSecurityScan } from '@devtron-labs/devtron-fe-common-lib'
import { UseGetAppSecurityDetailsProps, UseGetAppSecurityDetailsReturnType } from './appDetails.type'

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    artifactId,
    installedAppId,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, artifactId, installedAppId }),
        [appId, envId, installedAppId],
        (!!appId && !!envId) || !!installedAppId,
    )

    return {
        scanResultLoading,
        scanResultResponse,
        scanResultError,
        reloadScanResult,
    }
}

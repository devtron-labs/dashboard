import {
    getSeverityCountFromSummary,
    getTotalSeverityCount,
    SeverityCount,
    useAsync,
    getSecurityScan,
} from '@devtron-labs/devtron-fe-common-lib'
import { UseGetAppSecurityDetailsProps, UseGetAppSecurityDetailsReturnType } from './appDetails.type'

export const useGetAppSecurityDetails = ({
    appId,
    envId,
    installedAppId,
}: UseGetAppSecurityDetailsProps): UseGetAppSecurityDetailsReturnType => {
    const [scanResultLoading, scanResultResponse, scanResultError, reloadScanResult] = useAsync(
        () => getSecurityScan({ appId, envId, installedAppId }),
        [appId, envId, installedAppId],
        (!!appId && !!envId) || !!installedAppId,
    )

    const severities = scanResultResponse?.result.imageScan?.vulnerability?.summary.severities
    const severityCount: SeverityCount = getSeverityCountFromSummary(severities)

    const totalCount = getTotalSeverityCount(severityCount)

    return {
        scanResultLoading,
        scanResultResponse,
        scanResultError,
        reloadScanResult,
        severityCount,
        totalCount,
    }
}

import { useParams } from 'react-router-dom'

import {
    EMPTY_STATE_STATUS,
    ErrorScreenManager,
    GenericEmptyState,
    Progressing,
    ReportTabEmptyState,
    SecurityDetailsCards,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { useGetAppSecurityDetails, useGetAppSecurityDetailsRecommendations } from '../appDetails/AppSecurity'
import { CIRunningView } from './cIDetails.util'
import { SecurityTabType } from './types'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')
const DockerfileScansRecommendations = importComponentFromFELibrary('DockerfileScansRecommendations')
const getSecurityScanRecommendationTitle = importComponentFromFELibrary(
    'getSecurityScanRecommendationTitle',
    null,
    'function',
)

export const SecurityTab = ({ artifactId, status, appIdFromParent }: SecurityTabType) => {
    const { appId, buildId } = useParams<{ appId: string; buildId: string }>()
    const { forceDockerfileScan } = useMainContext()

    const computedAppId = appId ?? appIdFromParent

    const { scanResultLoading, scanResultResponse, scanResultError, reloadScanResult } = useGetAppSecurityDetails({
        appId: +computedAppId,
        artifactId,
    })

    const {
        scanRecommendationsResultLoading,
        scanRecommendationsResultResponse,
        scanRecommendationsResultError,
        reloadScanRecommendationsResult,
    } = useGetAppSecurityDetailsRecommendations({
        appId: +computedAppId,
        buildId: +buildId,
    })

    const renderDockerfileScannerContent = () => {
        const scanResult = scanRecommendationsResultResponse?.result
        if (scanRecommendationsResultError) {
            return (
                <div className="p-20">
                    <ErrorScreenManager
                        code={scanRecommendationsResultError.code}
                        reload={reloadScanRecommendationsResult}
                    />
                </div>
            )
        }

        if ((scanRecommendationsResultLoading || scanResult?.scanEnabled) && !scanResult?.results) {
            return (
                <div className="flexbox-col h-150">
                    <Progressing />
                </div>
            )
        }
        if (!forceDockerfileScan && !scanResult?.results) {
            return <ReportTabEmptyState title="Dockerfile scan was disabled" subtitle="" />
        }

        return <DockerfileScansRecommendations scanRecommendationResponse={scanRecommendationsResultResponse} />
    }

    const renderDockerfileScanRecommendation = () => (
        <div className="flexbox-col dc__gap-16 ">
            {!!getSecurityScanRecommendationTitle && getSecurityScanRecommendationTitle()}

            <div className="en-2 bw-1 br-8 cn-9">{renderDockerfileScannerContent()}</div>
        </div>
    )

    const renderHeader = () => (
        <div className="flexbox dc__content-space pb-8 dc__border-bottom-n1">
            <span className="fs-13 fw-6 lh-1-5 cn-9">Security Scan</span>
        </div>
    )

    const renderSecurityScanContent = () => {
        const normalizedStatus = status?.toLowerCase()

        if (scanResultLoading) {
            return (
                <div className="flex en-2 bw-1 p-20 h-150 br-8 h-150">
                    <Progressing />
                </div>
            )
        }

        if (['starting', 'running'].includes(normalizedStatus)) {
            return <CIRunningView isSecurityTab />
        }

        if (!artifactId) {
            return (
                <div className="flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 p-16">
                    <GenericEmptyState
                        title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                        subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
                    />
                </div>
            )
        }

        if (scanResultError) {
            return (
                <div className="flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 p-16">
                    <ErrorScreenManager code={scanResultError.code} reload={reloadScanResult} />
                </div>
            )
        }
        return <SecurityDetailsCards scanResult={scanResultResponse?.result} Sidebar={SecurityModalSidebar} />
    }

    const renderSecurityDetailsCards = () => (
        <div className="flexbox-col dc__gap-16">
            {renderHeader()}
            {renderSecurityScanContent()}
        </div>
    )

    return (
        <div className="bg__primary flex-grow-1 p-16">
            <div className="flexbox-col mw-600 dc__mxw-1000 dc__gap-16">
                {DockerfileScansRecommendations && renderDockerfileScanRecommendation()}
                {renderSecurityDetailsCards()}
            </div>
        </div>
    )
}

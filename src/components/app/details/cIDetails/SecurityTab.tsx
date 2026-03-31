import { useParams } from 'react-router-dom'

import {
    ErrorScreenManager,
    GenericEmptyState,
    Progressing,
    ReportTabEmptyState,
    SecurityDetailsCards,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MechanicalOperation } from '@Images/ic-mechanical-operation.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { EMPTY_STATE_STATUS } from '@Config/constantMessaging'

import { useGetAppSecurityDetails, useGetAppSecurityDetailsRecommendations } from '../appDetails/AppSecurity'
import { getSecurityScanRecommendationTitle } from './SecurityScanRecommendation/SecurityRecommendation.utils'
import { SecurityScansRecommendations } from './SecurityScanRecommendation/SecurityScanRecommendations.components'
import { CIRunningView } from './cIDetails.util'
import { SecurityTabType } from './types'

const SecurityModalSidebar = importComponentFromFELibrary('SecurityModalSidebar', null, 'function')

export const SecurityTab = ({ artifactId, status, appIdFromParent }: SecurityTabType) => {
    const { appId, buildId } = useParams<{ appId: string; buildId: string }>()
    const { isEnterprise, forceDockerfileScan } = useMainContext()

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

    const renderSecurityScanRecommendation = () => {
        if (!forceDockerfileScan && !scanRecommendationsResultResponse?.result?.results?.length) {
            return <ReportTabEmptyState title="Dockerfile scan is disabled" subtitle="" />
        }

        if (scanRecommendationsResultLoading) {
            return (
                <div className="flexbox-col dc__gap-16 mw-600 dc__mxw-1000 ">
                    {getSecurityScanRecommendationTitle()}
                    <div className="flex en-2 bw-1 p-20 h-200 br-8">
                        <Progressing />
                    </div>
                </div>
            )
        }

        return (
            <div className="flexbox-col dc__gap-16 mw-600 dc__mxw-1000">
                {getSecurityScanRecommendationTitle()}
                {scanRecommendationsResultError && (
                    <div className="flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 p-16">
                        {scanRecommendationsResultError.code === 404 ? (
                            <GenericEmptyState title="Dockerfile scan not found" SvgImage={MechanicalOperation} />
                        ) : (
                            <ErrorScreenManager
                                code={scanRecommendationsResultError.code}
                                reload={reloadScanRecommendationsResult}
                            />
                        )}
                    </div>
                )}
                <SecurityScansRecommendations
                    scanRecommendationLoading={scanRecommendationsResultLoading}
                    scanRecommendationResponse={scanRecommendationsResultResponse}
                />
            </div>
        )
    }

    const renderHeader = () => (
        <div className="flexbox dc__content-space pb-8 dc__border-bottom-n1">
            <span className="fs-13 fw-6 lh-1-5 cn-9">Security Scan</span>
        </div>
    )
    const renderSecurityDetailsCards = () => {
        const normalizedStatus = status?.toLowerCase()

        if (['starting', 'running'].includes(normalizedStatus)) {
            return (
                <div className="flexbox-col mw-600 dc__mxw-1000">
                    {renderHeader()}
                    <CIRunningView isSecurityTab />
                </div>
            )
        }

        if (!artifactId) {
            return (
                <div className="flexbox-col mw-600 dc__mxw-1000 dc__gap-12">
                    {renderHeader()}
                    <div className="flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 p-16">
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsGenerated}
                            subTitle={EMPTY_STATE_STATUS.ARTIFACTS_EMPTY_STATE_TEXTS.NoArtifactsError}
                        />
                    </div>
                </div>
            )
        }

        if (scanResultLoading) {
            return (
                <div className="bg__primary flex-grow-1">
                    <Progressing pageLoader />
                </div>
            )
        }

        if (scanResultError) {
            return (
                <div className="flexbox-col mw-600 dc__mxw-1000">
                    {renderHeader()}
                    <div className="flexbox-col en-2 bw-1 br-8 dc__gap-16 cn-9 p-16">
                        <ErrorScreenManager code={scanResultError.code} reload={reloadScanResult} />
                    </div>
                </div>
            )
        }

        return <SecurityDetailsCards scanResult={scanResultResponse?.result} Sidebar={SecurityModalSidebar} />
    }

    return (
        <div className="flexbox-col bg__primary flex-grow-1 dc__gap-16 p-16">
            {isEnterprise && renderSecurityScanRecommendation()}
            {renderSecurityDetailsCards()}
        </div>
    )
}

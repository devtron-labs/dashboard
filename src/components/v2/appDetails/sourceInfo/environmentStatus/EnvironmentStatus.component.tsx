import React, { useMemo, useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.scss'
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg'
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as File } from '../../../../../assets/icons/ic-file.svg'
import IndexStore from '../../index.store'
import { URLS } from '../../../../../config'
import { AppType } from '../../../appDetails/appDetails.type'
import { useSharedState } from '../../../utils/useSharedState'
import { Link } from 'react-router-dom'
import { useRouteMatch, useHistory, useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import NotesDrawer from './NotesDrawer'
import { getInstalledChartNotesDetail } from '../../appDetails.api'
import { importComponentFromFELibrary } from '../../../../common'
import { DeploymentAppTypes, noop, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentStatusComponentType } from '../environment.type'
import HelmAppConfigApplyStatusCard from './HelmAppConfigApplyStatusCard'
import LastUpdatedCard from '../../../../app/details/appDetails/LastUpdatedCard'
import AppStatusCard from '../../../../app/details/appDetails/AppStatusCard'
import DeploymentStatusCard from '../../../../app/details/appDetails/DeploymentStatusCard'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')

function EnvironmentStatusComponent({
    appStreamData,
    loadingDetails,
    loadingResourceTree,
    deploymentStatusDetailsBreakdownData,
    isVirtualEnvironment,
    isHelmApp,
    refetchDeploymentStatus,
}: EnvironmentStatusComponentType) {
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const status = appDetails.resourceTree?.status || ''
    const showHibernationStatusMessage =
        status.toLowerCase() === 'hibernated' || status.toLowerCase() === 'partially hibernated'
    const { url } = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; envId: string }>()
    const [, notesResult] = useAsync(() => getInstalledChartNotesDetail(+params.appId, +params.envId), [])

    const onClickUpgrade = () => {
        let _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_VALUES}`
        history.push(_url)
    }

    const notes = appDetails.notes || notesResult?.result?.gitOpsNotes

    const cardLoading = useMemo(() => loadingDetails || loadingResourceTree, [loadingDetails, loadingResourceTree])

    const shimmerLoaderBlocks = () => {
        return (
            <div className="flex left ml-20 mb-16">
                <div className="bcn-0 w-150 mh-92  mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
                <div className="bcn-0 w-150 mh-92  mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
                <div className="bcn-0 w-150 mh-92  mr-12 br-8 dc__position-rel">
                    <div className="flex left column mt-6 w-85 ml-16 dc__place-abs-shimmer-center">
                        <div className="shimmer-loading w-80px h-20 br-2 mb-6" />
                        <div className="shimmer-loading w-60 h-16 br-2 mb-6" />
                    </div>
                </div>
            </div>
        )
    }

    const renderStatusBlock = () => {
        if (!status) return null
        return (
            <AppStatusCard
                appDetails={appDetails}
                status={status}
                setDetailed={setShowAppStatusDetail}
                cardLoading={cardLoading}
            />
        )
    }

    const onClickShowNotes = () => {
        setShowNotes(true)
    }

    const renderHelmConfigApplyStatusBlock = () => {
        if (
            appDetails?.appType === AppType.EXTERNAL_HELM_CHART ||
            (appDetails?.deploymentAppType === DeploymentAppTypes.HELM &&
                appDetails?.appType === AppType.DEVTRON_HELM_CHART)
        ) {
            return <HelmAppConfigApplyStatusCard releaseStatus={appDetails.helmReleaseStatus} />
        }
        return null
    }

    const renderGeneratedManifestDownloadCard = (): JSX.Element => {
        if (AppDetailsDownloadCard) {
            const deploymentManifestParams = {
                appId: +params.appId,
                envId: +params.envId,
                appName: appDetails?.helmPackageName,
                isHelmApp: true,
            }
            return <AppDetailsDownloadCard params={deploymentManifestParams} />
        }
    }

    const renderLastUpdatedBlock = () => {
        if (
            appDetails?.deploymentAppType === DeploymentAppTypes.HELM &&
            appDetails?.appType === AppType.DEVTRON_HELM_CHART &&
            appDetails?.lastDeployedTime
        ) {
            return (
                <LastUpdatedCard
                    deploymentTriggerTime={appDetails?.lastDeployedTime}
                    triggeredBy={appDetails?.lastDeployedBy}
                />
            )
        }
        return (
            <DeploymentStatusCard
                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                cardLoading={cardLoading}
                hideDetails={false}
                refetchDeploymentStatus={refetchDeploymentStatus}
                isVirtualEnvironment={isVirtualEnvironment}
            />
        )
    }

    const renderChartUsedBlock = () => {
        return (
            appDetails?.appStoreAppName && (
                <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12  ">
                    <div className="cn-9 flex left">
                        <span data-testid="chart-used-heading">Chart used</span>
                        <Tippy
                            className="default-tt cursor"
                            arrow={false}
                            content={'Chart used to deploy to this application'}
                        >
                            <Question className="cursor icon-dim-16 ml-4" />
                        </Tippy>
                    </div>
                    <div className=" fw-6 fs-14" data-testid="full-chart-name-with-version">
                        {appDetails.appStoreChartName && (
                            <span data-testid="chart-name-value">{appDetails.appStoreChartName}/</span>
                        )}
                        <Link
                            className="cb-5 fw-6"
                            to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}
                            style={{ pointerEvents: !appDetails.appStoreChartId ? 'none' : 'auto' }}
                        >
                            {appDetails.appStoreAppName}({appDetails.appStoreAppVersion})
                        </Link>
                    </div>
                    <div className="flex left">
                        {notes && (
                            <div
                                className="details-hover flex cb-5 fw-6 cursor"
                                onClick={onClickShowNotes}
                                data-testid="notes.txt-heading"
                            >
                                <File className="app-notes__icon icon-dim-16 mr-4" /> Notes.txt
                            </div>
                        )}
                    </div>
                </div>
            )
        )
    }

    const renderUpgraderChartBlock = () => {
        return (
            appDetails?.deprecated && (
                <div className="app-status-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12  ">
                    <div className="cn-9 flex left">
                        <span>Chart deprecated</span>
                        <Alert className="icon-dim-16 ml-4" />
                    </div>
                    <div className=" fw-6 fs-14">Upgrade required</div>
                    <div onClick={onClickUpgrade} className="cursor cb-5 fw-6">
                        Upgrade chart
                    </div>
                </div>
            )
        )
    }

    return (
        <div>
            {loadingDetails ? (
                shimmerLoaderBlocks()
            ) : (
                <div className="flex left ml-20 mb-16 lh-20">
                    {isVirtualEnvironment ? renderGeneratedManifestDownloadCard() : renderStatusBlock()}
                    {renderHelmConfigApplyStatusBlock()}
                    {renderLastUpdatedBlock()}
                    {renderChartUsedBlock()}
                    {renderUpgraderChartBlock()}
                </div>
            )}
            {showAppStatusDetail && (
                <AppStatusDetailModal
                    close={() => {
                        setShowAppStatusDetail(false)
                    }}
                    appStreamData={appStreamData}
                    showAppStatusMessage={showHibernationStatusMessage}
                />
            )}
            {showNotes && (
                <NotesDrawer
                    notes={notes}
                    close={() => {
                        setShowNotes(false)
                    }}
                />
            )}
        </div>
    )
}

export default EnvironmentStatusComponent

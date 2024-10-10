/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo, useState } from 'react'
import AppStatusDetailModal from './AppStatusDetailModal'
import './environmentStatus.scss'
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg'
import IndexStore from '../../index.store'
import { URLS } from '../../../../../config'
import { AppType } from '../../appDetails.type'
import { useSharedState } from '../../../utils/useSharedState'
import { useRouteMatch, useHistory, useParams } from 'react-router-dom'
import NotesDrawer from './NotesDrawer'
import { getInstalledChartNotesDetail } from '../../appDetails.api'
import { importComponentFromFELibrary } from '../../../../common'
import { DeploymentAppTypes, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentStatusComponentType } from '../environment.type'
import HelmAppConfigApplyStatusCard from './HelmAppConfigApplyStatusCard'
import AppStatusCard from '../../../../app/details/appDetails/AppStatusCard'
import DeploymentStatusCard from '../../../../app/details/appDetails/DeploymentStatusCard'
import ChartUsedCard from './ChartUsedCard'
import LastUpdatedCard from '../../../../app/details/appDetails/LastUpdatedCard'
import LoadingCard from '../../../../app/details/appDetails/LoadingCard'
import IssuesCard from '../../../../app/details/appDetails/IssuesCard'
import { ErrorItem } from '../../../../app/details/appDetails/appDetails.type'
import IssuesListingModal from '../../../../app/details/appDetails/IssuesListingModal'
import SecurityVulnerabilityCard from '../../../../app/details/appDetails/SecurityVulnerabilityCard'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

const EnvironmentStatusComponent = ({
    loadingDetails,
    loadingResourceTree,
    deploymentStatusDetailsBreakdownData,
    isVirtualEnvironment,
    refetchDeploymentStatus,
}: EnvironmentStatusComponentType) => {
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const status = appDetails.resourceTree?.status || appDetails?.appStatus || ''
    const showHibernationStatusMessage =
        status.toLowerCase() === 'hibernated' || status.toLowerCase() === 'partially hibernated'
    const { url } = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; envId: string }>()
    const [, notesResult] = useAsync(() => getInstalledChartNotesDetail(+params.appId, +params.envId), [])
    const [errorsList, setErrorsList] = useState<ErrorItem[]>([])
    const [showIssuesModal, toggleIssuesModal] = useState<boolean>(false)
    const isScanV2Enabled = window._env_.ENABLE_RESOURCE_SCAN_V2 && isFELibAvailable

    const onClickUpgrade = () => {
        const _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_VALUES}`
        history.push(_url)
    }

    const notes = appDetails.notes || notesResult?.result?.gitOpsNotes

    const cardLoading = useMemo(() => loadingDetails || loadingResourceTree, [loadingDetails, loadingResourceTree])

    const shimmerLoaderBlocks = () => {
        const loadingCards = []
        for (let i = 0; i < 4; i++) {
            loadingCards.push(<LoadingCard key={i} />)
        }

        return <div className="flex left ml-20 mb-16">{loadingCards}</div>
    }
    const renderStatusBlock = () => {
        if (!status) {
            return null
        }
        return (
            <AppStatusCard
                appDetails={appDetails}
                status={status}
                setDetailed={setShowAppStatusDetail}
                cardLoading={cardLoading}
                message={appDetails.FluxAppStatusDetail?.message} // Show Message in case of FluxCD Apps
            />
        )
    }

    const renderIssuesCard = () => {
        return (
            <IssuesCard
                cardLoading={cardLoading}
                setErrorsList={setErrorsList}
                toggleIssuesModal={toggleIssuesModal}
                setDetailed={setShowAppStatusDetail}
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
            return (
                <HelmAppConfigApplyStatusCard releaseStatus={appDetails.helmReleaseStatus} cardLoading={cardLoading} />
            )
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
        if (appDetails?.appType === AppType.DEVTRON_HELM_CHART && appDetails?.lastDeployedTime) {
            if (appDetails?.deploymentAppType === DeploymentAppTypes.HELM) {
                return (
                    <LastUpdatedCard
                        deploymentTriggerTime={appDetails?.lastDeployedTime}
                        triggeredBy={appDetails?.lastDeployedBy}
                        cardLoading={cardLoading}
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
        return null
    }

    const renderChartUsedBlock = () => {
        if (!appDetails.appStoreAppName) {
            return null
        }
        return (
            <ChartUsedCard
                appDetails={appDetails}
                notes={notes}
                onClickShowNotes={onClickShowNotes}
                cardLoading={cardLoading}
            />
        )
    }

    const renderUpgraderChartBlock = () => {
        return (
            appDetails?.deprecated && (
                <div className="chart-upgrade-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12  ">
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
                    {renderIssuesCard()}
                    {renderHelmConfigApplyStatusBlock()}
                    {renderLastUpdatedBlock()}
                    {renderChartUsedBlock()}
                    {renderUpgraderChartBlock()}
                    {isScanV2Enabled && appDetails?.appType === AppType.DEVTRON_HELM_CHART && <SecurityVulnerabilityCard cardLoading={cardLoading} installedAppId={appDetails?.installedAppId} />}
                </div>
            )}
            {showAppStatusDetail && (
                <AppStatusDetailModal
                    close={() => {
                        setShowAppStatusDetail(false)
                    }}
                    showAppStatusMessage={showHibernationStatusMessage}
                />
            )}
            {showIssuesModal && (
                <IssuesListingModal errorsList={errorsList} closeIssuesListingModal={() => toggleIssuesModal(false)} />
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

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
import './environmentStatus.scss'
import IndexStore from '../../index.store'
import { URLS } from '../../../../../config'
import { AppType } from '../../appDetails.type'
import { useSharedState } from '../../../utils/useSharedState'
import { useRouteMatch, useHistory, useParams } from 'react-router-dom'
import NotesDrawer from './NotesDrawer'
import { getInstalledChartNotesDetail } from '../../appDetails.api'
import { importComponentFromFELibrary } from '../../../../common'
import {
    AppStatusModal,
    DeploymentAppTypes,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
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
const ExplainWithAIButton = importComponentFromFELibrary('ExplainWithAIButton', null, 'function')
const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')

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
    const { url } = useRouteMatch()
    const history = useHistory()
    const params = useParams<{ appId: string; envId: string }>()
    const [, notesResult] = useAsync(() => getInstalledChartNotesDetail(+params.appId, +params.envId), [])
    const [errorsList, setErrorsList] = useState<ErrorItem[]>([])
    const [showIssuesModal, toggleIssuesModal] = useState<boolean>(false)

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
                appName: appDetails?.helmPackageName || 'helm-package',
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
                onClickUpgrade={onClickUpgrade}
            />
        )
    }

    const handleCloseAppStatusModal = () => {
        setShowAppStatusDetail(false)
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
                    {isFELibAvailable && appDetails?.appType === AppType.DEVTRON_HELM_CHART && (
                        <SecurityVulnerabilityCard
                            cardLoading={cardLoading}
                            installedAppId={appDetails?.installedAppId}
                        />
                    )}
                </div>
            )}
            {showAppStatusDetail && (
                <AppStatusModal
                    titleSegments={[
                        appDetails?.appName,
                        appDetails?.environmentName || appDetails?.namespace,
                    ]}
                    handleClose={handleCloseAppStatusModal}
                    type="other-apps"
                    appDetails={appDetails}
                    isConfigDriftEnabled={false}
                    configDriftModal={null}
                    debugWithAIButton={ExplainWithAIButton}
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

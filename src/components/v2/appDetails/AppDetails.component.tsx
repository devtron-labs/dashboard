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

import { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import {
    AppStatusModal,
    AppStatusModalTabType,
    DeploymentAppTypes,
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
    noop,
    processDeploymentStatusDetailsData,
    Progressing,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterMetaDataBar } from '@Components/common/ClusterMetaDataBar/ClusterMetaDataBar'

import { DEFAULT_STATUS, DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../config'
import { getDeploymentStatusDetail } from '../../app/details/appDetails/appDetails.service'
import { importComponentFromFELibrary } from '../../common'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import { useSharedState } from '../utils/useSharedState'
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component'
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component'
import { getSaveTelemetry } from './appDetails.api'
import { AppDetailsComponentType, AppType } from './appDetails.type'
import IndexStore from './index.store'
import NodeTreeDetailTab from './NodeTreeDetailTab'
import ReleaseStatusEmptyState from './ReleaseStatusEmptyState'

import './appDetails.scss'

let deploymentStatusTimer = null
const VirtualAppDetailsEmptyState = importComponentFromFELibrary('VirtualAppDetailsEmptyState')
const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary(
    'processVirtualEnvironmentDeploymentData',
    null,
    'function',
)

const AppDetailsComponent = ({
    externalLinks = [],
    monitoringTools = [],
    isExternalApp,
    _init,
    loadingDetails,
    loadingResourceTree,
    handleReloadResourceTree,
    // NOTE: this might seem like a duplicate of loadingResourceTree
    // but its not since loadingResourceTree runs a loader on the whole page
    isReloadResourceTreeInProgress,
}: AppDetailsComponentType) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const isVirtualEnv = useRef(appDetails?.isVirtualEnvironment)
    const location = useLocation()
    const history = useHistory()
    const isGitOps = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
    const isManifestDownload = appDetails?.deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...(isVirtualEnv.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData()
                : processDeploymentStatusDetailsData()),
            deploymentStatus: DEFAULT_STATUS,
        })

    useEffect(() => {
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId).catch(noop)
        }
    }, [])

    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    const getDeploymentDetailStepsData = (): void => {
        // TODO: Ask why are we not sending wfrId in the request in case of virtual environment?
        // Deployments status details for Helm apps
        getDeploymentStatusDetail(params.appId, params.envId, '', true)
            .then((deploymentStatusDetailRes) => {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                processDeploymentStatusData(deploymentStatusDetailRes.result)
            })
            .catch(noop)
    }

    useEffect(() => {
        // Get deployment status timeline on ArgoCD apps in devtron helm apps
        // i.e. Devtron Helm app deployed through GitOps /Manifest Download
        if ((isGitOps || isManifestDownload) && !isExternalApp) {
            getDeploymentDetailStepsData()
        }
        isVirtualEnv.current = appDetails?.isVirtualEnvironment
        return () => {
            clearDeploymentStatusTimer()
        }
    }, [appDetails.appId])

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData =
            isVirtualEnv.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData(deploymentStatusDetailRes)
                : processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        // If deployment status is in progress then fetch data in every 10 seconds
        if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
        } else {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 30000)
        }
        setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
    }

    const handleCloseDeploymentStatusModal = () => {
        history.replace({
            search: '',
        })
    }

    const handleUpdateDeploymentStatusDetailsBreakdownData = (
        updatedTimelineData: typeof deploymentStatusDetailsBreakdownData,
    ) => {
        setDeploymentStatusDetailsBreakdownData(updatedTimelineData)
    }

    const renderHelmAppDetails = (): JSX.Element => {
        if (isVirtualEnv.current && VirtualAppDetailsEmptyState) {
            return <VirtualAppDetailsEmptyState environmentName={appDetails.environmentName} />
        }
        if (
            appDetails &&
            !appDetails.resourceTree?.nodes?.length &&
            appDetails.deploymentAppType === DeploymentAppTypes.HELM &&
            appDetails.helmReleaseStatus &&
            appDetails.helmReleaseStatus.status &&
            (appDetails.helmReleaseStatus.status.toLowerCase() === DEPLOYMENT_STATUS.FAILED ||
                appDetails.helmReleaseStatus.status.toLowerCase() === DEPLOYMENT_STATUS.PROGRESSING ||
                appDetails.helmReleaseStatus.status.toLowerCase() === DEPLOYMENT_STATUS.UNKNOWN)
        ) {
            return (
                <ReleaseStatusEmptyState
                    message={appDetails.helmReleaseStatus.message}
                    description={
                        appDetails.helmReleaseStatus.status.toLowerCase() === DEPLOYMENT_STATUS.UNKNOWN
                            ? ''
                            : appDetails.helmReleaseStatus.description
                    }
                />
            )
        }
        return (
            <NodeTreeDetailTab
                appDetails={appDetails}
                externalLinks={externalLinks}
                monitoringTools={monitoringTools}
                isExternalApp={isExternalApp}
                isVirtualEnvironment={isVirtualEnv.current}
                handleReloadResourceTree={handleReloadResourceTree}
                isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
            />
        )
    }

    return (
        <>
            <div className="dc__overflow-hidden flex-grow-1 flexbox-col dc__position-rel">
                <div className="helm-details dc__overflow-auto flex-grow-1" data-testid="app-details-wrapper">
                    <div className="app-info-bg-gradient">
                        <EnvironmentSelectorComponent
                            isExternalApp={isExternalApp}
                            _init={_init}
                            loadingDetails={loadingDetails}
                            loadingResourceTree={loadingResourceTree || !appDetails?.appType}
                            isVirtualEnvironment={isVirtualEnv.current}
                        />
                        {!appDetails.deploymentAppDeleteRequest && (
                            <EnvironmentStatusComponent
                                loadingDetails={loadingDetails || !appDetails?.appType}
                                loadingResourceTree={loadingResourceTree || !appDetails?.appType}
                                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                                isVirtualEnvironment={isVirtualEnv.current}
                                handleUpdateDeploymentStatusDetailsBreakdownData={
                                    handleUpdateDeploymentStatusDetailsBreakdownData
                                }
                            />
                        )}
                    </div>

                    {!appDetails.deploymentAppDeleteRequest && (
                        <AppLevelExternalLinks
                            helmAppDetails={appDetails}
                            externalLinks={externalLinks}
                            monitoringTools={monitoringTools}
                        />
                    )}
                    {loadingResourceTree ? (
                        <div className="bg__primary dc__border-top h-100">
                            <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                        </div>
                    ) : (
                        renderHelmAppDetails()
                    )}

                    {appDetails && location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                        <AppStatusModal
                            type="other-apps"
                            titleSegments={[appDetails?.appName, appDetails?.environmentName || appDetails?.namespace]}
                            handleClose={handleCloseDeploymentStatusModal}
                            // TODO: Check appDetails.deploymentAppDeleteRequest
                            appDetails={appDetails}
                            isConfigDriftEnabled={false}
                            configDriftModal={null}
                            initialTab={AppStatusModalTabType.DEPLOYMENT_STATUS}
                            processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                            handleUpdateDeploymentStatusDetailsBreakdownData={
                                handleUpdateDeploymentStatusDetailsBreakdownData
                            }
                        />
                    )}
                </div>
            </div>
            <ClusterMetaDataBar
                clusterName={appDetails.clusterName}
                namespace={appDetails.namespace}
                clusterId={appDetails.clusterId?.toString()}
            />
        </>
    )
}

export default AppDetailsComponent

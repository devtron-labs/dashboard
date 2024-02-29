import React, { useEffect, useRef, useState } from 'react'
import './appDetails.scss'
import { useLocation, useParams } from 'react-router'
import { DeploymentAppTypes, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { AppDetailsComponentType, AppType } from './appDetails.type'
import IndexStore from './index.store'
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component'
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component'
import { importComponentFromFELibrary } from '../../common'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import NodeTreeDetailTab from './NodeTreeDetailTab'
import { getSaveTelemetry } from './appDetails.api'
import { getDeploymentStatusDetail } from '../../app/details/appDetails/appDetails.service'
import { DEFAULT_STATUS, DEFAULT_STATUS_TEXT, DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../config'
import DeploymentStatusDetailModal from '../../app/details/appDetails/DeploymentStatusDetailModal'
import {
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
} from '../../app/details/appDetails/appDetails.type'
import { processDeploymentStatusDetailsData } from '../../app/details/appDetails/utils'
import { useSharedState } from '../utils/useSharedState'
import ReleaseStatusEmptyState from './ReleaseStatusEmptyState'

let deploymentStatusTimer = null
const VirtualAppDetailsEmptyState = importComponentFromFELibrary('VirtualAppDetailsEmptyState')
const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary(
    'processVirtualEnvironmentDeploymentData',
    null,
    'function',
)

// This is being used in case of helm app detail page
const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
    isExternalApp,
    _init,
    loadingDetails,
    loadingResourceTree,
}: AppDetailsComponentType) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const isVirtualEnv = useRef(appDetails?.isVirtualEnvironment)
    const location = useLocation()
    const deploymentModalShownRef = useRef(null)
    const isExternalArgoApp = appDetails?.appType === AppType.EXTERNAL_ARGO_APP
    deploymentModalShownRef.current = location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM)
    // State to track the loading state for the timeline data when the detailed status modal opens
    const [isInitialTimelineDataLoading, setIsInitialTimelineDataLoading] = useState(true)
    const shouldFetchTimelineRef = useRef(false)

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...(isVirtualEnv.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData()
                : processDeploymentStatusDetailsData()),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS_TEXT,
        })

    useEffect(() => {
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId)
        }
    }, [])
    useEffect(() => {
        const isModalOpen = location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM)
        // Reset the loading state when the modal is closed
        if (shouldFetchTimelineRef.current && !isModalOpen) {
            setIsInitialTimelineDataLoading(true)
        }
        // The timeline should be fetched by default if the modal is open
        shouldFetchTimelineRef.current = isModalOpen
    }, [location.search])

    useEffect(() => {
        // Get deployment status timeline on argocd apps
        if (
            appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS ||
            appDetails?.deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD
        ) {
            getDeploymentDetailStepsData()
        }
        isVirtualEnv.current = appDetails?.isVirtualEnvironment
        return () => {
            clearDeploymentStatusTimer()
        }
    }, [appDetails.appId])

    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    const getDeploymentDetailStepsData = (showTimeline?: boolean): void => {
        const shouldFetchTimeline = showTimeline ?? shouldFetchTimelineRef.current

        // Deployments status details for Helm apps
        getDeploymentStatusDetail(params.appId, params.envId, shouldFetchTimeline, '', true).then(
            (deploymentStatusDetailRes) => {
                processDeploymentStatusData(deploymentStatusDetailRes.result)
                if (shouldFetchTimeline) {
                    setIsInitialTimelineDataLoading(false)
                }
            },
        )
    }

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
            />
        )
    }

    return (
        <div className="helm-details" data-testid="app-details-wrapper">
            <div className="app-info-bg-gradient">
                <EnvironmentSelectorComponent
                    isExternalApp={isExternalApp}
                    _init={_init}
                    loadingResourceTree={loadingResourceTree || !appDetails?.appType}
                    isVirtualEnvironment={isVirtualEnv.current}
                    appType={appDetails?.appType}
                />
                {!appDetails.deploymentAppDeleteRequest && (
                    <EnvironmentStatusComponent
                        loadingDetails={loadingDetails || !appDetails?.appType}
                        loadingResourceTree={loadingResourceTree || !appDetails?.appType}
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                        isVirtualEnvironment={isVirtualEnv.current}
                        isHelmApp
                        refetchDeploymentStatus={getDeploymentDetailStepsData}
                    />
                )}
            </div>

            {!appDetails.deploymentAppDeleteRequest && !isExternalArgoApp && (
                <AppLevelExternalLinks
                    helmAppDetails={appDetails}
                    externalLinks={externalLinks}
                    monitoringTools={monitoringTools}
                />
            )}
            {loadingResourceTree ? (
                <div className="bcn-0 dc__border-top h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            ) : (
                renderHelmAppDetails()
            )}

            {location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                <DeploymentStatusDetailModal
                    appName={appDetails.appName}
                    environmentName={appDetails.environmentName}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnv.current}
                    isLoading={isInitialTimelineDataLoading}
                />
            )}
        </div>
    )
}

export default AppDetailsComponent

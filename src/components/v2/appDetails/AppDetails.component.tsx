import React, { useEffect, useRef, useState } from 'react'
import './appDetails.scss'
import { useLocation, useParams } from 'react-router'
import { AppStreamData, AppType } from './appDetails.type'
import IndexStore from './index.store'
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component'
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component'
import SyncErrorComponent from './SyncError.component'
import { importComponentFromFELibrary, useEventSource } from '../../common'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import NodeTreeDetailTab from './NodeTreeDetailTab'
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type'
import { getSaveTelemetry } from './appDetails.api'
import { DeploymentAppTypes, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentStatusDetail } from '../../app/details/appDetails/appDetails.service'
import { DEFAULT_STATUS, DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../config'
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

const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
    isExternalApp,
    _init,
    loadingDetails,
    loadingResourceTree,
}: {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isExternalApp: boolean
    _init?: () => void
    loadingDetails: boolean
    loadingResourceTree: boolean
}) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const [streamData, setStreamData] = useState<AppStreamData>(null)
    const [appDetails] = useSharedState(IndexStore.getAppDetails(), IndexStore.getAppDetailsObservable())
    const isVirtualEnv = useRef(appDetails?.isVirtualEnvironment)
    const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT
    const location = useLocation()
    const deploymentModalShownRef = useRef(false)

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...(isVirtualEnv.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData()
                : processDeploymentStatusDetailsData()),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS,
        })

    useEffect(() => {
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId)
        }
    }, [])

    useEffect(() => {
        if (location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM)) {
            deploymentModalShownRef.current = true
        } else {
            deploymentModalShownRef.current = false
        }
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
        // Deployments status details for Helm apps
        getDeploymentStatusDetail(
            params.appId,
            params.envId,
            showTimeline ?? deploymentModalShownRef.current,
            '',
            true,
        ).then((deploymentStatusDetailRes) => {
            processDeploymentStatusData(deploymentStatusDetailRes.result)
        })
    }

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData =
            isVirtualEnv.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData(deploymentStatusDetailRes)
                : processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        if (
            processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.HEALTHY ||
            processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT ||
            processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.SUPERSEDED ||
            processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.SUCCEEDED
        ) {
            deploymentModalShownRef.current = false
        }
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

    // if app type not of EA, then call stream API
    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName &&
            !!appDetails?.environmentName &&
            appDetails?.appType?.toString() != AppType.EXTERNAL_HELM_CHART.toString(),
        (event) => setStreamData(JSON.parse(event.data)),
    )

    const renderHelmAppDetails = (): JSX.Element => {
        if (isVirtualEnv.current && VirtualAppDetailsEmptyState) {
            return <VirtualAppDetailsEmptyState environmentName={appDetails.environmentName} />
        }
        if (
            !appDetails?.resourceTree?.nodes?.length &&
            appDetails?.deploymentAppType === DeploymentAppTypes.HELM &&
            appDetails?.helmReleaseStatus &&
            (appDetails?.helmReleaseStatus.status?.toLowerCase() === DEPLOYMENT_STATUS.FAILED ||
                appDetails?.helmReleaseStatus.status?.toLowerCase() === DEPLOYMENT_STATUS.PROGRESSING ||
                appDetails?.helmReleaseStatus.status?.toLowerCase() === DEPLOYMENT_STATUS.UNKNOWN)
        ) {
            return (
                <ReleaseStatusEmptyState
                    message={appDetails.helmReleaseStatus.message}
                    description={
                        appDetails?.helmReleaseStatus.status?.toLowerCase() === DEPLOYMENT_STATUS.UNKNOWN
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
            />
        )
    }

    return (
        <div className="helm-details" data-testid="app-details-wrapper">
            <div>
                <EnvironmentSelectorComponent
                    isExternalApp={isExternalApp}
                    _init={_init}
                    loadingResourceTree={loadingResourceTree}
                    isVirtualEnvironment={isVirtualEnv.current}
                />
                {!appDetails.deploymentAppDeleteRequest && (
                    <EnvironmentStatusComponent
                        appStreamData={streamData}
                        loadingDetails={loadingDetails}
                        loadingResourceTree={loadingResourceTree}
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                        isVirtualEnvironment={isVirtualEnv.current}
                        isHelmApp={true}
                        refetchDeploymentStatus={getDeploymentDetailStepsData}
                    />
                )}
            </div>

            <SyncErrorComponent appStreamData={streamData} />
            {!appDetails.deploymentAppDeleteRequest && (
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
                    streamData={streamData}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnv.current}
                />
            )}
        </div>
    )
}

export default AppDetailsComponent

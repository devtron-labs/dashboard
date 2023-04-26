import React, { useEffect, useState } from 'react'
import './appDetails.scss'
<<<<<<< HEAD
import { useLocation, useParams } from 'react-router'
=======
import { useParams } from 'react-router'
>>>>>>> main
import { AppStreamData, AppType } from './appDetails.type'
import IndexStore from './index.store'
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component'
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component'
import SyncErrorComponent from './SyncError.component'
import { useEventSource } from '../../common'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import NodeTreeDetailTab from './NodeTreeDetailTab'
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type'
import { getSaveTelemetry } from './appDetails.api'
<<<<<<< HEAD
import { DEFAULT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../config'
import {
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
} from '../../app/details/appDetails/appDetails.type'
import { processDeploymentStatusDetailsData } from '../../app/details/appDetails/utils'
import { getDeploymentStatusDetail } from '../../app/details/appDetails/appDetails.service'
import DeploymentStatusDetailModal from '../../app/details/appDetails/DeploymentStatusDetailModal'
=======
import { Host, Progressing } from '@devtron-labs/devtron-fe-common-lib'
>>>>>>> main

const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
    isExternalApp,
    _init,
<<<<<<< HEAD
    isPollingRequired = true,
=======
    loadingDetails,
    loadingResourceTree,
>>>>>>> main
}: {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isExternalApp: boolean
    _init?: () => void
<<<<<<< HEAD
    isPollingRequired?: boolean
=======
    loadingDetails: boolean
    loadingResourceTree: boolean
>>>>>>> main
}) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const [streamData, setStreamData] = useState<AppStreamData>(null)
    const appDetails = IndexStore.getAppDetails()
<<<<<<< HEAD
    const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT
    const [pollingIntervalID, setPollingIntervalID] = useState(null)
    const location = useLocation()
    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...processDeploymentStatusDetailsData(),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS,
        })
    let deploymentStatusTimer = null

    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    async function callAppDetailsAPI() {
        try {
            getDeploymentStatusDetail('34', '1').then((res) => {
                setDeploymentStatusDetailsBreakdownData(processDeploymentStatusDetailsData(res.result))
            })
        } catch (error) {}
    }

    // useInterval(polling, interval);
    useEffect(() => {
        if (isPollingRequired) {
            callAppDetailsAPI()
            const intervalID = setInterval(callAppDetailsAPI, 30000)
            setPollingIntervalID(intervalID)
        } else {
            clearPollingInterval()
        }
    }, [isPollingRequired])

    useEffect(() => {
        return () => {
            clearPollingInterval()
        }
    }, [pollingIntervalID])
=======
>>>>>>> main

    function clearPollingInterval() {
        if (pollingIntervalID) {
            clearInterval(pollingIntervalID)
        }
    }
    useEffect(() => {
<<<<<<< HEAD
        return () => {
            clearDeploymentStatusTimer()
        }
    }, [])

    useEffect(() => {
=======
>>>>>>> main
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId)
        }
    }, [])
<<<<<<< HEAD

    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(params.appId, params.envId).then((deploymentStatusDetailRes) => {
            processDeploymentStatusData(deploymentStatusDetailRes.result)
        })
    }

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        if (processedDeploymentStatusDetailsData.deploymentStatus === 'inprogress') {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
        }
        setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
    }
=======
>>>>>>> main

    // if app type not of EA, then call stream API
    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName &&
            !!appDetails?.environmentName &&
            appDetails?.appType?.toString() != AppType.EXTERNAL_HELM_CHART.toString(),
        (event) => setStreamData(JSON.parse(event.data)),
    )

    return (
        <div className="helm-details" data-testid="app-details-wrapper">
            <div>
<<<<<<< HEAD
                <EnvironmentSelectorComponent isExternalApp={isExternalApp} _init={_init} />
                {!appDetails.deploymentAppDeleteRequest && (
                    <EnvironmentStatusComponent
                        appStreamData={streamData}
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
=======
                <EnvironmentSelectorComponent
                    isExternalApp={isExternalApp}
                    _init={_init}
                    loadingResourceTree={loadingResourceTree}
                />
                {!appDetails.deploymentAppDeleteRequest && (
                    <EnvironmentStatusComponent
                        appStreamData={streamData}
                        loadingDetails={loadingDetails}
                        loadingResourceTree={loadingResourceTree}
>>>>>>> main
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
<<<<<<< HEAD
            <NodeTreeDetailTab
                appDetails={appDetails}
                externalLinks={externalLinks}
                monitoringTools={monitoringTools}
            />
             {location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                <DeploymentStatusDetailModal
                    appName={appDetails.appName}
                    environmentName={appDetails.environmentName}
                    streamData={streamData}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
=======
            {loadingResourceTree ? (
                <div className="bcn-0 dc__border-top h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            ) : (
                <NodeTreeDetailTab
                    appDetails={appDetails}
                    externalLinks={externalLinks}
                    monitoringTools={monitoringTools}
>>>>>>> main
                />
            )}
        </div>
    )
}

export default AppDetailsComponent

import React, { useEffect, useState } from 'react'
import './appDetails.scss'
import { useLocation, useParams } from 'react-router'
import { AppStreamData, AppType, DeploymentAppType } from './appDetails.type'
import IndexStore from './index.store'
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component'
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component'
import SyncErrorComponent from './SyncError.component'
import { useEventSource } from '../../common'
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component'
import NodeTreeDetailTab from './NodeTreeDetailTab'
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type'
import { getSaveTelemetry } from './appDetails.api'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { getDeploymentStatusDetail } from '../../app/details/appDetails/appDetails.service'
import { DEFAULT_STATUS, DEPLOYMENT_STATUS, DEPLOYMENT_STATUS_QUERY_PARAM } from '../../../config'
import DeploymentStatusDetailModal from '../../app/details/appDetails/DeploymentStatusDetailModal'
import {
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
} from '../../app/details/appDetails/appDetails.type'
import { processDeploymentStatusDetailsData } from '../../app/details/appDetails/utils'

const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
    isExternalApp,
    _init,
    loadingDetails,
    loadingResourceTree,
    isPollingRequired = true,
}: {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isExternalApp: boolean
    _init?: () => void
    loadingDetails: boolean
    loadingResourceTree: boolean
    isPollingRequired?: boolean
}) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string; installedAppVersionHistoryId: string }>()
    const [streamData, setStreamData] = useState<AppStreamData>(null)
    const appDetails = IndexStore.getAppDetails()
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

    console.log(params)

    async function callAppDetailsAPI() {
        try {
            // Deployment details status for Helm apps
           await getDeploymentStatusDetail(params.appId, params.envId, '', true).then((res) => {
                setDeploymentStatusDetailsBreakdownData(processDeploymentStatusDetailsData(res.result))
            })
        } catch (error) {}
    }

    function clearPollingInterval() {
      if (pollingIntervalID) {
          clearInterval(pollingIntervalID)
      }
  }
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
          clearDeploymentStatusTimer()
      }
  }, [pollingIntervalID])

    useEffect(() => {
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId)
        }
    }, [])

    const getDeploymentDetailStepsData = (): void => {
        getDeploymentStatusDetail(params.appId, params.envId).then((deploymentStatusDetailRes) => {
            processDeploymentStatusData(deploymentStatusDetailRes.result)
        })
    }

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        // If deployment status is in progress then fetch data in every 10 seconds
        if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
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

    return (
        <div className="helm-details" data-testid="app-details-wrapper">
            <div>
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
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
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
                <NodeTreeDetailTab
                    appDetails={appDetails}
                    externalLinks={externalLinks}
                    monitoringTools={monitoringTools}
                />
            )}
            {location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                <DeploymentStatusDetailModal
                    appName={appDetails.appName}
                    environmentName={appDetails.environmentName}
                    streamData={streamData}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                />
            )}
        </div>
    )
}

export default AppDetailsComponent

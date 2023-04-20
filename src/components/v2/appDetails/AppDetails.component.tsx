import React, { useEffect, useState } from 'react'
import './appDetails.scss'
import { useParams } from 'react-router'
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
import { Host, Progressing } from '@devtron-labs/devtron-fe-common-lib'

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
    const appDetails = IndexStore.getAppDetails()

    useEffect(() => {
        if (appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId) {
            getSaveTelemetry(params.appId)
        }
    }, [])

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
                    <Progressing pageLoader fullHeight size={32}  />
                </div>
            ) : (
                <NodeTreeDetailTab
                    appDetails={appDetails}
                    externalLinks={externalLinks}
                    monitoringTools={monitoringTools}
                />
            )}
        </div>
    )
}

export default AppDetailsComponent

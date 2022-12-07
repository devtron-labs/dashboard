import React, { useEffect, useState } from 'react';
import './appDetails.scss';
import {useHistory, useParams} from 'react-router';
import { AppStreamData, AppType } from './appDetails.type';
import IndexStore from './index.store';
import EnvironmentStatusComponent from './sourceInfo/environmentStatus/EnvironmentStatus.component';
import EnvironmentSelectorComponent from './sourceInfo/EnvironmentSelector.component';
import SyncErrorComponent from './SyncError.component';
import { useEventSource } from '../../common';
import { AppLevelExternalLinks } from '../../externalLinks/ExternalLinks.component';
import NodeTreeDetailTab from './NodeTreeDetailTab';
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type';
import { getSaveTelemetry } from './appDetails.api';
import EmptyState from "../../EmptyState/EmptyState";
import AppNotDeployed from "../../../assets/img/app-not-deployed.png";

const AppDetailsComponent = ({
    externalLinks,
    monitoringTools,
    appDeleteError,
}: {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    appDeleteError:string
}) => {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const [streamData, setStreamData] = useState<AppStreamData>(null);
    const appDetails = IndexStore.getAppDetails();
    const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT;
    const {push} = useHistory()
    useEffect(() => {
     if( appDetails?.appType === AppType.EXTERNAL_HELM_CHART && params.appId){
      getSaveTelemetry(params.appId)
     }
    },[])

    // if app type not of EA, then call stream API
    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName &&
            !!appDetails?.environmentName &&
            appDetails?.appType?.toString() != AppType.EXTERNAL_HELM_CHART.toString(),
        (event) => setStreamData(JSON.parse(event.data)),
    );
    if(appDeleteError){
        const handleConfigure = ()=>{
            push(`/app/dc/deployments/${params.appId}/env/${params.envId}/values`)
        }
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={AppNotDeployed} alt="" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4>App details not found, {appDeleteError}</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>you can go ahead and delete this app from Devtron from Configure tab</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button onClick={handleConfigure} className="cta flex">Go To Configure</button>
                </EmptyState.Button>
            </EmptyState>
        )
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div>
                <EnvironmentSelectorComponent />
                <EnvironmentStatusComponent appStreamData={streamData}/>
            </div>

            <SyncErrorComponent appStreamData={streamData}/>
            <AppLevelExternalLinks helmAppDetails={appDetails} externalLinks={externalLinks} monitoringTools={monitoringTools} />
            <NodeTreeDetailTab appDetails={appDetails} externalLinks={externalLinks} monitoringTools={monitoringTools} />
        </div>
    );
};

export default AppDetailsComponent;

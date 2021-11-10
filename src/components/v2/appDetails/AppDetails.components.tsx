import React from 'react'
import AppDetailsStore from './appDetail.store';
import ApplicationObjectComponent from './applicationObject/ApplicationObject.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'
import { useParams } from 'react-router';

function AppDetailsComponent({ envType, ...otherProps }) {

    const params = useParams<{ appId: string, envId: string }>()
    /*
      TODO: app id && env id in case of devtron
      in external app: app name || env id => cluster name + namespace
    */

    AppDetailsStore.setEnvDetails(envType, +params.appId, +params.envId)

    return (
        <div>
            <SourceInfoComponent />
            <ApplicationObjectComponent />
        </div>
    )
}



export default AppDetailsComponent;

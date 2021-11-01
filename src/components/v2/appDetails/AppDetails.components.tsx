import React, { Suspense } from 'react'
import ApplicationObjectComponent from './applicationObject/ApplicationObject.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'
import { useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router';
import { Switch, Redirect } from 'react-router-dom';
import { URLS } from '../../../config';
import CIDetails from '../../app/details/cIDetails/CIDetails';
import TriggerView from '../../app/details/triggerView/TriggerView';
import { Progressing } from '../../common';
import K8ResourceComponent from './applicationObject/k8Resource/K8Resource.component';
import LogAnalyzerComponent from './applicationObject/logAnalyzer/LogAnalyzer.component';
import DefaultViewTabComponent from './applicationObject/defaultViewTab/DefaultViewTab.component';

function AppDetailsComponent() {
    const { path } = useRouteMatch();
    const match = useRouteMatch();
    const location = useLocation();

    return (
        <React.Fragment>
            <SourceInfoComponent />
            <ApplicationObjectComponent />
        </React.Fragment>
    )
}

export default AppDetailsComponent;

import React, { Suspense } from 'react'
import ApplicationObjectComponent from './applicationObject/ApplicationObject.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'
import { useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router';
import { Switch, Redirect } from 'react-router-dom';
import { URLS } from '../../../config';
import CIDetails from '../../app/details/cIDetails/CIDetails';
import TriggerView from '../../app/details/triggerView/TriggerView';
import { Progressing } from '../../common';

function AppDetailsComponent() {
    const { path } = useRouteMatch();

    return (
        <React.Fragment>
            <SourceInfoComponent />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${URLS.APP_DETAILS_K8}?`} render={(props) => <ApplicationObjectComponent />} />
                    <Route path={`${URLS.APP_DETAILS_LOG}?`} render={(props) => <ApplicationObjectComponent />} />
                    <Route path={`${URLS.APP_DETAILS_DEFAULT}?`} render={(props) => <ApplicationObjectComponent />} />
                    <Redirect to={`${URLS.APP_DETAILS_K8}?`} />
                </Switch>
            </Suspense>
            <ApplicationObjectComponent />

        </React.Fragment>
    )
}

export default AppDetailsComponent;

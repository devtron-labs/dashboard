import React, { Suspense, lazy, useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import EAHeaderComponent from '../v2/headers/EAHeader.component';
import { Progressing } from '../common';
import { URLS } from '../../config';
import ExternalAppValues from '../v2/values/ea/EAValues.component';
import ExternalAppDeploymentHistory from '../v2/deployment-history/ea/EADeploymentHistory.component';
import ExternalAppDetail from '../v2/appDetails/ea/EAAppDetail.component';

export default function ExternalApps() {
    const params = useParams<{ appId: string; appName: string; }>();
    const { path } = useRouteMatch();

    return (
        <React.Fragment>
            <EAHeaderComponent />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`} render={() => <ExternalAppDetail appId={params.appId} appName={params.appName} />} />
                    <Route path={`${path}/${URLS.APP_VALUES}`} render={() => <ExternalAppValues appId={params.appId} />} />
                    <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`} render={() => <ExternalAppDeploymentHistory appId={params.appId} appName={params.appName} />} />
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </React.Fragment>
    );
}
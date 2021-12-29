import React, { Suspense, lazy, useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import EAHeaderComponent from '../v2/headers/EAHeader.component';
import { Progressing } from '../common';
import { URLS } from '../../config';
import ExternalAppValues from '../v2/values/ea/EAValues.component';

export default function ExternalApps() {
    const params = useParams<{ appId: string; appName: string; }>();
    const { path } = useRouteMatch();

    return (
        <React.Fragment>
            <EAHeaderComponent />
            <Suspense fallback={<Progressing pageLoader />}>
                {/*<Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`} component={AppDetailsComponent} />
                    <Route path={`${path}/${URLS.APP_VALUES}`} component={ValuesComponent} />
                    <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`} component={ValuesComponent} />
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>*/}
                <Switch>
                    <Route path={`${path}/${URLS.APP_VALUES}`} render={() => <ExternalAppValues appId={params.appId} />} />
                    <Redirect to={`${path}/${URLS.APP_VALUES}`} />
                </Switch>
            </Suspense>
        </React.Fragment>
    );
}
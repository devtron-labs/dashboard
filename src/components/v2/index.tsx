import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import AppDetailsStore from './appDetails/appDetail.store'
import { useParams, useRouteMatch } from 'react-router';
import { lazy } from 'react'
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';

function RouterComponent({ envType, ...otherProps }) {
    const { path } = useRouteMatch();
    const params = useParams<{ appId: string, envId: string }>()

    const AppDetailsComponent = lazy(() => import('./appDetails/AppDetails.components'));
    const ValuesComponent = lazy(() => import('./values/Values.component'));

    AppDetailsStore.setEnvDetails(envType, +params.appId, +params.envId)

    return (
        <div>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`} render={(props) => <AppDetailsComponent />} />
                    <Route path={`${path}/${URLS.APP_VALUES}`} render={(props) => <ValuesComponent/>} />
                </Switch>
            </Suspense>
        </div>
    )
}

export default RouterComponent

import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import AppDetailsStore from './appDetails/index.store'
import { useParams, useRouteMatch } from 'react-router';
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/Values.component';
import ApplicationObjectComponent from './appDetails/AppDetails.component';

function RouterComponent({ envType, ...otherProps }) {
    const { path } = useRouteMatch();
    const params = useParams<{ appId: string, envId: string }>()

    AppDetailsStore.setEnvDetails(envType, +params.appId, +params.envId)

    return (
        <div>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`} render={(props) => <ApplicationObjectComponent />} />
                    <Route path={`${path}/${URLS.APP_VALUES}`} render={(props) => <ValuesComponent/>} />
                </Switch>
            </Suspense>
        </div>
    )
}

export default RouterComponent

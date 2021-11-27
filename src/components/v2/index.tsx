import React, { Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import IndexStore from './appDetails/index.store'
import { useParams, useRouteMatch } from 'react-router';
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/Values.component';
import AppDetailsComponent from './appDetails/AppDetails.component';
import AppHeaderComponent from './appHeader/AppHeader.component';
import { EnvType } from './appDetails/appDetails.type';

function RouterComponent({ envType }) {

    const { path } = useRouteMatch();
    
    return (
        <div>
            <Suspense fallback={<Progressing pageLoader />}>
                <AppHeaderComponent />
                <Switch>
                    <Route path={`${path}/${URLS.APP_VALUES}/:envId(\\d+)?/`} render={(props) => <ValuesComponent envType={envType}/>} />
                    <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} render={(props) => <AppDetailsComponent envType={envType}/>} />

                </Switch>
            </Suspense>
        </div>
    )
}

export default RouterComponent

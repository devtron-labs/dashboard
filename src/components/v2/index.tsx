import React, { Suspense, useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { URLS } from '../../config';
import { useRouteMatch, useParams, Redirect } from 'react-router';
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/ChartValues.component';
import AppHeaderComponent from './headers/AppHeader.component';
import ChartHeaderComponent from './headers/ChartHeader.component';
import { getInstalledAppDetail } from '../charts/charts.service';
import { getInstalledChartDetail } from './appDetails/appDetails.api';
import AppDetailsComponent from './appDetails/AppDetails.component';
import { EnvType } from './appDetails/appDetails.type';
import IndexStore from './appDetails/index.store';

function RouterComponent({ envType }) {
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const { path } = useRouteMatch();

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId);

        setIsLoading(true);

        if (params.appId && params.envId) {
            init();
        }
    }, [params.appId, params.envId]);

    const init = async () => {
        try {
            let response = null;

            if (envType === EnvType.CHART) {
                response = await getInstalledChartDetail(+params.appId, +params.envId);
            } else {
                response = await getInstalledAppDetail(+params.appId, +params.envId);
            }

            IndexStore.setAppDetails(response.result);

            setIsLoading(false);

            setTimeout(init, 30000);
        } catch (e) {
            console.log('error while fetching InstalledAppDetail', e);
            // alert('error loading data')
        }
    };

    return (
        <React.Fragment>
            {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}
            
            {isLoading ? (
                <div style={{ height: '560px' }} className="flex"></div>
            ) : (
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}`} component={AppDetailsComponent} />
                        <Route path={`${path}/${URLS.APP_VALUES}`} component={ValuesComponent} />
                        <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                    </Switch>
                </Suspense>
            )}
        </React.Fragment>
    );
}

export default RouterComponent;

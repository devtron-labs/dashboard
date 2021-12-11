import React, { Suspense, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import { useRouteMatch, useParams } from 'react-router';
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/Values.component';
import AppDetailsComponent from './appDetails/AppDetails.component';
import AppHeaderComponent from './headers/AppHeader.component';
import { EnvType } from './appDetails/appDetails.type';
import ChartHeaderComponent from './headers/ChartHeader.component';
import IndexStore from './appDetails/index.store';
import { getInstalledChartDetail } from './appDetails/appDetails.api';
import { getInstalledAppDetail } from '../charts/charts.service';

function RouterComponent({ envType }) {
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams<{ appId: string, envId: string, nodeType: string }>()
    const { path } = useRouteMatch();

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)

        const init = async () => {
            let response = null;
            try {
                if (envType === EnvType.CHART) {
                    response = await getInstalledChartDetail(+params.appId, +params.envId);
                } else {
                    response = await getInstalledAppDetail(+params.appId, +params.envId);
                }

                IndexStore.setAppDetails(response.result);

                setIsLoading(false)
            } catch (e) {
                console.log("error while fetching InstalledAppDetail", e)
                // alert('error loading data')
            }
        }

        init();
    }, [params.appId, params.envId])

    return (
        <div>
            {isLoading ? <div style={{ height: "560px" }} className="flex">
                <Progressing pageLoader />
            </div> :
                <Suspense fallback={<Progressing pageLoader />}>
                    {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}`} component={AppDetailsComponent} />
                        <Route path={`${path}/${URLS.APP_VALUES}`} component={ValuesComponent} />
                    </Switch>
                </Suspense>
            }
        </div>
    )
}

export default RouterComponent

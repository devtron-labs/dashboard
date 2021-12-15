import React, { Suspense, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { URLS } from '../../config'
import { useRouteMatch, useParams, Redirect } from 'react-router';
import { Progressing } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/ChartValues.component';
import AppDetailsComponent from './appDetails/AppDetails.component';
import AppHeaderComponent from './headers/AppHeader.component';
import { EnvType } from './appDetails/appDetails.type';
import ChartHeaderComponent from './headers/ChartHeader.component';
import IndexStore from './appDetails/index.store';
import { getInstalledChartDetail, getInstalledAppDetail } from './appDetails/appDetails.api';

function RouterComponent({ envType }) {
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams<{ appId: string, envId: string, nodeType: string }>()
    const { path } = useRouteMatch();

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId)

        init();

        //setInterval(init, 30*1000) //30 sec, setting fixed interval to fetch app details

    }, [params.appId, params.envId])

    const init = async () => {
        setIsLoading(true)

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




    return (
        <div>
            {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}

            {isLoading ?
                <div style={{ height: "560px" }} className="flex"></div>
                :
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}`} component={AppDetailsComponent} />
                        <Route path={`${path}/${URLS.APP_VALUES}`} component={ValuesComponent} />
                        <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                    </Switch>
                </Suspense>
            }
        </div>
    )
}

export default RouterComponent

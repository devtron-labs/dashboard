import React, { Suspense, useEffect, useState } from 'react';
import { useRouteMatch, useParams, Redirect,useLocation, useHistory } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { URLS } from '../../config';
import { DetailsProgressing, showError, ErrorScreenManager } from '../common';
import './lib/bootstrap-grid.min.css';
import ValuesComponent from './values/ChartValues.component';
import AppHeaderComponent from './headers/AppHeader.component';
import ChartHeaderComponent from './headers/ChartHeader.component';
import { getInstalledAppDetail, getInstalledChartDetail } from './appDetails/appDetails.api';
import AppDetailsComponent from './appDetails/AppDetails.component';
import { EnvType } from './appDetails/appDetails.type';
import IndexStore from './appDetails/index.store';
import ErrorImage from './assets/icons/ic-404-error.png';
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../util/URLUtil';
import ChartDeploymentHistory from './chartDeploymentHistory/ChartDeploymentHistory.component';

let initTimer = null;

function RouterComponent({ envType }) {
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams<{ appId: string; envId: string; nodeType: string }>();
    const { path } = useRouteMatch();
    const location = useLocation();
    const history = useHistory();
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);

    useEffect(() => {
        IndexStore.setEnvDetails(envType, +params.appId, +params.envId);

        setIsLoading(true);

        if (initTimer) {
            clearTimeout(initTimer);
        }

        _init();
    }, [params.appId, params.envId]);

    // clearing the timer on component unmount
    useEffect(() => {
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer);
            }
        };
    }, []);

    useEffect(() => {
        if (checkIfToRefetchData(location)) {
            setTimeout(() => {
                _getAndSetAppDetail();
                deleteRefetchDataFromUrl(history, location);
            }, 5000);
        }
    }, [location.search]);


    const _init = () => {
        _getAndSetAppDetail();
        initTimer = setTimeout(() => {
            _init();
        }, 30000);
    }

    const _getAndSetAppDetail = async () => {
        try {
            let response = null;

            if (envType === EnvType.CHART) {
                response = await getInstalledChartDetail(+params.appId, +params.envId);
            } else {
                response = await getInstalledAppDetail(+params.appId, +params.envId);
            }
            IndexStore.publishAppDetails(response.result);
            setIsLoading(false);
            setErrorResponseCode(undefined);
        } catch (e: any) {
            showError(e);
            if(e?.code){
                setErrorResponseCode(e.code);
            }
            setIsLoading(false);
        }
    };

    const redirectToHomePage = () => {};

    const PageNotFound = () => {
        return (
            <section className="app-not-configured w-100">
                <img src={ErrorImage} />
                <div className="w-250 flex column">
                    <h4 className="fw-6">This app does not exist</h4>
                    <div className="mb-20 flex align-center">We could not find and connect to this application.</div>
                    <div className="cta" onClick={redirectToHomePage}>
                        Go back to home page
                    </div>
                </div>
            </section>
        );
    };

    return (
        <React.Fragment>
            {isLoading && <DetailsProgressing loadingText="Please wait…" size={24} fullHeight />}

            {!isLoading && errorResponseCode && (
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}

            {!isLoading && !errorResponseCode && (
                <>
                    {EnvType.APPLICATION === envType ? <AppHeaderComponent /> : <ChartHeaderComponent />}
                    <Suspense fallback={<DetailsProgressing loadingText="Please wait…" size={24} />}>
                        <Switch>
                            <Route path={`${path}/${URLS.APP_DETAILS}`} component={AppDetailsComponent} />
                            <Route path={`${path}/${URLS.APP_VALUES}`} component={ValuesComponent} />
                            <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                                <ChartDeploymentHistory appId={params.appId} isExternal={false} />
                            </Route>
                            <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                        </Switch>
                    </Suspense>
                </>
            )}
        </React.Fragment>
    )
}

export default RouterComponent;

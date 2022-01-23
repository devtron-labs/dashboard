import React, { lazy, Suspense, useEffect, useState, createContext, useContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import { URLS, AppListConstants, ViewType, SERVER_MODE } from '../../../config';
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common';
import Navigation from './Navigation';
import { useRouteMatch, useHistory, useLocation } from 'react-router';
import * as Sentry from '@sentry/browser';
import ReactGA from 'react-ga';
import { Security } from '../../security/Security';
import { getVersionConfig } from '../../../services/service';
import { showError } from '../helpers/Helpers';
import Reload from '../../Reload/Reload';
import { EnvType } from '../../v2/appDetails/appDetails.type';

const Charts = lazy(() => import('../../charts/Charts'));
const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'));
const AppDetailsPage = lazy(() => import('../../app/details/main'));
const NewAppList = lazy(() => import('../../app/list-new/AppList'));
const V2Details = lazy(() => import('../../v2/index'));
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'));
const BulkActions = lazy(() => import('../../deploymentGroups/BulkActions'));
const BulkEdit = lazy(() => import('../../bulkEdits/BulkEdits'));
export const mainContext = createContext(null);

export default function NavigationRoutes() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const [serverMode, setServerMode] = useState(undefined);
    const [pageState, setPageState] = useState(ViewType.LOADING);
    const [pageOverflowEnabled, setPageOverflowEnabled] = useState<boolean>(true);

    useEffect(() => {
        const loginInfo = getLoginInfo()
        if (!loginInfo) return
        if (process.env.NODE_ENV !== 'production' || !window._env_ || (window._env_ && !window._env_.SENTRY_ENABLED)) return
        Sentry.configureScope(function (scope) {
            scope.setUser({ email: loginInfo['email'] || loginInfo['sub'] });
        });

        if (process.env.NODE_ENV === 'production' && window._env_ && window._env_.GA_ENABLED) {
            let email = loginInfo ? loginInfo['email'] || loginInfo['sub'] : "";
            let path = location.pathname;
            ReactGA.initialize(window._env_.GA_TRACKING_ID, {
                debug: false,
                titleCase: false,
                gaOptions: {
                    userId: `${email}`
                }
            });
            ReactGA.pageview(`${path}`);
            ReactGA.event({
                category: `Page ${path}`,
                action: 'First Land'
            });
            history.listen((location) => {
                let path = location.pathname;
                path = path.replace(new RegExp("[0-9]", "g"), "");
                path = path.replace(new RegExp("//", "g"), "/");
                ReactGA.pageview(`${path}`);
                ReactGA.event({
                    category: `Page ${path}`,
                    action: 'First Land'
                });
            })
        }
    }, [])


    useEffect(() => {
        async function getServerMode() {
            try {
                const response = getVersionConfig();
                const json = await response;
                if (json.code == 200) {
                    setServerMode(json.result.serverMode)
                    setPageState(ViewType.FORM);
                }
            } catch (err) {
                setPageState(ViewType.ERROR);
            }
        }
        getServerMode();
    }, []);

    if (pageState === ViewType.LOADING) {
        return <Progressing pageLoader />;
    } else if (pageState === ViewType.ERROR) {
        return <Reload />;
    } else {
      return (
        <mainContext.Provider value={{serverMode, setServerMode, setPageOverflowEnabled}}>
          <main>
              <Navigation history={history} match={match} location={location} />
              {serverMode &&  <div className={`main ${pageOverflowEnabled ? '' : 'main__overflow-disabled'}`}>
                  <Suspense fallback={<Progressing pageLoader />}>
                      <ErrorBoundary>
                          <Switch>
                              <Route path={URLS.APP} render={() => <AppRouter />} />
                              <Route path={URLS.CHARTS} render={() => <Charts />} />
                              <Route path={URLS.DEPLOYMENT_GROUPS} render={props => <BulkActions {...props} />} />
                              <Route path={URLS.GLOBAL_CONFIG} render={props => <GlobalConfig {...props} />} />
                              <Route path={URLS.BULK_EDITS} render={props => < BulkEdit {...props} serverMode={serverMode}/>} />
                              <Route path={URLS.SECURITY} render={(props) => <Security {...props} serverMode={serverMode}/>} />
                              <Route>
                                  <RedirectWithSentry />
                              </Route>
                          </Switch>


                      </ErrorBoundary>
                  </Suspense>
              </div>}
          </main>
        </mainContext.Provider>
      )
    }
}

export function AppRouter() {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_LIST}`} render={() => <AppListRouter />} />
                    <Route path={`${path}/${URLS.EXTERNAL_APPS}/:appId/:appName`} render={() => <ExternalApps />} />
                    <Route path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`} render={(props) => <V2Details envType={EnvType.CHART} />} />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage isV2={false} />} />
                    <Route path={`${path}/v2/:appId(\\d+)`} render={() => <AppDetailsPage isV2={true} />} />
                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectWithSentry />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    );
}

export function AppListRouter() {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/:appType`} render={() => <NewAppList />} />
                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectWithSentry />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    );
}

export function RedirectWithSentry() {
    const { push } = useHistory()
    const { pathname } = useLocation()
    useEffect(() => {
        if (pathname && pathname !== '/') Sentry.captureMessage(`redirecting to app-list from ${pathname}`, Sentry.Severity.Warning)
        push(`${URLS.APP}/${URLS.APP_LIST}`)
    }, [])
    return null
}

export function RedirectToAppList() {
    const { push } = useHistory()
    const { pathname } = useLocation()
    const {serverMode} = useContext(mainContext);
    useEffect(() => {
        let baseUrl = `${URLS.APP}/${URLS.APP_LIST}`;
        if(serverMode == SERVER_MODE.FULL){
            push(`${baseUrl}/${AppListConstants.AppType.DEVTRON_APPS}`)
        }else{
            push(`${baseUrl}/${AppListConstants.AppType.HELM_APPS}`)
        }
    }, [])
    return null
}
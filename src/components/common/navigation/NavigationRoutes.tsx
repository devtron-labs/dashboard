import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { URLS } from '../../../config';
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common';
import { useRouteMatch, useHistory, useLocation } from 'react-router';
import * as Sentry from '@sentry/browser';
import ReactGA from 'react-ga';
import Navigation from './Navigation';
import { Security } from '../../security/Security';
import { Command, CommandErrorBoundary } from '../../command';

const Charts = lazy(() => import('../../charts/Charts'));
const AppCompose = lazy(() => import('../../appCompose/AppCompose'));
const AppDetailsPage = lazy(() => import('../../app/details/main'));
const AppListContainer = lazy(() => import('../../app/list/AppListContainer'));
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'));
const BulkActions = lazy(() => import('../../deploymentGroups/BulkActions'));

export default function NavigationRoutes() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const [isCommandBarActive, setIsCommandBarActive] = useState(false);

    const { path } = { ...match };
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

    return <main>
        <Navigation history={history} match={match} location={location}
            isCommandBarActive={isCommandBarActive}
            toggleCommandBar={setIsCommandBarActive} />
        <CommandErrorBoundary toggleCommandBar={setIsCommandBarActive}>
            <Command location={location} history={history} match={match}
                isCommandBarActive={isCommandBarActive}
                toggleCommandBar={setIsCommandBarActive}
            />
        </CommandErrorBoundary>
        <div className="main">
            <Suspense fallback={<Progressing pageLoader />}>
                <ErrorBoundary>
                    <Switch>
                        <Route path={URLS.APP} render={(props) => <AppRouter toggleCommandBar={setIsCommandBarActive} />} />
                        <Route path={URLS.CHARTS} render={(props) => <Charts />} />
                        <Route path={URLS.GLOBAL_CONFIG} render={props => <GlobalConfig {...props} />} />
                        <Route path={URLS.DEPLOYMENT_GROUPS} render={props => <BulkActions {...props} />} />
                        <Route path={URLS.SECURITY} render={(props) => <Security {...props} />} />
                        <Route>
                            <RedirectWithSentry />
                        </Route>
                    </Switch>
                </ErrorBoundary>
            </Suspense>
        </div>
    </main>
}

export function AppRouter({ toggleCommandBar }) {
    const match = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null);
    const { path } = { ...match };

    return <ErrorBoundary>
        <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
            <Switch>
                <Route path={`${path}/:appId(\\d+)/edit`} render={() => <AppCompose />} />
                <Route path={`${path}/:appId(\\d+)/material-info`} render={() => <AppListContainer toggleCommandBar={toggleCommandBar} />} />
                <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage />} />
                <Route exact path="">
                    <AppListContainer toggleCommandBar={toggleCommandBar} />
                </Route>
                <Route>
                    <RedirectWithSentry />
                </Route>
            </Switch>
        </AppContext.Provider>
    </ErrorBoundary>
}

export function RedirectWithSentry() {
    const { push } = useHistory()
    const { pathname } = useLocation()
    useEffect(() => {
        if (pathname && pathname !== '/') Sentry.captureMessage(`redirecting to app-list from ${pathname}`, Sentry.Severity.Warning)
        push(`${URLS.APP}`)
    }, [])
    return null
}
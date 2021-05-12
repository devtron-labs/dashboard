import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { URLS } from '../../../config';
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common';
import { useRouteMatch, useHistory, useLocation } from 'react-router';
import Navigation from './Navigation';
import ReactGA from 'react-ga';
import { Security } from '../../security/Security';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import * as Sentry from '@sentry/browser';
import { WhatsNewModal } from './WhatsNewModal';
import { getLatestReleases } from './navigation.service';

const Charts = lazy(() => import('../../charts/Charts'));
const AppDetailsPage = lazy(() => import('../../app/details/main'));
const AppListContainer = lazy(() => import('../../app/list/AppListContainer'));
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'));
const BulkActions = lazy(() => import('../../deploymentGroups/BulkActions'));

type WhatsNewPrompt = "true" | "false";

export default function NavigationRoutes() {
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();
    const [showWhatsNewPrompt, setWhatsNewPrompt] = useState<WhatsNewPrompt>("false");
    const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
    const [currentVersion, setCurrentVersion] = useState("");
    const [latestVersion, setLatestVersion] = useState("");
    const [isCurrentVersionLatest, setIsCurrentVersionLatest] = useState(true);

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
        getLatestReleases().then((response) => {
            setLatestVersion(response.tag_name);
            setCurrentVersion(window._env_?.VERSION)
            let isCurrentVersionLatest = window._env_?.VERSION === response.tag_name;
            setIsCurrentVersionLatest(isCurrentVersionLatest);
            let show = localStorage.getItem('infobar');
            if (show != "false") show = "true";
            setWhatsNewPrompt(show as WhatsNewPrompt);
        })
    }, [])

    return <main>
        <div className="bcb-1 pl-20 pr-20 version-info" style={{ height: (!isCurrentVersionLatest && showWhatsNewPrompt === "true") ? '40px' : '0px' }}>
            <span className="mt-10 mb-10">
                <Info className="icon-dim-20" />
            </span>
            <p className="m-0 pt-10 pb-10">
                <span className="fw-6">Customers: </span>
                <a className="cursor cb-5 mr-5" href="mailto:contact@devtron.ai?subject=Request for latest version" target="_blank" rel="noopener noreferer">mail us</a>
                to request latest version.&nbsp;
                <span className="fw-6">Open source users: </span>
                <a href="https://github.com/devtron-labs/devtron/blob/main/README.md" target="_blank" rel="noopener noreferer">click here to see how to upgrade.</a>
            </p>
            <button type="button" className="transparent icon-dim-42" onClick={(event) => { localStorage.setItem('infobar', "false"); setWhatsNewPrompt("false"); }}>
                <Close className="icon-dim-20" />
            </button>
        </div>

        <div className="page-content" style={{ height: !isCurrentVersionLatest && showWhatsNewPrompt === "true" ? 'calc(100vh - 40px)' : '100vh' }}>
            <Navigation history={history} match={match} location={location}
                latestVersion={latestVersion}
                currentVersion={currentVersion}
                isCurrentVersionLatest={isCurrentVersionLatest}
                showWhatsNewModal={showWhatsNewModal}
                setShowWhatsNewModal={setShowWhatsNewModal}
            />
            {showWhatsNewModal ? <WhatsNewModal currentVersion={currentVersion}
                latestVersion={latestVersion}
                isCurrentVersionLatest={isCurrentVersionLatest}
                close={() => setShowWhatsNewModal(false)} /> : null}
            <div>
                <Suspense fallback={<Progressing pageLoader />}>
                    <ErrorBoundary>
                        <Switch>
                            <Route path={URLS.APP} render={() => <AppRouter />} />
                            <Route path={URLS.CHARTS} render={() => <Charts />} />
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
        </div>
    </main>
}

export function AppRouter() {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/:appId(\\d+)/material-info`} render={() => <AppListContainer />} />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage />} />
                    <Route exact path="">
                        <AppListContainer />
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
        push(`${URLS.APP}`)
    }, [])
    return null
}
import React, { useState, useEffect, lazy, Suspense, useMemo, useRef, useCallback } from 'react';
import { useParams, useLocation, useRouteMatch, useHistory, generatePath } from 'react-router';
import { NavLink, Link, Route, Redirect, Switch } from 'react-router-dom';
import { AppConfigStatus, URLS, getAppComposeURL, APP_COMPOSE_STAGE, getNextStageURL, getNavItems, isCIPipelineCreated } from '../../config';
import { ErrorBoundary, Progressing, usePrevious, showError, DeleteDialog, ConfirmationDialog, useAsync, BreadCrumb, useBreadcrumb, useAppContext } from '../common';
import { deleteApp } from './service';
import { getAppConfigStatus, getSourceConfig, getAppOtherEnvironment, getAppListMin } from '../../services/service';
import { ReactComponent as Next } from '../../assets/icons/ic-arrow-forward.svg';
import warn from '../../assets/icons/ic-warning.svg';
import lockIcon from '../../assets/icons/ic-locked.svg'
import arrowIcon from '../../assets/icons/appstatus/ic-dropdown.svg'
import { toast } from 'react-toastify';
import AppSelector from '../AppSelector';
import './appCompose.scss';

const Artifacts = lazy(() => import('../artifacts/Artifacts'));
const CIConfig = lazy(() => import('../ciConfig/CIConfig'));
const DeploymentConfig = lazy(() => import('../deploymentConfig/DeploymentConfig'));
const ConfigMap = lazy(() => import('../configMaps/ConfigMap'));
const Secret = lazy(() => import('../secrets/Secret'));
const WorkflowEdit = lazy(() => import('../workflowEditor/workflowEditor'));
const EnvironmentOverride = lazy(() => import('../EnvironmentOverride/EnvironmentOverride'));


export default function AppCompose() {
    const [state, setState] = useState({
        configStatus: AppConfigStatus.APP,
        appId: null,
        navItems: [],
        isCiPipeline: false,
        showDeleteConfirm: false,
        appName: '',
        maximumAllowedUrl: '',
    })
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [loading, result, error, reload] = useAsync(() => Promise.all([fetchAppConfigStatus(), getSourceConfig(appId)]), [appId])

    useEffect(() => {
        if (loading) return
        if (error) {
            showError(error)
            return
        }
        setState(state => ({ ...state, appName: result ? result[1]?.result?.appName : '' }))

    }, [loading, result, error])


    const canDeleteApp: boolean = useMemo(() => {
        if (loading) return false
        if (result && result[1]?.result?.workflows?.length > 0) return false
        return true
    }, [loading, result])

    async function fetchAppConfigStatus() {
        getAppConfigStatus(+appId).then((response) => {
            let nextUrl = getNextStageURL(response.result, appId);
            let { configStatus, navItems } = getNavItems(response.result, appId);
            let isCiPipeline = isCIPipelineCreated(response.result);
            setState(state => ({ ...state, isCiPipeline, configStatus, navItems, maximumAllowedUrl: nextUrl, appId: +appId }));
            if (location.pathname === match.url) {
                //tab is not specified
                history.push(nextUrl)
            }
        }).catch((errors) => {
            showError(errors);
        })
    }

    function redirectToWorkflowEditor() {
        return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR)
    }

    async function deleteAppHandler() {
        deleteApp(appId).then((response) => {
            if (response.code === 200) {
                toast.success("Application Deleted!!!");
                history.push(`${URLS.APP}`);
            }
        }).catch((error) => {
            showError(error);
        })
    }

    function respondOnSuccess() {
        fetchAppConfigStatus();
    }

    function showDeleteConfirmation(e) {
        setState((state) => ({ ...state, showDeleteConfirm: true }));
    }

    function DeleteDialogContainer() {
        if (state.showDeleteConfirm) {
            if (canDeleteApp)
                return <DeleteDialog title={`${state.appName}`}
                    description={"This will delete all resources associated with this application. Deleted applications cannot be restored."}
                    closeDelete={() => { setState(state => ({ ...state, showDeleteConfirm: false })) }}
                    delete={deleteAppHandler}
                />
            else {
                return <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <ConfirmationDialog.Body title="Cannot Delete application" />
                    <p className="modal__description">Delete all pipelines and workflows before deleting this application.</p>
                    <ConfirmationDialog.ButtonGroup>
                        <button type="button" className="cta cancel" onClick={e => { setState(state => ({ ...state, showDeleteConfirm: false })) }}>Cancel</button>
                        <Link onClick={e => setState(state => ({ ...state, showDeleteConfirm: false }))} to={redirectToWorkflowEditor()} className="cta ml-12">
                            View Workflows
                        </Link>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog >
            }
        }
        return null
    }
    if (+appId !== state.appId) return <Progressing pageLoader />

    return <>
        <div className="app-compose" >
            <Header />
            <div className="app-compose__nav flex column left top position-rel">
                <Navigation deleteApp={showDeleteConfirmation} navItems={state.navItems} />
            </div>
            <div className="app-compose__main">
                {loading
                    ? <Progressing pageLoader />
                    : <AppComposeRouter
                        configStatus={state.configStatus}
                        respondOnSuccess={respondOnSuccess}
                        isCiPipeline={state.isCiPipeline}
                        getWorkflows={reload}
                        maxAllowedUrl={state.maximumAllowedUrl}
                    />}
            </div>
        </div>
        <DeleteDialogContainer />
    </>
}

const NextButton: React.FC<{ configStatus: any; isCiPipeline: boolean; stage: APP_COMPOSE_STAGE; stageNo: number }> = ({ configStatus, isCiPipeline, stage, stageNo }) => {
    const { push } = useHistory()
    const { appId } = useParams<{ appId }>()

    if (!isCiPipeline)
        return (
            <div className="app-compose__next-section">
                <button
                    type="button"
                    disabled={configStatus <= stageNo}
                    className="cta align-right flex"
                    onClick={(event) => {
                        let url = getAppComposeURL(appId, stage);
                        push(url);
                    }}
                >
                    <span className="mr-5">Next </span>
                    <Next className="icon-dim-18" />
                </button>
            </div>
        );
    return null;
};


function Navigation({ navItems, deleteApp }) {
    return (
        <>
            {navItems.map((item) => {
                if (item.stage < AppConfigStatus.ENV_OVERRIDE) {
                    return (
                        <NavLink
                            key={item.title}
                            onClick={(event) => {
                                if (item.isLocked) event.preventDefault();
                            }}
                            className={'app-compose__nav-item'}
                            to={item.href}
                        >
                            {item.title}
                            {item.isLocked && <img src={lockIcon} alt="locked" className="app-compose__nav-icon" />}
                        </NavLink>
                    );
                } else {
                    return item.isLocked ? (
                        <NavLink
                            key={item.title}
                            onClick={(event) => {
                                if (item.isLocked) event.preventDefault();
                            }}
                            className={'app-compose__nav-item'}
                            to={item.href}
                        >
                            {item.title}
                            {item.isLocked && <img src={lockIcon} alt="locked" className="app-compose__nav-icon" />}
                        </NavLink>
                    ) : (
                            <EnvironmentOverrideRouter key={item.title} />
                        );
                }
            })}
            <button
                type="button"
                className="cta delete cta-delete-app mt-8"
                onClick={deleteApp}
            >
                Delete Application
            </button>
        </>
    );
}

function AppComposeRouter({ configStatus, respondOnSuccess, isCiPipeline, getWorkflows, maxAllowedUrl }) {
    const { path } = useRouteMatch()
    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/materials`}>
                        <>
                            <Artifacts respondOnSuccess={respondOnSuccess} configStatus={configStatus} />
                            <NextButton
                                stage={APP_COMPOSE_STAGE.CI_CONFIG}
                                stageNo={AppConfigStatus.MATERIAL}
                                isCiPipeline={isCiPipeline}
                                configStatus={configStatus}
                            />
                        </>
                    </Route>
                    {configStatus > AppConfigStatus.MATERIAL && (
                        <Route path={`${path}/${URLS.APP_DOCKER_CONFIG}`}>
                            <>
                                <CIConfig respondOnSuccess={respondOnSuccess} />
                                <NextButton
                                    stage={APP_COMPOSE_STAGE.DEPLOYMENT_TEMPLATE}
                                    stageNo={AppConfigStatus.TEMPLATE}
                                    isCiPipeline={isCiPipeline}
                                    configStatus={configStatus}
                                />
                            </>
                        </Route>
                    )}
                    {configStatus > AppConfigStatus.TEMPLATE && (
                        <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                            <>
                                <DeploymentConfig respondOnSuccess={respondOnSuccess} />
                                <NextButton
                                    stage={APP_COMPOSE_STAGE.WORKFLOW_EDITOR}
                                    stageNo={AppConfigStatus.CHARTS}
                                    isCiPipeline={isCiPipeline}
                                    configStatus={configStatus}
                                />
                            </>
                        </Route>
                    )}
                    {configStatus > AppConfigStatus.CHARTS && (
                        <>
                            <Route
                                path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                                render={(props) => (
                                    <WorkflowEdit
                                        configStatus={configStatus}
                                        isCiPipeline={isCiPipeline}
                                        respondOnSuccess={respondOnSuccess}
                                        getWorkflows={getWorkflows}
                                    />
                                )}
                            />
                            <Route
                                path={`${path}/${URLS.APP_CM_CONFIG}`}
                                render={(props) => <ConfigMap respondOnSuccess={respondOnSuccess} />}
                            />
                            <Route
                                path={`${path}/${URLS.APP_CS_CONFIG}`}
                                render={(props) => <Secret respondOnSuccess={respondOnSuccess} />}
                            />
                            <Route
                                path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                                render={(props) => <EnvironmentOverride />}
                            />
                        </>
                    )}
                    <Redirect to={maxAllowedUrl} />
                </Switch>
            </Suspense>
        </ErrorBoundary>
    );
}

function Header() {
    const { appId } = useParams<{ appId }>()
    const { url, path } = useRouteMatch()
    const currentPathname = useRef('');
    const { push } = useHistory()
    const { pathname } = useLocation()

    useEffect(() => {
        currentPathname.current = pathname;
    }, [pathname]);

    const handleAppChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(url, '').split('/')[1];
            const newUrl = generatePath(path, { appId: value });
            push(`${newUrl}/${tab}`);
        },
        [pathname],
    );

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                            primaryKey="appId"
                            api={getAppListMin}
                            primaryValue="name"
                            matchedKeys={[]}
                            apiPrimaryKey="id"
                            onChange={handleAppChange}
                        />
                    ),
                    linked: false,
                },
                'app': {
                    component: <span className="cn-5 fs-18 lowercase">apps</span>,
                    linked: true
                },
            },
        },
        [appId],
    );
    return (
        <div className="page-header">
            <div className="flex left cn-9 fs-18 page-header__title">
                <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 1)} />
            </div>
            <div className="flex page-header__cta-container">
                <Link className="cta ghosted no-decor" to={`${URLS.APP}/${appId}/${URLS.APP_TRIGGER}`}>
                    Go to Trigger
                </Link>
            </div>
        </div>
    )
}

function EnvironmentOverrideRouter() {
    const { pathname } = useLocation()
    const { appId } = useParams<{ appId }>()
    const [collapsed, toggleCollapsed] = useState(false)
    const previousPathName = usePrevious(pathname)
    const { url, path } = useRouteMatch()
    const [environmentsLoading, environmentResult, error, reloadEnvironments] = useAsync(() => getAppOtherEnvironment(appId), [appId], !!appId)

    useEffect(() => {
        if (previousPathName && previousPathName.includes('/cd-pipeline') && !pathname.includes('/cd-pipeline')) {
            reloadEnvironments()
        }
    }, [pathname])

    return (
        <div className="flex column left environment-routes-container top">
            <div className="app-compose__nav-item" onClick={e => toggleCollapsed(!collapsed)}>
                Environment Overrides
            <img src={arrowIcon} className="rotate" alt="" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />
            </div>
            {!collapsed && <div className="environment-routes">
                {Array.isArray(environmentResult?.result) && (environmentResult.result).map(env => {
                    let LINK = `${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${env.environmentId}`;
                    return <NavLink key={env.environmentId}
                        className="app-compose__nav-item"
                        to={LINK}>{env.environmentName}
                    </NavLink>
                })}
            </div>}
        </div >
    )
}
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useLocation, useRouteMatch, useHistory } from 'react-router';
import { NavLink, Link, Route, Switch } from 'react-router-dom';
import { URLS, getAppComposeURL, APP_COMPOSE_STAGE, isCIPipelineCreated, ViewType, NavItem } from '../../../../config';
import { ErrorBoundary, Progressing, usePrevious, showError, DeleteDialog, ConfirmationDialog, useAsync, ErrorScreenManager } from '../../../common';
import { getAppConfigStatus, getAppOtherEnvironment, getWorkflowList } from '../../../../services/service';
import { deleteApp } from './appConfig.service';
import { ReactComponent as Next } from '../../../../assets/icons/ic-arrow-forward.svg';
import { ReactComponent as Dropdown } from '../../../../assets/icons/appstatus/ic-dropdown.svg'
import { ReactComponent as Lock } from '../../../../assets/icons/ic-locked.svg'
import warn from '../../../../assets/icons/ic-warning.svg';
import { toast } from 'react-toastify';
import './appConfig.scss';

const MaterialList = lazy(() => import('../../../material/MaterialList'));
const CIConfig = lazy(() => import('../../../ciConfig/CIConfig'));
const DeploymentConfig = lazy(() => import('../../../deploymentConfig/DeploymentConfig'));
const ConfigMap = lazy(() => import('../../../configMaps/ConfigMap'));
const Secret = lazy(() => import('../../../secrets/Secret'));
const WorkflowEdit = lazy(() => import('../../../workflowEditor/workflowEditor'));
const EnvironmentOverride = lazy(() => import('../../../EnvironmentOverride/EnvironmentOverride'));

export enum STAGE_NAME {
    LOADING = "LOADING",
    APP = "APP",
    GIT_MATERIAL = "MATERIAL",
    CI_CONFIG = "TEMPLATE",
    CI_PIPELINE = "CI_PIPELINE",
    DEPLOYMENT_TEMPLATE = "CHART",
    CD_PIPELINE = "CD_PIPELINE",
    CHART_ENV_CONFIG = "CHART_ENV_CONFIG",
}

type StageNames = keyof typeof STAGE_NAME | "WORKFLOW" | "CONFIGMAP" | "SECRETS" | "ENV_OVERRIDE";
export interface AppConfigState {
    view: string;
    stattusCode: number;
    stageName: StageNames;
    isUnlocked: any,
    appName: string;
    isCiPipeline: boolean;
    showDeleteConfirm: boolean;
    navItems: NavItem[],
    maximumAllowedUrl: string;
    canDeleteApp: boolean;
}
//stage: last configured stage
function isUnlocked(stage) {
    return {
        material: stage === STAGE_NAME.APP || stage === STAGE_NAME.GIT_MATERIAL || stage === STAGE_NAME.CI_CONFIG || stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        dockerBuildConfig: stage === STAGE_NAME.GIT_MATERIAL || stage === STAGE_NAME.CI_CONFIG || stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        deploymentTemplate: stage === STAGE_NAME.CI_CONFIG || stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        workflowEditor: stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        configmap: stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        secret: stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
        envOverride: stage === STAGE_NAME.CI_PIPELINE || stage === STAGE_NAME.DEPLOYMENT_TEMPLATE || stage === STAGE_NAME.CD_PIPELINE || stage === STAGE_NAME.CHART_ENV_CONFIG,
    }
}

function getNavItems(isUnlocked, appId): { navItems } {
    let navItems = [
        {
            title: 'Git Material',
            href: `/app/${appId}/edit/materials`,
            stage: STAGE_NAME.GIT_MATERIAL,
            isLocked: !isUnlocked.material,
        },
        {
            title: 'Docker Build Config',
            href: `/app/${appId}/edit/docker-build-config`,
            stage: STAGE_NAME.CI_CONFIG,
            isLocked: !isUnlocked.dockerBuildConfig,
        },
        {
            title: 'Deployment Template',
            href: `/app/${appId}/edit/deployment-template`,
            stage: STAGE_NAME.DEPLOYMENT_TEMPLATE,
            isLocked: !isUnlocked.deploymentTemplate,
        },
        {
            title: 'Workflow Editor',
            href: `/app/${appId}/edit/workflow`,
            stage: "WORKFLOW",
            isLocked: !isUnlocked.workflowEditor,
        },
        {
            title: 'ConfigMaps',
            href: `/app/${appId}/edit/configmap`,
            stage: "CONFIGMAP",
            isLocked: !isUnlocked.configmap,
        },
        {
            title: 'Secrets',
            href: `/app/${appId}/edit/secrets`,
            stage: "SECRETS",
            isLocked: !isUnlocked.secret,
        },
        {
            title: 'Environment Override',
            href: `/app/${appId}/edit/env-override`,
            stage: "ENV_OVERRIDE",
            isLocked: !isUnlocked.envOverride,
        },
    ];

    return { navItems };
}

export default function AppConfig() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const location = useLocation();
    const history = useHistory();

    const [state, setState] = useState<AppConfigState>({
        view: ViewType.LOADING,
        stattusCode: 0,
        isUnlocked: isUnlocked(STAGE_NAME.LOADING),
        stageName: STAGE_NAME.LOADING,
        appName: '',
        isCiPipeline: false,
        showDeleteConfirm: false,
        navItems: [],
        maximumAllowedUrl: '',
        canDeleteApp: false,
    })

    useEffect(() => {
        Promise.all([getAppConfigStatus(+appId), getWorkflowList(appId)]).then(([configStatusRes, workflowRes]) => {
            let lastConfiguredStage = configStatusRes.result.slice().reverse().find(stage => stage.status);
            let lastConfiguredStageName = lastConfiguredStage.stageName;
            let configs = isUnlocked(lastConfiguredStageName);
            let { navItems } = getNavItems(configs, appId);
            let index = navItems.findIndex(item => item.isLocked);
            if (index < 0) {
                index = 4;
            }
            let redirectUrl = navItems[index - 1].href;
            let isCiPipeline = isCIPipelineCreated(configStatusRes.result);
            setState({
                view: ViewType.FORM,
                stattusCode: 200,
                showDeleteConfirm: false,
                appName: workflowRes.result.appName,
                isUnlocked: configs,
                stageName: lastConfiguredStage,
                isCiPipeline,
                navItems,
                maximumAllowedUrl: redirectUrl,
                canDeleteApp: workflowRes.result.workflows.length === 0,
            })
            if (location.pathname === match.url) {
                history.replace(redirectUrl);
            }
        }).catch((errors) => {
            showError(errors);
            setState({ ...state, view: ViewType.ERROR, stattusCode: errors.code });
        })
    }, [appId])

    function reloadWorkflows() {
        getWorkflowList(appId).then((response) => {
            setState({
                ...state,
                canDeleteApp: response.result.workflows.length === 0
            })
        })
    }
    function redirectToWorkflowEditor() {
        return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR);
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
        getAppConfigStatus(+appId).then((configStatusRes) => {
            let lastConfiguredStage = configStatusRes.result.slice().reverse().find(stage => stage.status);
            let configs = isUnlocked(lastConfiguredStage.stageName);
            let { navItems } = getNavItems(configs, appId);
            let index = navItems.findIndex(item => item.isLocked);
            if (index < 0) {
                index = 4;
            }
            let redirectUrl = navItems[index - 1].href;
            let isCiPipeline = isCIPipelineCreated(configStatusRes.result);

            setState(state => ({
                ...state,
                isUnlocked: configs,
                stageName: lastConfiguredStage,
                isCiPipeline,
                navItems,
                maximumAllowedUrl: redirectUrl,
            }));
        }).catch((errors) => {
            showError(errors);
        })
    }

    function showDeleteConfirmation(e) {
        setState((state) => ({ ...state, showDeleteConfirm: true }));
    }

    function renderDeleteDialog() {
        if (state.showDeleteConfirm) {
            if (state.canDeleteApp)
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
                        <Link onClick={e => setState(state => ({ ...state, showDeleteConfirm: false }))} to={redirectToWorkflowEditor()} className="cta ml-12 no-decor">
                            View Workflows
                        </Link>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog >
            }
        }
        return null
    }

    if (state.view === ViewType.LOADING) return <Progressing pageLoader />
    else if (state.view === ViewType.ERROR) return <ErrorScreenManager code={state.stattusCode} />
    else return <>
        <div className="app-compose" >
            <div className="app-compose__nav flex column left top position-rel">
                <Navigation deleteApp={showDeleteConfirmation} navItems={state.navItems} />
            </div>
            <div className="app-compose__main">
                <AppComposeRouter navItems={state.navItems}
                    isUnlocked={state.isUnlocked}
                    isCiPipeline={state.isCiPipeline}
                    maxAllowedUrl={state.maximumAllowedUrl}
                    respondOnSuccess={respondOnSuccess}
                    getWorkflows={reloadWorkflows} />
            </div>
        </div>
        {renderDeleteDialog()}
    </>
}

const NextButton: React.FC<{ isCiPipeline: boolean; navItems, currentStageName, isDisabled }> = ({ isCiPipeline, navItems, currentStageName, isDisabled }) => {
    const history = useHistory();
    let index = navItems.findIndex(item => item.stage === currentStageName);
    let nextUrl = navItems[index + 1].href;
    if (!isCiPipeline) {
        return <div className="app-compose__next-section">
            <button type="button"
                disabled={isDisabled}
                className="cta align-right flex"
                onClick={(event) => {
                    history.push(nextUrl);
                }}>
                <span className="mr-5">Next </span>
                <Next className="icon-dim-18" />
            </button>
        </div>
    }
    return null;
};

function Navigation({ navItems, deleteApp }) {
    return (
        <>
            {navItems.map((item) => {
                if (item.stage !== "ENV_OVERRIDE" || (item.stage === "ENV_OVERRIDE" && item.isLocked)) {
                    return <NavLink key={item.title}
                        onClick={(event) => {
                            if (item.isLocked) event.preventDefault();
                        }}
                        className={'app-compose__nav-item'}
                        to={item.href}>
                        {item.title}
                        {item.isLocked && <Lock className="app-compose__nav-icon" />}
                    </NavLink>
                }
                else {
                    return <EnvironmentOverrideRouter key={item.title} />
                }
            })}
            <button type="button"
                className="cta delete cta-delete-app mt-8"
                onClick={deleteApp}>
                Delete Application
            </button>
        </>
    );
}

function AppComposeRouter({ isUnlocked, navItems, respondOnSuccess, isCiPipeline, getWorkflows, maxAllowedUrl }) {
    const { path } = useRouteMatch();

    return <ErrorBoundary>
        <Suspense fallback={<Progressing pageLoader />}>
            <Switch>
                <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                    <>
                        <MaterialList respondOnSuccess={respondOnSuccess} />
                        <NextButton currentStageName={STAGE_NAME.GIT_MATERIAL}
                            navItems={navItems}
                            isDisabled={!isUnlocked.dockerBuildConfig}
                            isCiPipeline={isCiPipeline} />
                    </>
                </Route>
                {isUnlocked.dockerBuildConfig && (
                    <Route path={`${path}/${URLS.APP_DOCKER_CONFIG}`}>
                        <>
                            <CIConfig respondOnSuccess={respondOnSuccess} />
                            <NextButton currentStageName={STAGE_NAME.CI_CONFIG}
                                navItems={navItems}
                                isDisabled={!isUnlocked.deploymentTemplate}
                                isCiPipeline={isCiPipeline}
                            />
                        </>
                    </Route>
                )}
                {isUnlocked.deploymentTemplate && (
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <>
                            <DeploymentConfig respondOnSuccess={respondOnSuccess} />
                            <NextButton currentStageName={STAGE_NAME.DEPLOYMENT_TEMPLATE}
                                navItems={navItems}
                                isDisabled={!isUnlocked.workflowEditor}
                                isCiPipeline={isCiPipeline}
                            />
                        </>
                    </Route>
                )}
                {isUnlocked.workflowEditor && (
                    <>
                        <Route path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                            render={(props) => (
                                <WorkflowEdit configStatus={1}
                                    isCiPipeline={isCiPipeline}
                                    respondOnSuccess={respondOnSuccess}
                                    getWorkflows={getWorkflows}
                                />
                            )}
                        />
                        <Route path={`${path}/${URLS.APP_CM_CONFIG}`}
                            render={(props) => <ConfigMap respondOnSuccess={respondOnSuccess} />}
                        />
                        <Route path={`${path}/${URLS.APP_CS_CONFIG}`}
                            render={(props) => <Secret respondOnSuccess={respondOnSuccess} />}
                        />
                        <Route path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                            render={(props) => <EnvironmentOverride />}
                        />
                    </>
                )}
            </Switch>
        </Suspense>
    </ErrorBoundary>
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
            <div className="app-compose__nav-item flex" onClick={e => toggleCollapsed(!collapsed)}>
                Environment Overrides
            <Dropdown className="icon-dim-24 rotate" style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }} />
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
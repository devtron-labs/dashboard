import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useLocation, useRouteMatch, useHistory } from 'react-router'
import { NavLink, Link, Route, Switch } from 'react-router-dom'
import {
    URLS,
    getAppComposeURL,
    APP_COMPOSE_STAGE,
    isCIPipelineCreated,
    ViewType,
    isCDPipelineCreated,
} from '../../../../config'
import {
    ErrorBoundary,
    Progressing,
    usePrevious,
    showError,
    DeleteDialog,
    ConfirmationDialog,
    useAsync,
    ErrorScreenManager,
    ConditionalWrap,
} from '../../../common'
import { getAppConfigStatus, getAppOtherEnvironment, getWorkflowList } from '../../../../services/service'
import { deleteApp } from './appConfig.service'
import { ReactComponent as Next } from '../../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Lock } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import DockerFileInUse from '../../../../assets/img/ic-dockerfile-in-use.png'
import { toast } from 'react-toastify'
import './appConfig.scss'
import { DOCUMENTATION } from '../../../../config'
import AppConfigurationCheckBox from './AppConfigurationCheckBox'
import InfoColourBar from '../../../common/infocolourBar/InfoColourbar'
import {
    AppComposeRouterProps,
    AppConfigNavigationProps,
    AppConfigProps,
    AppConfigState,
    AppStageUnlockedType,
    CustomNavItemsType,
    EnvironmentOverrideRouteProps,
    EnvironmentOverridesProps,
    NextButtonProps,
    STAGE_NAME,
} from './appConfig.type'
import { getUserRole } from '../../../userGroups/userGroup.service'
import ExternalLinks from '../../../externalLinks/ExternalLinks'
import { UserRoleType } from '../../../userGroups/userGroups.types'
import TippyCustomized, { TippyTheme } from '../../../common/TippyCustomized'
import { DeleteComponentsName } from '../../../../config/constantMessaging'
import { DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE } from '../../../../config/constantMessaging'

const MaterialList = lazy(() => import('../../../material/MaterialList'))
const CIConfig = lazy(() => import('../../../ciConfig/CIConfig'))
const DeploymentConfig = lazy(() => import('../../../deploymentConfig/DeploymentConfig'))
const ConfigMap = lazy(() => import('../../../configMaps/ConfigMap'))
const Secret = lazy(() => import('../../../secrets/Secret'))
const WorkflowEdit = lazy(() => import('../../../workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('../../../EnvironmentOverride/EnvironmentOverride'))

//stage: last configured stage
function isUnlocked(stage: string): AppStageUnlockedType {
    return {
        material:
            stage === STAGE_NAME.APP ||
            stage === STAGE_NAME.GIT_MATERIAL ||
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        dockerBuildConfig:
            stage === STAGE_NAME.GIT_MATERIAL ||
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        deploymentTemplate:
            stage === STAGE_NAME.CI_CONFIG ||
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        workflowEditor:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        configmap:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        secret:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
        envOverride:
            stage === STAGE_NAME.CI_PIPELINE ||
            stage === STAGE_NAME.DEPLOYMENT_TEMPLATE ||
            stage === STAGE_NAME.CD_PIPELINE ||
            stage === STAGE_NAME.CHART_ENV_CONFIG,
    }
}

function getCompletedStep(isUnlocked: AppStageUnlockedType): number {
    if (isUnlocked.workflowEditor) {
        return 3
    } else if (isUnlocked.deploymentTemplate) {
        return 2
    } else if (isUnlocked.dockerBuildConfig) {
        return 1
    } else {
        return 0
    }
}

function getNavItems(isUnlocked: AppStageUnlockedType, appId: string): { navItems } {
    const completedSteps = getCompletedStep(isUnlocked)
    const completedPercent = completedSteps * 25
    let navItems = [
        {
            title: 'Git Repository',
            href: `/app/${appId}/edit/materials`,
            stage: STAGE_NAME.GIT_MATERIAL,
            isLocked: !isUnlocked.material,
            supportDocumentURL: DOCUMENTATION.APP_CREATE_MATERIAL,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'Build Configuration',
            href: `/app/${appId}/edit/docker-build-config`,
            stage: STAGE_NAME.CI_CONFIG,
            isLocked: !isUnlocked.dockerBuildConfig,
            supportDocumentURL: DOCUMENTATION.APP_CREATE_CI_CONFIG,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'Base Deployment Template',
            href: `/app/${appId}/edit/deployment-template`,
            stage: STAGE_NAME.DEPLOYMENT_TEMPLATE,
            isLocked: !isUnlocked.deploymentTemplate,
            supportDocumentURL: DOCUMENTATION.APP_DEPLOYMENT_TEMPLATE,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'Workflow Editor',
            href: `/app/${appId}/edit/workflow`,
            stage: 'WORKFLOW',
            isLocked: !isUnlocked.workflowEditor,
            supportDocumentURL: DOCUMENTATION.APP_CREATE_WORKFLOW,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'ConfigMaps',
            href: `/app/${appId}/edit/configmap`,
            stage: 'CONFIGMAP',
            isLocked: !isUnlocked.configmap,
            supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'Secrets',
            href: `/app/${appId}/edit/secrets`,
            stage: 'SECRETS',
            isLocked: !isUnlocked.secret,
            supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'External Links',
            href: `/app/${appId}/edit/external-links`,
            stage: 'EXTERNAL_LINKS',
            isLocked: false,
            supportDocumentURL: DOCUMENTATION.EXTERNAL_LINKS,
            flowCompletionPercent: completedPercent,
            currentStep: completedSteps,
        },
        {
            title: 'Environment Override',
            href: `/app/${appId}/edit/env-override`,
            stage: 'ENV_OVERRIDE',
            isLocked: !isUnlocked.envOverride,
        },
    ]

    return { navItems }
}

export default function AppConfig({ appName }: AppConfigProps) {
    const { appId } = useParams<{ appId: string }>()
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [environments, setEnvironments] = useState([])
    const [userRole, setUserRole] = useState<UserRoleType>()
    const [showCannotDeleteTooltip, setShowCannotDeleteTooltip] = useState(false)
    const [showRepoOnDelete, setShowRepoOnDelete] = useState('')

    const [state, setState] = useState<AppConfigState>({
        view: ViewType.LOADING,
        stattusCode: 0,
        isUnlocked: isUnlocked(STAGE_NAME.LOADING),
        stageName: STAGE_NAME.LOADING,
        appName: '',
        isCiPipeline: false,
        isCDPipeline: false,
        showDeleteConfirm: false,
        navItems: [],
        maximumAllowedUrl: '',
        canDeleteApp: false,
        workflowsRes: null,
    })

    useEffect(() => {
        if (appName) {
            getUserRole(appName)
                .then(({ result }) => {
                    setUserRole(result?.['role'] as UserRoleType)
                })
                .catch((err) => {
                    showError(err)
                })
        }
    }, [appName])

    useEffect(() => {
        Promise.all([getAppConfigStatus(+appId), getWorkflowList(appId)])
            .then(([configStatusRes, workflowRes]) => {
                let lastConfiguredStage = configStatusRes.result
                    .slice()
                    .reverse()
                    .find((stage) => stage.status)
                let lastConfiguredStageName = lastConfiguredStage.stageName
                let configs = isUnlocked(lastConfiguredStageName)
                let { navItems } = getNavItems(configs, appId)
                let index = navItems.findIndex((item) => item.isLocked)
                if (index < 0) {
                    index = 4
                }
                let redirectUrl = navItems[index - 1].href
                let isCiPipeline = isCIPipelineCreated(configStatusRes.result)
                let isCDPipeline = isCDPipelineCreated(configStatusRes.result)

                setState({
                    view: ViewType.FORM,
                    stattusCode: 200,
                    showDeleteConfirm: false,
                    appName: workflowRes.result.appName,
                    isUnlocked: configs,
                    stageName: lastConfiguredStage,
                    isCiPipeline,
                    isCDPipeline,
                    navItems,
                    maximumAllowedUrl: redirectUrl,
                    canDeleteApp: workflowRes.result.workflows.length === 0,
                    workflowsRes: workflowRes.result,
                })
                if (location.pathname === match.url) {
                    history.replace(redirectUrl)
                }
            })
            .catch((errors) => {
                showError(errors)
                setState({ ...state, view: ViewType.ERROR, stattusCode: errors.code })
            })
    }, [appId])

    function reloadWorkflows() {
        getWorkflowList(appId).then((response) => {
            setState({
                ...state,
                canDeleteApp: response.result.workflows.length === 0,
                workflowsRes: response.result,
            })
        })
    }
    function redirectToWorkflowEditor() {
        return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR)
    }

    async function deleteAppHandler() {
        deleteApp(appId)
            .then((response) => {
                if (response.code === 200) {
                    toast.success('Application Deleted!!!')
                    history.push(`${URLS.APP}`)
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    function respondOnSuccess() {
        getAppConfigStatus(+appId)
            .then((configStatusRes) => {
                let lastConfiguredStage = configStatusRes.result
                    .slice()
                    .reverse()
                    .find((stage) => stage.status)
                let configs = isUnlocked(lastConfiguredStage.stageName)
                let { navItems } = getNavItems(configs, appId)
                let index = navItems.findIndex((item) => item.isLocked)
                if (index < 0) {
                    index = 4
                }
                let redirectUrl = navItems[index - 1].href
                let isCiPipeline = isCIPipelineCreated(configStatusRes.result)
                let isCDPipeline = isCDPipelineCreated(configStatusRes.result)

                setState((state) => ({
                    ...state,
                    isUnlocked: configs,
                    stageName: lastConfiguredStage,
                    isCiPipeline,
                    isCDPipeline,
                    navItems,
                    maximumAllowedUrl: redirectUrl,
                }))
            })
            .catch((errors) => {
                showError(errors)
            })
    }

    function showDeleteConfirmation() {
        setState((state) => ({ ...state, showDeleteConfirm: true }))
    }

    function renderDeleteDialog() {
        if (state.showDeleteConfirm) {
            if (state.canDeleteApp)
                return (
                    <DeleteDialog
                        title={`Delete '${state.appName}'?`}
                        delete={deleteAppHandler}
                        closeDelete={() => {
                            setState((state) => ({ ...state, showDeleteConfirm: false }))
                        }}
                    >
                        <DeleteDialog.Description>
                            <p className="fs-13 cn-7 lh-1-54">
                                This will delete all resources associated with this application.
                            </p>
                            <p className="fs-13 cn-7 lh-1-54">Deleted applications cannot be restored.</p>
                        </DeleteDialog.Description>
                    </DeleteDialog>
                )
            else {
                return (
                    <ConfirmationDialog>
                        <ConfirmationDialog.Icon src={warn} />
                        <ConfirmationDialog.Body title="Cannot Delete application" />
                        <p className="fs-13 cn-7 lh-1-54">
                            Delete all pipelines and workflows before deleting this application.
                        </p>
                        <ConfirmationDialog.ButtonGroup>
                            <button
                                type="button"
                                className="cta cancel"
                                onClick={(e) => {
                                    setState((state) => ({ ...state, showDeleteConfirm: false }))
                                }}
                            >
                                Cancel
                            </button>
                            <Link
                                onClick={(e) => setState((state) => ({ ...state, showDeleteConfirm: false }))}
                                to={redirectToWorkflowEditor()}
                                className="cta ml-12 dc__no-decor"
                            >
                                View Workflows
                            </Link>
                        </ConfirmationDialog.ButtonGroup>
                    </ConfirmationDialog>
                )
            }
        }
        return null
    }

    function getAdditionalParentClass() {
        return location.pathname.includes(`/${URLS.APP_DOCKER_CONFIG}`) ||
            (typeof Storage !== 'undefined' && localStorage.getItem('takeMeThereClicked') === '1')
            ? 'dc__position-rel'
            : ''
    }

    function toggleRepoSelectionTippy() {
        setShowCannotDeleteTooltip(!showCannotDeleteTooltip)
    }

    if (state.view === ViewType.LOADING) {
        return <Progressing pageLoader />
    } else if (state.view === ViewType.ERROR) {
        return <ErrorScreenManager code={state.stattusCode} />
    } else {
        const _canShowExternalLinks =
            userRole === UserRoleType.SuperAdmin || userRole === UserRoleType.Admin || userRole === UserRoleType.Manager
        return (
            <>
                <div className={`app-compose ${getAdditionalParentClass()}`}>
                    <div
                        className={`app-compose__nav flex column left top ${
                            showCannotDeleteTooltip ? '' : 'dc__position-rel'
                        } dc__overflow-scroll ${state.isCDPipeline ? 'hide-app-config-help' : ''} ${
                            _canShowExternalLinks ? '' : 'hide-external-links'
                        }`}
                    >
                        <Navigation
                            deleteApp={showDeleteConfirmation}
                            navItems={state.navItems}
                            isCDPipeline={state.isCDPipeline}
                            canShowExternalLinks={_canShowExternalLinks}
                            showCannotDeleteTooltip={showCannotDeleteTooltip}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            getRepo={showRepoOnDelete}
                        />
                    </div>
                    <div className="app-compose__main">
                        <AppComposeRouter
                            navItems={state.navItems}
                            isUnlocked={state.isUnlocked}
                            isCiPipeline={state.isCiPipeline}
                            isCDPipeline={state.isCDPipeline}
                            maxAllowedUrl={state.maximumAllowedUrl}
                            respondOnSuccess={respondOnSuccess}
                            getWorkflows={reloadWorkflows}
                            environments={environments}
                            setEnvironments={setEnvironments}
                            workflowsRes={state.workflowsRes}
                            userRole={userRole}
                            canShowExternalLinks={_canShowExternalLinks}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            setRepoState={setShowRepoOnDelete}
                        />
                    </div>
                </div>
                {renderDeleteDialog()}
            </>
        )
    }
}

const NextButton: React.FC<NextButtonProps> = ({ isCiPipeline, navItems, currentStageName, isDisabled }) => {
    const history = useHistory()
    let index = navItems.findIndex((item) => item.stage === currentStageName)
    let nextUrl = navItems[index + 1].href
    if (!isCiPipeline) {
        return (
            <div className="app-compose__next-section">
                <button
                    type="button"
                    disabled={isDisabled}
                    className="cta dc__align-right flex"
                    onClick={(event) => {
                        history.push(nextUrl)
                    }}
                >
                    <span className="mr-5">Next </span>
                    <Next className="icon-dim-18" />
                </button>
            </div>
        )
    }
    return null
}

function renderNavItem(item: CustomNavItemsType) {
    return (
        <NavLink
            key={item.title}
            onClick={(event) => {
                if (item.isLocked) event.preventDefault()
            }}
            className="app-compose__nav-item cursor"
            to={item.href}
        >
            <span className="dc__ellipsis-right nav-text">{item.title}</span>
            {item.isLocked && <Lock className="app-compose__nav-icon icon-dim-20" />}
        </NavLink>
    )
}

function Navigation({
    navItems,
    deleteApp,
    isCDPipeline,
    canShowExternalLinks,
    showCannotDeleteTooltip,
    toggleRepoSelectionTippy,
    getRepo,
}: AppConfigNavigationProps) {
    const location = useLocation()
    const selectedNav = navItems.filter((navItem) => location.pathname.indexOf(navItem.href) >= 0)[0]
    return (
        <>
            {!isCDPipeline && <AppConfigurationCheckBox selectedNav={selectedNav} />}
            {navItems.map((item) => {
                if (item.stage === 'EXTERNAL_LINKS') {
                    return (
                        canShowExternalLinks && (
                            <div key={item.stage}>
                                {item.stage === 'EXTERNAL_LINKS' && <div className="dc__border-bottom-n1 mt-8 mb-8" />}
                                {renderNavItem(item)}
                            </div>
                        )
                    )
                } else if (item.stage !== 'ENV_OVERRIDE' || (item.stage === 'ENV_OVERRIDE' && item.isLocked)) {
                    return (
                        <ConditionalWrap
                            condition={showCannotDeleteTooltip && item.stage === STAGE_NAME.CI_CONFIG}
                            wrap={(children) => (
                                <TippyCustomized
                                    theme={TippyTheme.black}
                                    className="w-300 ml-2"
                                    placement="right"
                                    iconPath={DockerFileInUse}
                                    visible={showCannotDeleteTooltip}
                                    iconClass="repo-configured-icon"
                                    iconSize={32}
                                    infoTextHeading={`${DeleteComponentsName.GitRepo} '${getRepo}' is configured as source for Dockerfile`}
                                    infoText={DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE}
                                    showCloseButton={true}
                                    trigger="manual"
                                    interactive={true}
                                    showOnCreate={true}
                                    arrow={true}
                                    animation="shift-toward-subtle"
                                    onClose={toggleRepoSelectionTippy}
                                >
                                    <div>{children}</div>
                                </TippyCustomized>
                            )}
                        >
                            {renderNavItem(item)}
                        </ConditionalWrap>
                    )
                } else {
                    return <EnvironmentOverrideRouter key={item.title} />
                }
            })}
            <div className="cta-delete-app flex w-100 dc__position-sticky pt-2 pb-16 bcn-0">
                <button type="button" className="flex cta delete mt-8 w-100 h-36" onClick={deleteApp}>
                    Delete Application
                </button>
            </div>
        </>
    )
}

function AppComposeRouter({
    isUnlocked,
    navItems,
    respondOnSuccess,
    isCiPipeline,
    getWorkflows,
    maxAllowedUrl,
    isCDPipeline,
    environments,
    setEnvironments,
    workflowsRes,
    userRole,
    canShowExternalLinks,
    toggleRepoSelectionTippy,
    setRepoState,
}: AppComposeRouterProps) {
    const { path } = useRouteMatch()

    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                        <>
                            <MaterialList
                                respondOnSuccess={respondOnSuccess}
                                isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                                toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                                setRepo={setRepoState}
                            />
                            <NextButton
                                currentStageName={STAGE_NAME.GIT_MATERIAL}
                                navItems={navItems}
                                isDisabled={!isUnlocked.dockerBuildConfig}
                                isCiPipeline={isCiPipeline}
                            />
                        </>
                    </Route>
                    {isUnlocked.dockerBuildConfig && (
                        <Route path={`${path}/${URLS.APP_DOCKER_CONFIG}`}>
                            <CIConfig
                                respondOnSuccess={respondOnSuccess}
                                isCDPipeline={isCDPipeline}
                                isCiPipeline={isCiPipeline}
                                navItems={navItems}
                            />
                        </Route>
                    )}
                    {isUnlocked.deploymentTemplate && (
                        <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                            <DeploymentConfig
                                respondOnSuccess={respondOnSuccess}
                                isUnSet={!isUnlocked.workflowEditor}
                                navItems={navItems}
                                isCiPipeline={isCiPipeline}
                                environments={environments}
                                setEnvironments={setEnvironments}
                            />
                        </Route>
                    )}
                    {canShowExternalLinks && (
                        <Route path={`${path}/${URLS.APP_EXTERNAL_LINKS}`}>
                            <ExternalLinks isAppConfigView={true} userRole={userRole} />
                        </Route>
                    )}
                    {isUnlocked.workflowEditor && (
                        <>
                            <Route
                                path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                                render={(props) => (
                                    <WorkflowEdit
                                        configStatus={1}
                                        isCDPipeline={isCDPipeline}
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
                                render={(props) => (
                                    <EnvironmentOverride
                                        environments={environments}
                                        setEnvironments={setEnvironments}
                                    />
                                )}
                            />
                        </>
                    )}
                </Switch>
            </Suspense>
        </ErrorBoundary>
    )
}

const EnvOverridesHelpNote = () => {
    return (
        <div className="fs-12 fw-4 lh-18">
            Environment overrides allow you to manage environment specific configurations after you’ve created
            deployment pipelines. &nbsp;
            <a
                className="dc__link"
                href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE}
                rel="noreferrer noopener"
                target="_blank"
            >
                Learn more
            </a>
        </div>
    )
}

const EnvOverrideRoute = ({ envOverride }: EnvironmentOverrideRouteProps) => {
    const { url } = useRouteMatch()
    const location = useLocation()
    const LINK = `${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envOverride.environmentId}`
    const [collapsed, toggleCollapsed] = useState(location.pathname.includes(`${LINK}/`) ? false : true)

    useEffect(() => {
        if (!location.pathname.includes(`${LINK}/`) && !collapsed) {
            toggleCollapsed(true)
        }
    }, [location.pathname])

    const handleNavItemClick = () => {
        toggleCollapsed(!collapsed)
    }

    return (
        <div className="flex column left environment-route-wrapper top">
            <div
                className={`app-compose__nav-item flex cursor ${collapsed ? 'fw-4' : 'fw-6 no-hover'}`}
                onClick={handleNavItemClick}
            >
                {envOverride.environmentName}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                />
            </div>
            {!collapsed && (
                <div className="environment-routes">
                    <NavLink className="app-compose__nav-item cursor" to={`${LINK}/deployment-template`}>
                        Deployment template
                    </NavLink>
                    <NavLink className="app-compose__nav-item cursor" to={`${LINK}/configmap`}>
                        ConfigMaps
                    </NavLink>
                    <NavLink className="app-compose__nav-item cursor" to={`${LINK}/secrets`}>
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

const EnvironmentOverrides = ({ environmentResult, environmentsLoading }: EnvironmentOverridesProps) => {
    if (environmentsLoading) return null

    if (Array.isArray(environmentResult?.result)) {
        const environments = environmentResult.result.sort((a, b) => a.environmentName.localeCompare(b.environmentName))
        return (
            <div className="w-100" style={{ height: 'calc(100% - 60px)' }}>
                {environments.map((env) => {
                    return !env.deploymentAppDeleteRequest && <EnvOverrideRoute envOverride={env} key={env.environmentName} />
                })}
            </div>
        )
    } else {
        return (
            <InfoColourBar
                classname="question-bar no-env-overrides"
                message={<EnvOverridesHelpNote />}
                Icon={Help}
                iconClass="fcv-5"
                iconSize={16}
            />
        )
    }
}

function EnvironmentOverrideRouter() {
    const { pathname } = useLocation()
    const { appId } = useParams<{ appId: string }>()
    const previousPathName = usePrevious(pathname)
    const [environmentsLoading, environmentResult, error, reloadEnvironments] = useAsync(
        () => getAppOtherEnvironment(appId),
        [appId],
        !!appId,
    )
    useEffect(() => {
        if (previousPathName && previousPathName.includes('/cd-pipeline') && !pathname.includes('/cd-pipeline')) {
            reloadEnvironments()
        }
    }, [pathname])

    return (
        <div className="h-100">
            <div className="dc__border-bottom-n1 mt-8 mb-8" />
            <div className="app-compose__nav-item routes-container-header flex dc__uppercase no-hover">
                Environment Overrides
            </div>
            <div className="flex column left environment-routes-container top">
                <EnvironmentOverrides environmentsLoading={environmentsLoading} environmentResult={environmentResult} />
            </div>
        </div>
    )
}

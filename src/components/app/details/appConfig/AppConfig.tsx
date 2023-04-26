import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useLocation, useRouteMatch, useHistory, NavLink, Link, Route, Switch } from 'react-router-dom'

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
    usePrevious,
    useAsync,
    ConditionalWrap,
} from '../../../common'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    DeleteDialog,
    ConfirmationDialog,
    TippyCustomized,
    TippyTheme,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { getAppConfigStatus, getAppOtherEnvironmentMin, getWorkflowList } from '../../../../services/service'
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
    StageNames,
    STAGE_NAME,
} from './appConfig.type'
import { getUserRole } from '../../../userGroups/userGroup.service'
import ExternalLinks from '../../../externalLinks/ExternalLinks'
import { UserRoleType } from '../../../userGroups/userGroups.types'
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

function getCompletedStep(isUnlocked: AppStageUnlockedType, isJobView: boolean): number {
    if (isJobView) {
        if (isUnlocked.workflowEditor) {
            return 1
        }
    } else {
        if (isUnlocked.workflowEditor) {
            return 3
        } else if (isUnlocked.deploymentTemplate) {
            return 2
        } else if (isUnlocked.dockerBuildConfig) {
            return 1
        }
    }

    return 0
}

function getNavItems(isUnlocked: AppStageUnlockedType, appId: string, isJobView: boolean): { navItems } {
    const completedSteps = getCompletedStep(isUnlocked, isJobView)
    let navItems = []
    if (isJobView) {
        const completedPercent = completedSteps * 50

        navItems = [
            {
                title: 'Source code',
                href: `/job/${appId}/edit/materials`,
                stage: STAGE_NAME.GIT_MATERIAL,
                isLocked: !isUnlocked.material,
                supportDocumentURL: DOCUMENTATION.JOB_SOURCE_CODE,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
            },
            {
                title: 'Workflow Editor',
                href: `/job/${appId}/edit/workflow`,
                stage: 'WORKFLOW',
                isLocked: !isUnlocked.workflowEditor,
                supportDocumentURL: DOCUMENTATION.JOB_WORKFLOW_EDITOR,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
            },
        ]
    } else {
        const completedPercent = completedSteps * 25

        navItems = [
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
    }

    return { navItems }
}

export default function AppConfig({ appName, isJobView }: AppConfigProps) {
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
        Promise.all([getAppConfigStatus(+appId, isJobView), getWorkflowList(appId)])
            .then(([configStatusRes, workflowRes]) => {
                const { configs, lastConfiguredStage } = getUnlockedConfigsAndLastStage(configStatusRes.result)
                let { navItems } = getNavItems(configs, appId, isJobView)
                let index = navItems.findIndex((item) => item.isLocked)
                if (index < 0) {
                    index = isJobView ? 2 : 4
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
        return getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR, isJobView)
    }

    async function deleteAppHandler() {
        deleteApp(appId)
            .then((response) => {
                if (response.code === 200) {
                    if (isJobView) {
                        toast.success('Job Deleted!')
                        history.push(`${URLS.JOB}/${URLS.APP_LIST}`)
                    } else {
                        toast.success('Application Deleted!')
                        history.push(`${URLS.APP}/${URLS.APP_LIST}`)
                    }
                }
            })
            .catch((error) => {
                showError(error)
            })
    }

    const getUnlockedConfigsAndLastStage = (
        configStatus: any,
    ): {
        configs: AppStageUnlockedType
        lastConfiguredStage: StageNames
    } => {
        let _configs, _lastConfiguredStage
        if (!configStatus) {
            _configs = {} as AppStageUnlockedType
            _lastConfiguredStage = ''
        } else if (isJobView) {
            const materialStage = configStatus.find((_stage) => _stage.stageName === STAGE_NAME.GIT_MATERIAL)
            _configs = {
                material: true, // First step/stage will be unlocked by default.
                workflowEditor: materialStage?.status ?? false, // Unlocked when GIT_MATERIAL step is completed
            } as AppStageUnlockedType
            _lastConfiguredStage = materialStage?.status ? STAGE_NAME.GIT_MATERIAL : STAGE_NAME.APP
        } else {
            const lastConfiguredStage = configStatus
                .slice()
                .reverse()
                .find((stage) => stage.status)
            if (!lastConfiguredStage) {
                _configs = {} as AppStageUnlockedType
                _lastConfiguredStage = ''
            } else {
                _lastConfiguredStage = lastConfiguredStage.stageName
                _configs = isUnlocked(_lastConfiguredStage)
            }
            
        }

        return {
            configs: _configs,
            lastConfiguredStage: _lastConfiguredStage,
        }
    }

    function respondOnSuccess() {
        getAppConfigStatus(+appId, isJobView)
            .then((configStatusRes) => {
                const { configs, lastConfiguredStage } = getUnlockedConfigsAndLastStage(configStatusRes.result)
                let { navItems } = getNavItems(configs, appId, isJobView)
                let index = navItems.findIndex((item) => item.isLocked)
                if (index < 0) {
                    index = isJobView ? 2 : 4
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
                        <ConfirmationDialog.Body title={`Cannot Delete ${isJobView ? 'job' : 'application'}`} />
                        <p className="fs-13 cn-7 lh-1-54">
                            Delete all pipelines and workflows before deleting this {isJobView ? 'job' : 'application'}.
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
        const hideConfigHelp = isJobView ? state.isCiPipeline : state.isCDPipeline
        return (
            <>
                <div className={`app-compose ${getAdditionalParentClass()}`}>
                    <div
                        className={`app-compose__nav ${isJobView ? 'job-compose__side-nav' : ''} flex column left top ${
                            showCannotDeleteTooltip ? '' : 'dc__position-rel'
                        } dc__overflow-scroll ${hideConfigHelp ? 'hide-app-config-help' : ''} ${
                            _canShowExternalLinks ? '' : 'hide-external-links'
                        }`}
                    >
                        <Navigation
                            deleteApp={showDeleteConfirmation}
                            navItems={state.navItems}
                            canShowExternalLinks={_canShowExternalLinks}
                            showCannotDeleteTooltip={showCannotDeleteTooltip}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            getRepo={showRepoOnDelete}
                            isJobView={isJobView}
                            hideConfigHelp={hideConfigHelp}
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
                            isJobView={isJobView}
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
    const linkDataTestName = item.title.toLowerCase().split(' ').join('-')
    return (
        <NavLink
            data-testid={`${linkDataTestName}-link`}
            key={item.title}
            onClick={(event) => {
                if (item.isLocked) event.preventDefault()
            }}
            className="app-compose__nav-item cursor"
            to={item.href}
        >
            <span className="dc__ellipsis-right nav-text">{item.title}</span>
            {item.isLocked && (
                <Lock
                    className="app-compose__nav-icon icon-dim-20"
                    data-testid={`${item.isLocked ? linkDataTestName : 'appconfig'}-lockicon`}
                />
            )}
        </NavLink>
    )
}

function Navigation({
    navItems,
    deleteApp,
    canShowExternalLinks,
    showCannotDeleteTooltip,
    toggleRepoSelectionTippy,
    getRepo,
    isJobView,
    hideConfigHelp,
}: AppConfigNavigationProps) {
    const location = useLocation()
    const selectedNav = navItems.filter((navItem) => location.pathname.indexOf(navItem.href) >= 0)[0]

    return (
        <>
            {!hideConfigHelp && <AppConfigurationCheckBox selectedNav={selectedNav} isJobView={isJobView} />}
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
                } else if (
                    isJobView ||
                    item.stage !== 'ENV_OVERRIDE' ||
                    (item.stage === 'ENV_OVERRIDE' && item.isLocked)
                ) {
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
            {isJobView && <div className="h-100" />}
            <div className="cta-delete-app flex w-100 dc__position-sticky pt-2 pb-16 bcn-0">
                <button data-testid = "delete-job-app-button" type="button" className="flex cta delete mt-8 w-100 h-36" onClick={deleteApp}>
                    Delete {isJobView ? 'Job' : 'Application'}
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
    isJobView,
}: AppComposeRouterProps) {
    const { path } = useRouteMatch()

    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                {isJobView ? (
                    <Switch>
                        <Route path={`${path}/${URLS.APP_GIT_CONFIG}`}>
                            <>
                                <MaterialList
                                    respondOnSuccess={respondOnSuccess}
                                    isWorkflowEditorUnlocked={isUnlocked.workflowEditor}
                                    toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                                    setRepo={setRepoState}
                                    isJobView={isJobView}
                                />
                                <NextButton
                                    currentStageName={STAGE_NAME.GIT_MATERIAL}
                                    navItems={navItems}
                                    isDisabled={!isUnlocked.workflowEditor}
                                    isCiPipeline={isCiPipeline}
                                />
                            </>
                        </Route>
                        {isUnlocked.workflowEditor && (
                            <Route
                                path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                                render={(props) => (
                                    <WorkflowEdit
                                        configStatus={1}
                                        isCDPipeline={isCDPipeline}
                                        respondOnSuccess={respondOnSuccess}
                                        getWorkflows={getWorkflows}
                                        isJobView={isJobView}
                                    />
                                )}
                            />
                        )}
                    </Switch>
                ) : (
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
                        {isUnlocked.workflowEditor && [
                            <Route
                                key={`${path}/${URLS.APP_WORKFLOW_CONFIG}`}
                                path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                                render={(props) => (
                                    <WorkflowEdit
                                        configStatus={1}
                                        isCDPipeline={isCDPipeline}
                                        respondOnSuccess={respondOnSuccess}
                                        getWorkflows={getWorkflows}
                                    />
                                )}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_CM_CONFIG}`}
                                path={`${path}/${URLS.APP_CM_CONFIG}`}
                                render={(props) => <ConfigMap respondOnSuccess={respondOnSuccess} />}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_CS_CONFIG}`}
                                path={`${path}/${URLS.APP_CS_CONFIG}`}
                                render={(props) => <Secret respondOnSuccess={respondOnSuccess} />}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                                path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                                render={(props) => (
                                    <EnvironmentOverride
                                        environments={environments}
                                        setEnvironments={setEnvironments}
                                    />
                                )}
                            />,
                        ]}
                    </Switch>
                )}
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
                    <NavLink
                        data-testid="env-deployment-template"
                        className="app-compose__nav-item cursor"
                        to={`${LINK}/deployment-template`}
                    >
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
            <div className="w-100" style={{ height: 'calc(100% - 60px)' }} data-testid="env-override-list">
                {environments.map((env) => {
                    return (
                        !env.deploymentAppDeleteRequest && (
                            <EnvOverrideRoute envOverride={env} key={env.environmentName} />
                        )
                    )
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
        () => getAppOtherEnvironmentMin(appId),
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

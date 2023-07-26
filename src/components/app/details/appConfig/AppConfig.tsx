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
    createClusterEnvGroup,
    importComponentFromFELibrary,
    mapByKey
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
    PopupMenu,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    addJobEnvironment,
    deleteJobEnvironment,
    getAppConfigStatus,
    getAppOtherEnvironmentMin,
    getCIConfig,
    getEnvironmentListMinPublic,
    getJobOtherEnvironmentMin,
    getWorkflowList,
} from '../../../../services/service'
import { deleteApp } from './appConfig.service'
import { ReactComponent as Next } from '../../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Lock } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import { ReactComponent as Search } from '../../../../assets/icons/ic-search.svg'
import { ReactComponent as More } from '../../../../assets/icons/ic-more-option.svg'
import { ReactComponent as DeleteIcon } from '../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ProtectedIcon } from '../../../../assets/icons/ic-shield-protect-fill.svg'
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
    EnvironmentOverrideRouterProps,
} from './appConfig.type'
import { getUserRole } from '../../../userGroups/userGroup.service'
import ExternalLinks from '../../../externalLinks/ExternalLinks'
import { UserRoleType } from '../../../userGroups/userGroups.types'
import {DeleteComponentsName, GIT_MATERIAL_IN_USE_MESSAGE} from '../../../../config/constantMessaging'
import SecretList from '../../../ConfigMapSecret/Secret/SecretList'
import ConfigMapList from '../../../ConfigMapSecret/ConfigMap/ConfigMapList'
import ReactSelect, { components } from 'react-select'
import { groupHeading } from '../../../CIPipelineN/Constants'
import { Environment } from '../../../cdPipeline/cdPipeline.types'
import { RESOURCE_ACTION_MENU } from '../../../ResourceBrowser/Constants'
import { groupStyle } from '../../../secrets/secret.utils'


const MaterialList = lazy(() => import('../../../material/MaterialList'))
const CIConfig = lazy(() => import('../../../ciConfig/CIConfig'))
const DeploymentConfig = lazy(() => import('../../../deploymentConfig/DeploymentConfig'))
const WorkflowEdit = lazy(() => import('../../../workflowEditor/workflowEditor'))
const EnvironmentOverride = lazy(() => import('../../../EnvironmentOverride/EnvironmentOverride'))
const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')
const getConfigProtections = importComponentFromFELibrary('getConfigProtections', null, 'function')

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
            {
                title: 'ConfigMaps',
                href: `/job/${appId}/edit/configmap`,
                stage: 'CONFIGMAP',
                isLocked: !isUnlocked.configmap,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_CONFIG_MAP,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true
            },
            {
                title: 'Secrets',
                href: `/job/${appId}/edit/secrets`,
                stage: 'SECRETS',
                isLocked: !isUnlocked.secret,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true
            },
            {
                title: 'Environment Override',
                href: `/job/${appId}/edit/env-override`,
                stage: 'ENV_OVERRIDE',
                isLocked: !isUnlocked.envOverride,
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
                isProtectionAllowed: true
            },
            {
                title: 'Secrets',
                href: `/app/${appId}/edit/secrets`,
                stage: 'SECRETS',
                isLocked: !isUnlocked.secret,
                supportDocumentURL: DOCUMENTATION.APP_CREATE_SECRET,
                flowCompletionPercent: completedPercent,
                currentStep: completedSteps,
                isProtectionAllowed: true
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
                title: 'Protect Configuration',
                href: `/app/${appId}/edit/${URLS.APP_CONFIG_PROTECTION}`,
                stage: 'PROTECT_CONFIGURATION',
                isLocked: false,
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
        environmentList: [],
        isBaseConfigProtected: false
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
        Promise.all([
            getAppConfigStatus(+appId, isJobView),
            getWorkflowList(appId),
            getEnvironmentListMinPublic(),
            typeof getConfigProtections === 'function' ? getConfigProtections(Number(appId)) : { result: null },
        ])
            .then(([configStatusRes, workflowRes, envResult, configProtectionsResp]) => {
                const { configs, lastConfiguredStage } = getUnlockedConfigsAndLastStage(configStatusRes.result)
                let { navItems } = getNavItems(configs, appId, isJobView)
                let index = navItems.findIndex((item) => item.isLocked)
                if (index < 0) {
                    index = isJobView ? 2 : 4
                }
                let redirectUrl = navItems[index - 1].href
                let isCiPipeline = isCIPipelineCreated(configStatusRes.result)
                let isCDPipeline = isCDPipelineCreated(configStatusRes.result)
                const envProtectMap: Record<number, boolean> = {}
                if (configProtectionsResp.result) {
                    for (const config of configProtectionsResp.result) {
                        envProtectMap[config.envId] = config.state === 1
                    }
                }
                const updatedEnvs = envResult.result.map((env) => {
                    let envData = { ...env, isProtected: false }
                    if (envProtectMap[env.id]) {
                        envData.isProtected = true
                    }
                    return envData
                })
                const isBaseConfigProtectionEnabled = envProtectMap[-1] ?? false

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
                    environmentList: updatedEnvs,
                    isBaseConfigProtected: isBaseConfigProtectionEnabled
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
                configmap: materialStage?.status ?? false,
                secret: materialStage?.status ?? false,
                envOverride: true,
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
                        } ${
                            state.isUnlocked.workflowEditor && ConfigProtectionView ? 'config-protection__side-nav' : ''
                        }`}
                    >
                        <Navigation
                            deleteApp={showDeleteConfirmation}
                            navItems={state.navItems}
                            canShowExternalLinks={_canShowExternalLinks}
                            showCannotDeleteTooltip={showCannotDeleteTooltip}
                            isWorkflowEditorUnlocked={state.isUnlocked.workflowEditor}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            getRepo={showRepoOnDelete}
                            isJobView={isJobView}
                            hideConfigHelp={hideConfigHelp}
                            workflowsRes={state.workflowsRes}
                            getWorkflows={reloadWorkflows}
                            environmentList={state.environmentList}
                            isBaseConfigProtected={state.isBaseConfigProtected}
                        />
                    </div>
                    <div className="app-compose__main">
                        <AppComposeRouter
                            appId={appId}
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
                            envList={state.environmentList}
                            isBaseConfigProtected={state.isBaseConfigProtected}
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

function renderNavItem(item: CustomNavItemsType, isBaseConfigProtected?: boolean) {
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
                <Lock className="app-compose__nav-icon icon-dim-20" data-testid={`${linkDataTestName}-lockicon`} />
            )}
             {!item.isLocked && isBaseConfigProtected && item.isProtectionAllowed && (
                <ProtectedIcon />
            )}
        </NavLink>
    )
}

function Navigation({
    navItems,
    deleteApp,
    canShowExternalLinks,
    showCannotDeleteTooltip,
    isWorkflowEditorUnlocked,
    toggleRepoSelectionTippy,
    getRepo,
    isJobView,
    hideConfigHelp,
    workflowsRes,
    getWorkflows,
    environmentList,
    isBaseConfigProtected
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
                                <div className="dc__border-bottom-n1 mt-8 mb-8" />
                                {renderNavItem(item)}
                            </div>
                        )
                    )
                } else if (item.stage === 'PROTECT_CONFIGURATION') {
                    return (
                        isWorkflowEditorUnlocked &&
                        ConfigProtectionView && (
                            <div key={item.stage}>
                                {!canShowExternalLinks && <div className="dc__border-bottom-n1 mt-8 mb-8" />}
                                {renderNavItem(item)}
                            </div>
                        )
                    )
                } else if (
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
                                    infoTextHeading={`${DeleteComponentsName.GitRepo} '${getRepo}' is in use`}
                                    infoText={GIT_MATERIAL_IN_USE_MESSAGE}
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
                            {renderNavItem(item, isBaseConfigProtected)}
                        </ConditionalWrap>
                    )
                } else {
                    return (
                        <EnvironmentOverrideRouter
                            key={item.title}
                            isJobView={isJobView}
                            workflowsRes={workflowsRes}
                            getWorkflows={getWorkflows}
                            allEnvs={environmentList}
                        />
                    )
                }
            })}

            {isJobView && <div className="h-100" />}
            <div className="cta-delete-app flex w-100 dc__position-sticky pt-2 pb-16 bcn-0">
                <button
                    data-testid="delete-job-app-button"
                    type="button"
                    className="flex cta delete mt-8 w-100 h-36"
                    onClick={deleteApp}
                >
                    Delete {isJobView ? 'Job' : 'Application'}
                </button>
            </div>
        </>
    )
}

function AppComposeRouter({
    appId,
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
    envList,
    isBaseConfigProtected
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
                        {isUnlocked.workflowEditor && [
                            <Route
                                key={`${path}/${URLS.APP_WORKFLOW_CONFIG}`}
                                path={`${path}/${URLS.APP_WORKFLOW_CONFIG}/:workflowId(\\d+)?`}
                                render={() => (
                                    <WorkflowEdit
                                        configStatus={1}
                                        isCDPipeline={isCDPipeline}
                                        respondOnSuccess={respondOnSuccess}
                                        getWorkflows={getWorkflows}
                                        isJobView={isJobView}
                                        envList={envList}
                                    />
                                )}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_CM_CONFIG}`}
                                path={`${path}/${URLS.APP_CM_CONFIG}`}
                                render={(props) => <ConfigMapList isJobView={isJobView} isProtected={isBaseConfigProtected}/>}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_CS_CONFIG}`}
                                path={`${path}/${URLS.APP_CS_CONFIG}`}
                                render={(props) => <SecretList isJobView={isJobView} isProtected={isBaseConfigProtected}/>}
                            />,
                            <Route
                                key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                                path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                                render={(props) => (
                                    <EnvironmentOverride
                                        environments={environments}
                                        setEnvironments={setEnvironments}
                                        isJobView={isJobView}
                                    />
                                )}
                            />,
                        ]}
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
                                    isProtected={isBaseConfigProtected}
                                />
                            </Route>
                        )}
                        {canShowExternalLinks && (
                            <Route path={`${path}/${URLS.APP_EXTERNAL_LINKS}`}>
                                <ExternalLinks isAppConfigView={true} userRole={userRole} />
                            </Route>
                        )}
                        {isUnlocked.workflowEditor && ConfigProtectionView && (
                            <Route path={`${path}/${URLS.APP_CONFIG_PROTECTION}`}>
                                <ConfigProtectionView appId={Number(appId)} />
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
                            <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}`}>
                                <ConfigMapList isProtected={isBaseConfigProtected}/>
                            </Route>,
                            <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}`}>
                                <SecretList isProtected={isBaseConfigProtected}/>
                            </Route>,
                            <Route
                                key={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}`}
                                path={`${path}/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?`}
                                render={(props) => (
                                    <EnvironmentOverride
                                        environments={environments}
                                        setEnvironments={setEnvironments}
                                        envList={envList}
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

const EnvOverrideRoute = ({ envOverride, isJobView, ciPipelines, reload, appId, workflowsRes, isEnvProtected }: EnvironmentOverrideRouteProps) => {
    const { url } = useRouteMatch()
    const location = useLocation()
    const LINK = `${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envOverride.environmentId}`
    const [collapsed, toggleCollapsed] = useState(location.pathname.includes(`${LINK}/`) ? false : true)
    const [showConfirmationDialog, setConfirmationDialog] = useState(false)
    const [showDelete, setDeleteView] = useState(false)
    const [deletePipeline,setDeletePipeline] = useState()

    useEffect(() => {
        if (!location.pathname.includes(`${LINK}/`) && !collapsed) {
            toggleCollapsed(true)
        }
    }, [location.pathname])

    const handleNavItemClick = () => {
        toggleCollapsed(!collapsed)
    }

    const handleDeleteConfirmation = () => {
        setDeleteView(false)
        deleteEnvHandler()
    }

    const handleCancelDelete = () => {
        setDeleteView(false)
        setDeletePipeline(null)
    }

    const deleteEnvHandler = () => {
        let requestBody = {envId: envOverride.environmentId, appId: appId}
        deleteJobEnvironment(requestBody)
            .then((response) => {
                toast.success("Deleted Successfully");
                reload()
                setDeleteView(false);
            })
            .catch((error) => {
                showError(error)
            })
    }

    const handleViewPipeline = () =>{
        setDeleteView(false)
    }

    const renderDeleteDialog = (): JSX.Element => {
        return (<DeleteDialog
            title={`Delete configurations for environment '${envOverride.environmentName}'?`}
            delete={deleteEnvHandler}
            closeDelete={handleCancelDelete}
        >
            <DeleteDialog.Description>
                <p className="fs-13 cn-7 lh-1-54">
                    Are you sure you want to delete configurations for this environment?
                </p>
            </DeleteDialog.Description>
        </DeleteDialog>)
    }

    const renderConfirmationDeleteModal = (pipeline: any, path: string): JSX.Element => {
        return (
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <ConfirmationDialog.Body title={`Configurations for environment ‘${envOverride.environmentName}‘ is in use`} />
                <p className="fs-13 cn-7 lh-1-54">
                    {`Pipeline ‘${pipeline.name}‘ is using configurations for environment ‘${envOverride.environmentName}’.`}
                    <Link to={path} onClick={handleViewPipeline} className="ml-2">View pipeline</Link>
                </p>
                <p className="fs-13 cn-7 lh-1-54">
                    Base configmaps & secrets will be used if environment configurations are deleted.
                </p>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        type="button"
                        className="cta cancel"
                        onClick={handleCancelDelete}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteConfirmation}
                        className="cta delete cta-cd-delete-modal ml-16"
                    >
                        Delete Anyway
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const showDeleteDialog = (pipeline: any): JSX.Element => {

        const workFlows = workflowsRes?.workflows
        let workFlow
        if(pipeline) {
            workFlows?.forEach((workflow) => {
                workflow.tree.forEach((ciPipeline) => {
                    if(!workFlow){
                        workFlow = pipeline.id === ciPipeline.componentId  && ciPipeline
                    }
                })
            })
        }
        const path = pipeline ? `${url}/${URLS.APP_WORKFLOW_CONFIG}/${workFlow?.id}/ci-pipeline/${pipeline?.id}/pre-build` : ""
        return (!showConfirmationDialog ? renderDeleteDialog() : renderConfirmationDeleteModal(pipeline, path))
    }

    const deletePopUpMenu = (): JSX.Element => {
        return (
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto" isKebab={true}>
                    <More className="icon-dim-16 fcn-6" data-testid="popup-env-delete-button" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border pt-4 pb-4 w-100px">
                    <div className="fs-13 fw-4 lh-20">

                        <span
                            className="flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleDeleteDialog}
                            data-testid="delete-jobs-environment-link"
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {RESOURCE_ACTION_MENU.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
        )
    }

    const toggleDeleteDialog = (e)  => {
        e.stopPropagation()
        setDeleteView(true)
        const pipeline = ciPipelines?.find((env) => env.environmentId === envOverride.environmentId)
        if(pipeline){
            setConfirmationDialog(true)
            setDeletePipeline(pipeline)
        }
    }

    return (
        <div className="flex column left environment-route-wrapper top">
            <div
                className={`app-compose__nav-item flex cursor ${collapsed ? 'fw-4' : 'fw-6 no-hover'}`}
                onClick={handleNavItemClick}
            >
                <div className="flex left">
                    <Dropdown className={`icon-dim-18 rotate mr-8 ${collapsed ? 'dc__flip-90' : ''}`} />
                    {envOverride.environmentName}
                </div>
                <div className="flex">
                    {isEnvProtected && <ProtectedIcon className="icon-dim-20" />}
                    {/* {!isJobView && <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                />} */}
                    {isJobView && deletePopUpMenu()}
                    {isJobView && showDelete && showDeleteDialog(deletePipeline)}
                </div>
            </div>

            {!collapsed && (
                <div className="environment-routes">
                    {!isJobView && <NavLink
                        data-testid="env-deployment-template"
                        className="app-compose__nav-item cursor"
                        to={`${LINK}/deployment-template`}
                    >
                        Deployment template
                    </NavLink>
                    }
                    <NavLink className={`app-compose__nav-item cursor ${isJobView ? "ml-16 w-auto-imp" : "" }`} to={`${LINK}/configmap`}>
                        ConfigMaps
                    </NavLink>
                    <NavLink className={`app-compose__nav-item cursor ${isJobView ? "ml-16 w-auto-imp" : "" }`} to={`${LINK}/secrets`}>
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

const EnvironmentOverrides = ({ environmentResult, environmentsLoading, environmentList, isJobView, ciPipelines, reload, appId, workflowsRes }: EnvironmentOverridesProps) => {
    if (environmentsLoading) return null
    if (Array.isArray(environmentResult?.result)) {
        const environmentsMap = mapByKey(environmentList || [], 'id')
        const environments = environmentResult.result.sort((a, b) => a.environmentName.localeCompare(b.environmentName))
        return (
            <div className="w-100" style={{ height: 'calc(100% - 60px)' }} data-testid="env-override-list">
                {environments.map((env, index) => {
                    return (
                        !env.deploymentAppDeleteRequest && (
                            <EnvOverrideRoute
                                envOverride={env}
                                key={env.environmentName}
                                isJobView={isJobView}
                                ciPipelines={ciPipelines}
                                reload={reload}
                                appId={appId}
                                workflowsRes={workflowsRes}
                                isEnvProtected={environmentsMap.get(env.environmentId)?.isProtected}
                            />
                        )
                    )
                })}
            </div>
        )
    } else {
        return (!isJobView ?
            <InfoColourBar
                classname="question-bar no-env-overrides"
                message={<EnvOverridesHelpNote />}
                Icon={Help}
                iconClass="fcv-5"
                iconSize={16}
            />
            : <></>)
    }
}

function EnvironmentOverrideRouter({isJobView, workflowsRes, getWorkflows,
  allEnvs} : EnvironmentOverrideRouterProps) {
    const { pathname } = useLocation()
    const { appId } = useParams<{ appId: string }>()
    const previousPathName = usePrevious(pathname)
    const [environmentList, setEnvironmentList] = useState([])
    const [environmentsLoading, environmentResult, error, reloadEnvironments] = useAsync(
        () => !isJobView ? getAppOtherEnvironmentMin(appId) : getJobOtherEnvironment(appId),
        [appId],
        !!appId,
    )
    const [addEnvironment, setEnvironmentView] = useState(true)
    const [ciPipelines, setCIPipelines] = useState([])

    const getJobOtherEnvironment = (appId) => {
        let list = []
        allEnvs?.forEach((env) => {
            if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                list.push({ id: env.id, clusterName: env.cluster_name, name: env.environment_name })
            }
        })
        setEnvironmentList(list)
        getCIConfig(Number(appId))
            .then((response) => {
                setCIPipelines(response.result?.ciPipelines)
            })
            .catch((error) => {
                showError(error)
            })
        return getJobOtherEnvironmentMin(appId)
    }

    const selectEnvironment = (selection) => {
        let requestBody = {envId: selection.id, appId: appId}
        addJobEnvironment(requestBody)
            .then((response) => {
                toast.success("Saved Successfully");
                reloadEnvironments()
                setEnvironmentView(!addEnvironment);
            })
            .catch((error) => {
                showError(error)
            })
    }

    const envList = createClusterEnvGroup(environmentList, 'clusterName')

    const handleAddEnvironment = () => {
        setEnvironmentView(!addEnvironment)
    }

    const ValueContainer = (props): JSX.Element => {
        return (
            <components.ValueContainer {...props}>
                {!props.selectProps.inputValue ? (
                    <>
                        <Search className="dc__position-abs icon-dim-18 ml-8 mw-18" />
                        <span className="dc__position-abs dc__left-35 cn-5 ml-2">
                            {props.selectProps.placeholder}
                        </span>
                    </>
                ) : (
                    <Search className="dc__position-abs icon-dim-18 ml-8 mw-18" />
                )}
                <span className="dc__position-abs dc__left-30 cn-5 ml-2">{React.cloneElement(props.children[1])}</span>
            </components.ValueContainer>
        )
    }

    let selectedEnv : Environment = environmentList.find((env) => env.id === -1)

    useEffect(() => {
        if (previousPathName && ( (previousPathName.includes('/cd-pipeline') && !pathname.includes('/cd-pipeline')) || (isJobView && previousPathName.includes('/pre-build') && !pathname.includes('/pre-build')) || (isJobView && previousPathName.includes('/build') && !pathname.includes('/build')))) {
            reloadEnvironments()
            getWorkflows()
        }
    }, [pathname])

    return (
        <div className="h-100">
            <div className="dc__border-bottom-n1 mt-8 mb-8" />
            <div className="app-compose__nav-item routes-container-header flex dc__uppercase no-hover">
                Environment Overrides
            </div>
            {isJobView && (
                <div className="flex dc__content-start dc__align-start cursor">
                    <div className="flex dc__align-center pt-8 pb-8 pl-8">
                        {addEnvironment ? (
                            <div className="flex dc__align-center" onClick={handleAddEnvironment}>
                                <Add className="icon-dim-18 fcb-5 mr-8" />
                                <div className="fw-6 fs-13 cb-5">Add Environment</div>
                            </div>
                        ) : (
                            <>
                                <ReactSelect
                                    autoFocus
                                    menuIsOpen
                                    isSearchable
                                    menuPlacement="auto"
                                    closeMenuOnScroll={true}
                                    placeholder="Select Environment"
                                    classNamePrefix="job-pipeline-environment-dropdown"
                                    options={envList}
                                    value={selectedEnv}
                                    getOptionLabel={(option) => `${option.name}`}
                                    getOptionValue={(option) => `${option.id}`}
                                    isMulti={false}
                                    onChange={selectEnvironment}
                                    onBlur={handleAddEnvironment}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator: null,
                                        GroupHeading: groupHeading,
                                        ValueContainer: ValueContainer,
                                    }}
                                    styles={{
                                        ...groupStyle(),
                                        control: (base) => ({
                                            ...base,
                                            border: '1px solid #d6dbdf',
                                            minHeight: '20px',
                                            height: '30px',
                                            marginTop: '4px',
                                            width: '220px',
                                        }),
                                        container: (base) => ({
                                            ...base,
                                            paddingRight: '0px',
                                        }),
                                        valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="flex column left environment-routes-container top">
                <EnvironmentOverrides
                    environmentsLoading={environmentsLoading}
                    environmentResult={environmentResult}
                    environmentList={allEnvs}
                    isJobView={isJobView}
                    ciPipelines={ciPipelines}
                    reload={reloadEnvironments}
                    appId={appId}
                    workflowsRes={workflowsRes}
                />
            </div>
        </div>
    )
}

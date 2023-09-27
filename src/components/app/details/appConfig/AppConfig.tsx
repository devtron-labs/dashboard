import React, { useState, useEffect, lazy } from 'react'
import { useParams, useLocation, useRouteMatch, useHistory, NavLink, Link } from 'react-router-dom'

import {
    URLS,
    getAppComposeURL,
    APP_COMPOSE_STAGE,
    isCIPipelineCreated,
    ViewType,
    isCDPipelineCreated,
} from '../../../../config'
import { ConditionalWrap, importComponentFromFELibrary } from '../../../common'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    DeleteDialog,
    ConfirmationDialog,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import { getAppConfigStatus, getAppOtherEnvironmentMin, getWorkflowList } from '../../../../services/service'
import { deleteApp } from './appConfig.service'
import { ReactComponent as Lock } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as ProtectedIcon } from '../../../../assets/icons/ic-shield-protect-fill.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import DockerFileInUse from '../../../../assets/img/ic-dockerfile-in-use.png'
import { toast } from 'react-toastify'
import './appConfig.scss'
import AppConfigurationCheckBox from './AppConfigurationCheckBox'
import {
    AppConfigNavigationProps,
    AppConfigProps,
    AppConfigState,
    AppStageUnlockedType,
    CustomNavItemsType,
    StageNames,
    STAGE_NAME,
} from './appConfig.type'
import { getUserRole } from '../../../userGroups/userGroup.service'
import { UserRoleType } from '../../../userGroups/userGroups.types'
import { DeleteComponentsName, GIT_MATERIAL_IN_USE_MESSAGE } from '../../../../config/constantMessaging'
import { getNavItems, isUnlocked } from './AppConfig.utils'
import AppComposeRouter from './AppComposeRouter'
import EnvironmentOverrideRouter from './EnvironmentOverrideRouter'

const ConfigProtectionView = importComponentFromFELibrary('ConfigProtectionView')
const getConfigProtections = importComponentFromFELibrary('getConfigProtections', null, 'function')

export default function AppConfig({ appName, isJobView, filteredEnvIds }: AppConfigProps) {
    const { appId } = useParams<{ appId: string }>()
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [userRole, setUserRole] = useState<UserRoleType>()
    const [showCannotDeleteTooltip, setShowCannotDeleteTooltip] = useState(false)
    const [showRepoOnDelete, setShowRepoOnDelete] = useState('')

    const [state, setState] = useState<AppConfigState>({
        view: ViewType.LOADING,
        statusCode: 0,
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
        isBaseConfigProtected: false,
        configProtectionData: [],
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
            getWorkflowList(appId, filteredEnvIds),
            getAppOtherEnvironmentMin(appId),
            typeof getConfigProtections === 'function' && !isJobView
                ? getConfigProtections(Number(appId))
                : { result: null },
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
                const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
                const updatedEnvs =
                    envResult.result
                        ?.filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                        .map((env) => {
                            let envData = { ...env, isProtected: false }
                            if (envProtectMap[env.environmentId]) {
                                envData.isProtected = true
                            }
                            return envData
                        })
                        ?.sort((envA, envB) => envA.environmentName.localeCompare(envB.environmentName)) || []
                const isBaseConfigProtectionEnabled = envProtectMap[-1] ?? false

                setState({
                    view: ViewType.FORM,
                    statusCode: 200,
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
                    isBaseConfigProtected: isBaseConfigProtectionEnabled,
                    configProtectionData: configProtectionsResp?.result ?? [],
                })
                if (location.pathname === match.url) {
                    history.replace(redirectUrl)
                }
            })
            .catch((errors) => {
                showError(errors)
                setState({ ...state, view: ViewType.ERROR, statusCode: errors.code })
            })
    }, [filteredEnvIds])

    function reloadWorkflows() {
        getWorkflowList(appId).then((response) => {
            setState((prevState) => {
                return {
                    ...prevState,
                    canDeleteApp: response.result.workflows.length === 0,
                    workflowsRes: response.result,
                }
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

    function reloadEnvironments() {
        Promise.all([
            getAppOtherEnvironmentMin(appId),
            typeof getConfigProtections === 'function' && !isJobView
                ? getConfigProtections(Number(appId))
                : { result: null },
        ])
            .then(([envResult, configProtectionsResp]) => {
                const envProtectMap: Record<number, boolean> = {}
                if (configProtectionsResp.result) {
                    for (const config of configProtectionsResp.result) {
                        envProtectMap[config.envId] = config.state === 1
                    }
                }
                const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
                const updatedEnvs =
                    envResult.result
                        ?.filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                        .map((env) => {
                            let envData = { ...env, isProtected: false }
                            if (envProtectMap[env.environmentId]) {
                                envData.isProtected = true
                            }
                            return envData
                        })
                        ?.sort((envA, envB) => envA.environmentName.localeCompare(envB.environmentName)) || []
                const isBaseConfigProtectionEnabled = envProtectMap[-1] ?? false
                setState((prevState) => {
                    return {
                        ...prevState,
                        environmentList: updatedEnvs,
                        isBaseConfigProtected: isBaseConfigProtectionEnabled,
                        configProtectionData: configProtectionsResp.result ?? [],
                    }
                })
            })
            .catch((errors) => {
                showError(errors)
                setState({ ...state, view: ViewType.ERROR, statusCode: errors.code })
            })
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
        return <ErrorScreenManager code={state.statusCode} />
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
                            state.isUnlocked.workflowEditor && ConfigProtectionView && !isJobView
                                ? 'config-protection__side-nav'
                                : ''
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
                            reloadEnvironments={reloadEnvironments}
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
                            environments={state.environmentList}
                            workflowsRes={state.workflowsRes}
                            userRole={userRole}
                            canShowExternalLinks={_canShowExternalLinks}
                            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
                            setRepoState={setShowRepoOnDelete}
                            isJobView={isJobView}
                            isBaseConfigProtected={state.isBaseConfigProtected}
                            reloadEnvironments={reloadEnvironments}
                            configProtectionData={state.configProtectionData}
                            filteredEnvIds={filteredEnvIds}
                        />
                    </div>
                </div>
                {renderDeleteDialog()}
            </>
        )
    }
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
                <ProtectedIcon className="icon-dim-20 fcv-5" />
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
    isBaseConfigProtected,
    reloadEnvironments,
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
                            isJobView={isJobView}
                            workflowsRes={workflowsRes}
                            getWorkflows={getWorkflows}
                            allEnvs={environmentList}
                            reloadEnvironments={reloadEnvironments}
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

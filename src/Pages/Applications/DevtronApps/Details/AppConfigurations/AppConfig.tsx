/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect } from 'react'
import { useParams, useLocation, useRouteMatch, useHistory } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    useAsync,
    ResourceKindType,
    ToastManager,
    ToastVariantType,
    ResourceIdToResourceApprovalPolicyConfigMapType,
    ConfirmationModal,
    ConfirmationModalVariantType,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'
import { URLS, getAppComposeURL, APP_COMPOSE_STAGE, ViewType } from '../../../../../config'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { getAppOtherEnvironmentMin, getJobOtherEnvironmentMin, getWorkflowList } from '../../../../../services/service'
import './appConfig.scss'
import {
    AppConfigProps,
    AppConfigState,
    AppStageUnlockedType,
    STAGE_NAME,
    DEFAULT_LANDING_STAGE,
    EnvConfigType,
} from './AppConfig.types'
import { getUserRole } from '../../../../GlobalConfigurations/Authorization/authorization.service'
import { isCIPipelineCreated, isCDPipelineCreated, getNavItems, isUnlocked } from './AppConfig.utils'
import AppComposeRouter from './MainContent/AppComposeRouter'
import { UserRoleType } from '../../../../GlobalConfigurations/Authorization/constants'
import { AppNavigation } from './Navigation/AppNavigation'
import { AppConfigStatusItemType } from '../../service.types'
import { getAppConfigStatus, getEnvConfig } from '../../service'
import { deleteApp } from './AppConfig.service'
import { AppConfigurationProvider } from './AppConfiguration.provider'
import { ENV_CONFIG_PATH_REG } from './AppConfig.constants'

const getApprovalPolicyConfigForApp: (appId: number) => Promise<ResourceIdToResourceApprovalPolicyConfigMapType> =
    importComponentFromFELibrary('getApprovalPolicyConfigForApp', null, 'function')
const isFELibAvailable: boolean = importComponentFromFELibrary('isFELibAvailable', null, 'function')

export const AppConfig = ({ appName, resourceKind, filteredEnvIds }: AppConfigProps) => {
    // HOOKS
    const { appId } = useParams<{ appId: string }>()
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()

    // STATES
    const [showCannotDeleteTooltip, setShowCannotDeleteTooltip] = useState(false)
    const [reload, setReload] = useState(false)
    const [isAppDeleting, setIsAppDeleting] = useState(false)
    const [state, setState] = useState<AppConfigState>({
        view: ViewType.LOADING,
        stageName: STAGE_NAME.LOADING,
        statusCode: 0,
        isUnlocked: isUnlocked(STAGE_NAME.LOADING),
        appName: '',
        isCiPipeline: false,
        isCDPipeline: false,
        showDeleteConfirm: false,
        navItems: [],
        redirectionUrl: '',
        canDeleteApp: false,
        workflowsRes: null,
        environmentList: [],
        envIdToEnvApprovalConfigurationMap: {} as ResourceIdToResourceApprovalPolicyConfigMapType,
        envConfig: {
            isLoading: true,
            config: null,
        },
    })

    // GLOBAL CONSTANTS
    const isJob = resourceKind === ResourceKindType.job

    /**
     * Fetches environment configurations and protections for a given application.
     *
     * @returns A promise that resolves to an object containing updated environments,
     * a flag indicating if base configuration protection is enabled, and an array of configuration protections.
     *
     * The function performs the following steps:
     * 1. Calls `getAppOtherEnvironmentMin` or `getJobOtherEnvironmentMin` (if resource kind is `job` (isJob)) with the application ID (`appId`) to fetch the environment configurations.
     * 2. Calls `getApprovalPolicyConfigForApp` with the application ID (`appId`) if the function is defined and resource kind is `job` (isJob), to fetch configuration protections.
     * 3. Creates a map (`envProtectMap`) to store protection states for each environment based on the configuration protections response.
     * 4. Filters the environment configurations based on `filteredEnvIds`, if provided, and marks them as protected if they are found in the protection map.
     * 5. Sorts the filtered and updated environments by their names.
     * 6. Determines if base configuration protection is enabled by checking the protection map for the key `-1`.
     *
     * The promise resolves to an object with the following properties:
     * - `updatedEnvs`: An array of updated environment configurations, each marked with a protection status.
     * - `configProtections`: An array of configuration protection objects.
     */
    const fetchEnvironments = (): Promise<{
        updatedEnvs: AppConfigState['environmentList']
        envIdToEnvApprovalConfigurationMap: ResourceIdToResourceApprovalPolicyConfigMapType
    }> =>
        Promise.all([
            isJob ? getJobOtherEnvironmentMin(appId) : getAppOtherEnvironmentMin(appId),
            typeof getApprovalPolicyConfigForApp === 'function' && !isJob
                ? getApprovalPolicyConfigForApp(Number(appId))
                : null,
        ]).then(([envResult, envIdToEnvApprovalConfigurationMap]) => {
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())

            const updatedEnvs: AppConfigState['environmentList'] =
                envResult.result
                    ?.filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    ?.sort((envA, envB) => envA.environmentName.localeCompare(envB.environmentName)) || []

            return {
                updatedEnvs,
                envIdToEnvApprovalConfigurationMap,
            }
        })

    /**
     * Fetches environment configuration for a given environment ID.
     *
     * This function updates the component state to indicate that the environment configuration is loading,
     * retrieves the configuration from the server, and updates the state with the retrieved configuration data.
     * In case of an error, it shows an error message and ensures the loading state is reset.
     *
     * @param envId - The ID of the environment for which the configuration is to be fetched.
     */
    const fetchEnvConfig = (envId: number, callback: (res: EnvConfigType) => void = noop) => {
        // Set loading state to true
        setState((prevState) => ({ ...prevState, envConfig: { ...prevState.envConfig, isLoading: true } }))

        // Fetch environment configuration
        getEnvConfig(+appId, envId, callback)
            .then((res) => {
                setState((prevState) => ({
                    ...prevState,
                    envConfig: {
                        isLoading: false,
                        config: res,
                    },
                }))
            })
            .catch(() => {
                // Error Handled in service
            })
            .finally(() => {
                setState((prevState) => ({ ...prevState, envConfig: { ...prevState.envConfig, isLoading: false } }))
            })
    }

    // ASYNC CALLS
    const [, userRoleRes, userRoleErr] = useAsync(() => getUserRole(appName), [appName])
    const [, appConfigData, appConfigError] = useAsync(
        () => Promise.all([getAppConfigStatus(+appId, resourceKind), getWorkflowList(appId), fetchEnvironments()]),
        [appId, filteredEnvIds, reload, resourceKind],
    )

    // CONSTANTS
    const userRole = userRoleRes?.result.role
    const canShowExternalLinks =
        userRole === UserRoleType.SuperAdmin || userRole === UserRoleType.Admin || userRole === UserRoleType.Manager
    const hideConfigHelp = isJob ? state.isCiPipeline : state.isCDPipeline
    const isGitOpsConfigurationRequired = state.navItems.find(
        ({ stage }) => stage === STAGE_NAME.GITOPS_CONFIG,
    )?.required

    useEffect(() => {
        // Error Handling for Async Calls.
        if (userRoleErr) {
            showError(userRoleErr)
        }
        if (appConfigError) {
            showError(appConfigError)
            setState({ ...state, view: ViewType.ERROR, statusCode: appConfigError.code })
        }
    }, [userRoleErr, appConfigError])

    // DATA TRANSFORMERS
    const getUnlockedConfigsAndLastStage = (
        configStatus: AppConfigStatusItemType[],
        _isGitOpsConfigurationRequired: boolean,
    ): {
        configs: AppStageUnlockedType
        lastConfiguredStage: STAGE_NAME
    } => {
        let _configs: AppStageUnlockedType = {
            material: false,
            dockerBuildConfig: false,
            deploymentTemplate: false,
            workflowEditor: false,
            configmap: false,
            secret: false,
            envOverride: false,
            gitOpsConfig: false,
        }
        let _lastConfiguredStage: STAGE_NAME = STAGE_NAME.LOADING

        if (isJob) {
            const materialStage = configStatus.find((_stage) => _stage.stageName === STAGE_NAME.GIT_MATERIAL)

            _configs = {
                ..._configs,
                material: true, // First step/stage will be unlocked by default.
                workflowEditor: materialStage?.status ?? false, // Unlocked when GIT_MATERIAL step is completed
                configmap: materialStage?.status ?? false,
                secret: materialStage?.status ?? false,
                envOverride: true,
            }
            _lastConfiguredStage = materialStage?.status ? STAGE_NAME.GIT_MATERIAL : STAGE_NAME.APP
        } else {
            const lastConfiguredStage = configStatus
                .slice()
                .reverse()
                .find((stage) => stage.status && stage.required)

            if (!lastConfiguredStage) {
                _configs = {
                    material: false,
                    dockerBuildConfig: false,
                    deploymentTemplate: false,
                    workflowEditor: false,
                    configmap: false,
                    secret: false,
                    envOverride: false,
                    gitOpsConfig: false,
                }
                _lastConfiguredStage = STAGE_NAME.LOADING
            } else {
                _lastConfiguredStage = lastConfiguredStage.stageName
                _configs = isUnlocked(_lastConfiguredStage, _isGitOpsConfigurationRequired)
            }
        }

        return {
            configs: _configs,
            lastConfiguredStage: _lastConfiguredStage,
        }
    }

    const processConfigStatusData = (
        configStatusRes: AppConfigStatusItemType[],
        envIdToEnvApprovalConfigurationMap: AppConfigState['envIdToEnvApprovalConfigurationMap'],
    ) => {
        const _isGitOpsConfigurationRequired = configStatusRes.find(
            ({ stageName }) => stageName === STAGE_NAME.GITOPS_CONFIG,
        )?.required
        const { configs, lastConfiguredStage } = getUnlockedConfigsAndLastStage(
            configStatusRes,
            _isGitOpsConfigurationRequired,
        )
        const { navItems } = getNavItems({
            _isUnlocked: configs,
            appId,
            resourceKind,
            isGitOpsConfigurationRequired: _isGitOpsConfigurationRequired,
            envIdToEnvApprovalConfigurationMap,
        })
        // Finding index of navItem which is locked and is not of alternate nav menu (nav-item rendering on different path)
        let index = navItems.findIndex((item) => !item.altNavKey && item.isLocked)
        if (index < 0) {
            index = isJob ? DEFAULT_LANDING_STAGE.JOB_VIEW : DEFAULT_LANDING_STAGE.DEVTRON_APPS
        }
        const redirectUrl = navItems[index - 1].href
        const isCiPipeline = configStatusRes ? isCIPipelineCreated(configStatusRes) : false
        const isCDPipeline = configStatusRes ? isCDPipelineCreated(configStatusRes) : false
        return { navItems, redirectUrl, isCiPipeline, isCDPipeline, configs, lastConfiguredStage }
    }

    useEffect(() => {
        if (appConfigData) {
            // SET APP CONFIG DATA IN STATE
            const [configStatusRes, workflowRes, { updatedEnvs, envIdToEnvApprovalConfigurationMap }] = appConfigData
            const { navItems, isCDPipeline, isCiPipeline, configs, redirectUrl, lastConfiguredStage } =
                processConfigStatusData(configStatusRes.result, envIdToEnvApprovalConfigurationMap)

            setState({
                ...state,
                view: ViewType.FORM,
                statusCode: 200,
                stageName: lastConfiguredStage,
                showDeleteConfirm: false,
                appName: workflowRes.result.appName,
                isUnlocked: configs,
                isCiPipeline,
                isCDPipeline,
                navItems,
                redirectionUrl: redirectUrl,
                canDeleteApp: workflowRes.result.workflows.length === 0,
                workflowsRes: workflowRes.result,
                environmentList: updatedEnvs,
                envIdToEnvApprovalConfigurationMap,
            })
            if (location.pathname === match.url) {
                history.replace(redirectUrl)
            }
        }
    }, [appConfigData])

    // METHODS
    const reloadAppConfig = () => {
        history.push(`/app/${appId}/edit`)
        setState((prevState) => ({ ...prevState, view: ViewType.LOADING }))
        setReload(!reload)
    }

    const reloadWorkflows = async () => {
        const response = await getWorkflowList(appId)
        setState((prevState) => ({
            ...prevState,
            canDeleteApp: response.result.workflows.length === 0,
            workflowsRes: response.result,
        }))
    }

    const deleteAppHandler = async () => {
        try {
            setIsAppDeleting(true)
            const response = await deleteApp(appId)
            if (response) {
                setIsAppDeleting(false)
                if (isJob) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Job Deleted!',
                    })
                    history.push(`${URLS.JOB}/${URLS.APP_LIST}`)
                } else {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Application Deleted!',
                    })
                    history.push(`${URLS.APP}/${URLS.APP_LIST}`)
                }
            }
        } catch (error) {
            setIsAppDeleting(false)
            showError(error)
        }
    }

    const respondOnSuccess = (redirection: boolean = false) => {
        getAppConfigStatus(+appId, resourceKind)
            .then((configStatusRes) => {
                const { navItems, isCDPipeline, isCiPipeline, configs, redirectUrl } = processConfigStatusData(
                    configStatusRes.result,
                    state.envIdToEnvApprovalConfigurationMap,
                )
                setState((prevState) => ({
                    ...prevState,
                    isUnlocked: configs,
                    isCiPipeline,
                    isCDPipeline,
                    navItems,
                    redirectionUrl: redirectUrl,
                }))
                if (redirection) {
                    history.push(redirectUrl)
                }
            })
            .catch((errors) => {
                showError(errors)
            })
    }

    const showDeleteConfirmation = () => {
        setState((prevState) => ({ ...prevState, showDeleteConfirm: true }))
    }

    const reloadEnvironments = () => {
        fetchEnvironments()
            .then(({ updatedEnvs, envIdToEnvApprovalConfigurationMap }) => {
                setState((prevState) => ({
                    ...prevState,
                    environmentList: updatedEnvs,
                    envIdToEnvApprovalConfigurationMap,
                }))
            })
            .catch((errors) => {
                showError(errors)
                setState({ ...state, view: ViewType.ERROR, statusCode: errors.code })
            })
    }

    const closeDeleteConfirmationModal = () => setState((prevState) => ({ ...prevState, showDeleteConfirm: false }))

    const onClickCloseCannotDeleteModal = () => setState((prevState) => ({ ...prevState, showDeleteConfirm: false }))

    const redirectToWorkflowEditor = () => {
        onClickCloseCannotDeleteModal()
        history.push(getAppComposeURL(appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR, isJob))
    }

    const renderDeleteDialog = () => {
        // Using Confirmation Dialog Modal instead of Delete Confirmation as we are evaluating status on the basis of local variable despite of error code
        if (!state.showDeleteConfirm) return null

        if (state.canDeleteApp) {
            return (
                <ConfirmationModal
                    title={`Delete ${isJob ? DeleteComponentsName.Job : DeleteComponentsName.Application} '${appName}' ?`}
                    variant={ConfirmationModalVariantType.delete}
                    subtitle={<ApplicationDeletionInfo />}
                    buttonConfig={{
                        secondaryButtonConfig: {
                            text: 'Cancel',
                            onClick: closeDeleteConfirmationModal,
                        },
                        primaryButtonConfig: {
                            text: 'Delete',
                            onClick: deleteAppHandler,
                            isLoading: state.view === ViewType.LOADING || isAppDeleting,
                        },
                    }}
                    handleClose={closeDeleteConfirmationModal}
                />
            )
        }

        return (
            <ConfirmationModal
                title={`Cannot Delete ${isJob ? DeleteComponentsName.Job : DeleteComponentsName.Application} '${appName}'`}
                variant={ConfirmationModalVariantType.warning}
                subtitle={`Delete all pipelines and workflows before deleting this ${isJob ? DeleteComponentsName.Job : DeleteComponentsName.Application}`}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: onClickCloseCannotDeleteModal,
                    },
                    primaryButtonConfig: {
                        text: 'View Workflows',
                        onClick: redirectToWorkflowEditor,
                    },
                }}
                handleClose={onClickCloseCannotDeleteModal}
            />
        )
    }

    const getAdditionalParentClass = () => {
        if (location.pathname.match(URLS.APP_ENV_CONFIG_COMPARE)) {
            return 'app-compose-for-env-compare'
        }

        return location.pathname.includes(`/${URLS.APP_DOCKER_CONFIG}`) ||
            (typeof Storage !== 'undefined' && localStorage.getItem('takeMeThereClicked') === '1')
            ? 'dc__position-rel'
            : ''
    }

    const getAppComposeClasses = () => {
        if (location.pathname.match(ENV_CONFIG_PATH_REG)) {
            return 'app-compose-env-configurations__nav'
        }
        return `${
            isGitOpsConfigurationRequired
                ? 'app-compose-with-gitops-config__nav'
                : 'app-compose-with-no-gitops-config__nav'
        } ${isJob ? 'job-compose__side-nav' : ''} ${
            !showCannotDeleteTooltip ? 'dc__position-rel' : ''
        }  ${hideConfigHelp ? 'hide-app-config-help' : ''} ${!canShowExternalLinks ? 'hide-external-links' : ''}  ${
            state.isUnlocked.workflowEditor && isFELibAvailable && !isJob ? 'config-protection__side-nav' : ''
        }`
    }

    const toggleRepoSelectionTippy = () => {
        setShowCannotDeleteTooltip(!showCannotDeleteTooltip)
    }

    if (state.view === ViewType.LOADING) {
        return <Progressing pageLoader />
    }

    if (state.view === ViewType.ERROR) {
        return <ErrorScreenManager code={state.statusCode} />
    }

    return (
        <AppConfigurationProvider
            state={state}
            appId={appId}
            resourceKind={resourceKind}
            deleteApp={showDeleteConfirmation}
            canShowExternalLinks={canShowExternalLinks}
            showCannotDeleteTooltip={showCannotDeleteTooltip}
            toggleRepoSelectionTippy={toggleRepoSelectionTippy}
            hideConfigHelp={hideConfigHelp}
            getWorkflows={reloadWorkflows}
            reloadEnvironments={reloadEnvironments}
            isGitOpsConfigurationRequired={isGitOpsConfigurationRequired}
            respondOnSuccess={respondOnSuccess}
            userRole={userRole}
            filteredEnvIds={filteredEnvIds}
            reloadAppConfig={reloadAppConfig}
            fetchEnvConfig={fetchEnvConfig}
        >
            <>
                <div className={`app-compose ${getAdditionalParentClass()}`}>
                    <div
                        className={`app-compose__nav ${getAppComposeClasses()} flex column left top dc__overflow-auto`}
                    >
                        <AppNavigation />
                    </div>
                    <div className="flexbox-col app-compose__main">
                        <AppComposeRouter />
                    </div>
                </div>
                {renderDeleteDialog()}
            </>
        </AppConfigurationProvider>
    )
}

export default AppConfig

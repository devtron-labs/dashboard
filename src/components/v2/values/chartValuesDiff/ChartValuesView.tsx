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

import { useState, useEffect, useReducer, useRef } from 'react'
import { useHistory, useRouteMatch, useParams, Prompt } from 'react-router-dom'
import { getDeploymentAppType, importComponentFromFELibrary, useJsonYaml } from '../../../common'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ConditionalWrap,
    InfoColourBar,
    ServerErrors,
    ForceDeleteDialog,
    GenericEmptyState,
    ResponseType,
    DeploymentAppTypes,
    StyledRadioGroup as RadioGroup,
    useMainContext,
    YAMLStringify,
    usePrompt,
    getIsRequestAborted,
    deepEqual,
    useDownload,
    ConfigurationType,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import Tippy from '@tippyjs/react'
import {
    getReleaseInfo,
    ReleaseInfoResponse,
    ReleaseInfo,
    InstalledAppInfo,
    deleteApplicationRelease,
    linkToChartStore,
    LinkToChartStoreRequest,
    UpdateAppReleaseRequest,
    updateAppRelease,
    UpdateAppReleaseWithoutLinkingRequest,
    updateAppReleaseWithoutLinking,
} from '../../../external-apps/ExternalAppService'
import {
    createChartValues,
    deleteChartValues,
    deleteInstalledChart,
    getChartValues,
    getChartVersionDetailsV2,
    installChart,
    updateChartValues,
} from '../../../charts/charts.service'
import {
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    DELETE_ACTION,
    SERVER_MODE,
    UNSAVED_CHANGES_PROMPT_MESSAGE,
    URLS,
    checkIfDevtronOperatorHelmRelease,
} from '../../../../config'
import {
    ChartEnvironmentSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartProjectSelector,
    ChartVersionValuesSelector,
    DeleteApplicationButton,
    UpdateApplicationButton,
    AppNameInput,
    ValueNameInput,
    DeploymentAppSelector,
    GitOpsDrawer,
} from './ChartValuesView.component'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import {
    fetchChartVersionsData,
    fetchProjects,
    fetchProjectsAndEnvironments,
    getChartRelatedReadMe,
    getChartValuesList,
} from '../common/chartValues.api'
import { getChartValuesURL, getSavedValuesListURL } from '../../../charts/charts.helper'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Arrows } from '../../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import {
    ChartDeploymentHistoryResponse,
    getDeploymentHistory,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import {
    ChartEnvironmentOptionType,
    ChartKind,
    ChartValuesOptionType,
    ChartValuesViewActionTypes,
    ChartValuesViewType,
} from './ChartValuesView.type'
import { chartValuesReducer, initState } from './ChartValuesView.reducer'
import { ValidationRules } from '../../../app/create/validationRules'
import { getAndUpdateSchemaValue, updateGeneratedManifest } from './ChartValuesView.utils'
import { getAppId } from '../../appDetails/k8Resource/nodeDetail/nodeDetail.api'
import ChartValuesGUIForm from './ChartValuesGUIView'
import './ChartValuesView.scss'
import '../../../app/Overview/Overview.scss'
import { isGitOpsModuleInstalledAndConfigured } from '../../../../services/service'
import NoGitOpsConfiguredWarning from '../../../workflowEditor/NoGitOpsConfiguredWarning'
import { AppMetaInfo } from '../../../app/types'
import { getHelmAppMetaInfo } from '../../../app/service'
import ProjectUpdateModal from './ProjectUpdateModal'
import ChartValuesEditor from './ChartValuesEditor'
import { ChartRepoSelector } from './ChartRepoSelector'
import { MULTI_REQUIRED_FIELDS_MSG, SOME_ERROR_MSG, TOAST_INFO } from '../../../../config/constantMessaging'
import {
    CHART_VALUE_TOAST_MSGS,
    COMPARISON_OPTION_LABELS,
    COMPARISON_OPTION_TIPPY_CONTENT,
    CONNECT_TO_HELM_CHART_TEXTS,
    MANIFEST_TAB_VALIDATION_ERROR,
    MANIFEST_INFO,
    UPDATE_DATA_VALIDATION_ERROR_MSG,
    EMPTY_YAML_ERROR,
} from './ChartValuesView.constants'
import ClusterNotReachableDailog from '../../../common/ClusterNotReachableDailog/ClusterNotReachableDialog'
import { VIEW_MODE } from '@Pages/Shared/ConfigMapSecret/constants'
import IndexStore from '../../appDetails/index.store'
import { AppDetails } from '../../appDetails/appDetails.type'
import { AUTO_GENERATE_GITOPS_REPO, CHART_VALUE_ID } from './constant'

const GeneratedHelmDownload = importComponentFromFELibrary('GeneratedHelmDownload')
const getDownloadManifestUrl = importComponentFromFELibrary('getDownloadManifestUrl', null, 'function')
const ToggleSecurityScan = importComponentFromFELibrary('ToggleSecurityScan', null, 'function')

const ChartValuesView = ({
    appId,
    isExternalApp,
    isDeployChartView,
    isCreateValueView,
    installedConfigFromParent,
    appDetails,
    chartValuesListFromParent = [],
    chartVersionsDataFromParent = [],
    chartValuesFromParent,
    selectedVersionFromParent,
    init,
}: ChartValuesViewType) => {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { chartValueId, presetValueId, envId } = useParams<{
        chartValueId: string
        presetValueId: string
        envId: string
    }>()
    const { serverMode } = useMainContext()
    const { handleDownload } = useDownload()
    const chartValuesAbortRef = useRef<AbortController>(new AbortController())
    const [chartValuesList, setChartValuesList] = useState<ChartValuesType[]>(chartValuesListFromParent || [])
    const [appName, setAppName] = useState('')
    const [valueName, setValueName] = useState('')
    const [appMetaInfo, setAppMetaInfo] = useState<AppMetaInfo>()
    const [isProjectLoading, setProjectLoading] = useState(false)
    const [isUnlinkedCLIApp, setIsUnlinkedCLIApp] = useState(false)
    const [deploymentVersion, setDeploymentVersion] = useState(1)
    const isGitops = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
    const [isVirtualEnvironmentOnSelector, setIsVirtualEnvironmentOnSelector] = useState<boolean>()
    const [allowedDeploymentTypes, setAllowedDeploymentTypes] = useState<DeploymentAppTypes[]>([])
    const [allowedCustomBool, setAllowedCustomBool] = useState<boolean>()
    const [staleData, setStaleData] = useState<boolean>(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
    const [showRepoSelector, setShowRepoSelector] = useState<boolean>(false)
    const [shouldShowPrompt, setShouldShowPrompt] = useState<boolean>(true)

    const [commonState, dispatch] = useReducer(
        chartValuesReducer,
        initState(
            selectedVersionFromParent,
            presetValueId
                ? {
                      ...chartValuesFromParent,
                      id: +presetValueId,
                      kind: ChartKind.TEMPLATE,
                  }
                : chartValuesFromParent,
            installedConfigFromParent,
            chartVersionsDataFromParent,
            appDetails?.deploymentAppType,
        ),
    )

    const [obj] = useJsonYaml(commonState.modifiedValuesYaml, 4, 'yaml', true)
    const isUpdate = isExternalApp || (commonState.installedConfig?.environmentId && commonState.installedConfig.teamId)
    const validationRules = new ValidationRules()
    const [showUpdateAppModal, setShowUpdateAppModal] = useState(false)

    const isPresetValueView =
        isCreateValueView && !!chartValueId && chartValueId === CHART_VALUE_ID.CREATE_CHART_VALUE_VIEW // Create a new preset value view
    const isUpdateAppView = !isCreateValueView && !isDeployChartView && !isExternalApp // update and deploy helm app view

    // Current values of chart version id and chart values id, used to compare dirty state with initial values
    const currentChartVersionValues = {
        chartVersionId: commonState.selectedVersion,
        chartValuesId: commonState.chartValues?.id,
    }
    // detects changes in chart version and chart values from initial mount
    const isChartValueVersionUpdated = !deepEqual(currentChartVersionValues, commonState.initialChartVersionValues)

    const isCreateValueFormDirty = isPresetValueView && (!!valueName || isChartValueVersionUpdated)

    const isDeployChartFormDirty =
        isDeployChartView &&
        (!!appName || !!commonState.selectedProject || !!commonState.selectedEnvironment || isChartValueVersionUpdated)

    const isUpdateAppFormDirty =
        isUpdateAppView &&
        (commonState.installedConfig.appStoreId !== commonState.repoChartValue?.chartId || isChartValueVersionUpdated)

    const isFormDirty = !!isCreateValueFormDirty || !!isDeployChartFormDirty || !!isUpdateAppFormDirty

    const enablePrompt = shouldShowPrompt && (commonState.isUpdateInProgress || isFormDirty)

    usePrompt({ shouldPrompt: enablePrompt })

    const handleDrawerState = (state: boolean) => {
        setIsDrawerOpen(state)
    }

    const checkGitOpsConfiguration = async (): Promise<void> => {
        try {
            const { result } = await isGitOpsModuleInstalledAndConfigured()
            dispatch({
                type: ChartValuesViewActionTypes.updateGitOpsConfiguration,
                payload: {
                    showNoGitOpsWarning: result.isInstalled && !result.isConfigured,
                    authMode: result.authMode,
                },
            })
            setAllowedCustomBool(result.allowCustomRepository === true)
        } catch (error) {}
    }

    useEffect(() => {
        if (!isUpdateAppView && !isExternalApp) {
            checkGitOpsConfiguration()
        }
        if (isDeployChartView || isCreateValueView) {
            fetchProjectsAndEnvironments(serverMode, dispatch)
            getAndUpdateSchemaValue(
                commonState.installedConfig.rawValues,
                commonState.installedConfig.valuesSchemaJson,
                dispatch,
            )

            const _fetchedReadMe = commonState.fetchedReadMe
            _fetchedReadMe.set(0, commonState.installedConfig.readme)
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    isLoading: false,
                    fetchedReadMe: _fetchedReadMe,
                    activeTab:
                        !commonState.installedConfig.valuesSchemaJson || presetValueId || isCreateValueView
                            ? 'yaml'
                            : 'gui',
                },
            })
        } else if (isExternalApp) {
            fetchProjects(dispatch)
            getReleaseInfo(appId)
                .then((releaseInfoResponse: ReleaseInfoResponse) => {
                    const _releaseInfo = releaseInfoResponse.result.releaseInfo
                    const _installedAppInfo = releaseInfoResponse.result.installedAppInfo
                    const _fetchedReadMe = commonState.fetchedReadMe
                    _fetchedReadMe.set(0, _releaseInfo.readme)
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            releaseInfo: _releaseInfo,
                            installedAppInfo: _installedAppInfo,
                            fetchedReadMe: _fetchedReadMe,
                            selectedProject: _installedAppInfo?.teamName
                                ? { value: _installedAppInfo.teamId, label: _installedAppInfo.teamName }
                                : null,
                            activeTab:
                                !_releaseInfo.valuesSchemaJson || presetValueId || isCreateValueView ? 'yaml' : 'gui',
                        },
                    })

                    if (_installedAppInfo) {
                        initData(_installedAppInfo, _releaseInfo)
                    } else {
                        setIsUnlinkedCLIApp(true)
                        const _chartVersionData: ChartVersionType = {
                            id: 0,
                            version: _releaseInfo.deployedAppDetail.chartVersion,
                        }
                        const _chartValues: ChartValuesType = {
                            id: 0,
                            kind: ChartKind.EXISTING,
                            name: _releaseInfo.deployedAppDetail.appName,
                        }
                        setChartValuesList([_chartValues])

                        const _valuesYaml = YAMLStringify(JSON.parse(_releaseInfo.mergedValues))
                        getAndUpdateSchemaValue(_valuesYaml, _releaseInfo.valuesSchemaJson, dispatch)
                        dispatch({
                            type: ChartValuesViewActionTypes.multipleOptions,
                            payload: {
                                isLoading: false,
                                repoChartValue: {
                                    appStoreApplicationVersionId: 0,
                                    chartRepoName: '',
                                    chartId: 0,
                                    chartName: _releaseInfo.deployedAppDetail.chartName,
                                    version: _releaseInfo.deployedAppDetail.chartVersion,
                                    deprecated: false,
                                },
                                selectedVersionUpdatePage: _chartVersionData,
                                chartVersionsData: [_chartVersionData],
                                chartValues: _chartValues,
                                modifiedValuesYaml: _valuesYaml,
                                initialChartVersionValues: {
                                    chartVersionId: _chartVersionData.id,
                                    chartValuesId: _chartValues.id,
                                },
                            },
                        })
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            isLoading: false,
                            errorResponseCode: errors.code,
                        },
                    })
                })
        } else {
            fetchProjectsAndEnvironments(serverMode, dispatch)
            getAndUpdateSchemaValue(
                commonState.installedConfig.valuesOverrideYaml,
                commonState.installedConfig.valuesSchemaJson,
                dispatch,
            )
            getChartValuesList(appDetails.appStoreChartId, setChartValuesList)
            fetchChartVersionsData(
                appDetails.appStoreChartId,
                dispatch,
                appDetails.appStoreAppVersion,
                appDetails.appStoreInstalledAppVersionId,
            )
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    modifiedValuesYaml: commonState.installedConfig.valuesOverrideYaml,
                    activeTab:
                        !commonState.installedConfig.valuesSchemaJson || presetValueId || isCreateValueView
                            ? 'yaml'
                            : 'gui',
                    repoChartValue: {
                        appStoreApplicationVersionId: commonState.installedConfig.appStoreVersion,
                        chartRepoName: appDetails.appStoreChartName,
                        chartId: commonState.installedConfig.appStoreId,
                        chartName: appDetails.appStoreAppName,
                        version: appDetails.appStoreAppVersion,
                        deprecated: commonState.installedConfig.deprecated,
                    },
                    chartValues: {
                        id: appDetails.appStoreInstalledAppVersionId,
                        appStoreVersionId: commonState.installedConfig.appStoreVersion,
                        kind: ChartKind.DEPLOYED,
                    },
                },
            })
        }

        if (!isDeployChartView && !isCreateValueView) {
            getDeploymentHistory(appId, isExternalApp)
                .then((deploymentHistoryResponse: ChartDeploymentHistoryResponse) => {
                    const _deploymentHistoryArr =
                        deploymentHistoryResponse.result?.deploymentHistory?.sort(
                            (a, b) => b.deployedAt.seconds - a.deployedAt.seconds,
                        ) || []

                    setDeploymentVersion(_deploymentHistoryArr[0].version)
                    dispatch({
                        type: ChartValuesViewActionTypes.deploymentHistoryArr,
                        payload: _deploymentHistoryArr,
                    })
                })
                .catch((e) => {})
        }

        if (!isDeployChartView && !isCreateValueView) {
            getHelmAppMetaInfoRes()
        }

        chartValuesAbortRef.current = new AbortController()
        return () => {
            chartValuesAbortRef.current.abort()
        }
    }, [])

    useEffect(() => {
        if (
            commonState.chartValues &&
            ((commonState.chartValues.id && commonState.chartValues.chartVersion) ||
                (isExternalApp && commonState.releaseInfo))
        ) {
            dispatch({ type: ChartValuesViewActionTypes.fetchingValuesYaml, payload: true })
            if (commonState.chartValues.id && commonState.chartValues.chartVersion) {
                getChartValues(commonState.chartValues.id, commonState.chartValues.kind)
                    .then((response) => {
                        dispatch({
                            type: ChartValuesViewActionTypes.multipleOptions,
                            payload: {
                                fetchingValuesYaml: false,
                                modifiedValuesYaml: response.result.values || '',
                            },
                        })
                        let _valueName
                        if (isCreateValueView && commonState.chartValues.kind === ChartKind.TEMPLATE) {
                            if (valueName === '') {
                                setValueName(response.result.name)
                            }
                            _valueName = response.result.name
                        }

                        if (
                            ((isExternalApp || (!isDeployChartView && !isCreateValueView)) &&
                                commonState.installedConfig) ||
                            (isDeployChartView && commonState.selectedEnvironment)
                        ) {
                            commonState.chartValues.appStoreVersionId &&
                                updateGeneratedManifest(
                                    isCreateValueView,
                                    isUnlinkedCLIApp,
                                    isExternalApp,
                                    isDeployChartView,
                                    appName,
                                    _valueName,
                                    commonState,
                                    commonState.chartValues.appStoreVersionId,
                                    appId,
                                    deploymentVersion,
                                    response.result.values,
                                    dispatch,
                                )
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        dispatch({
                            type: ChartValuesViewActionTypes.fetchingValuesYaml,
                            payload: false,
                        })
                    })
            } else if (
                isExternalApp &&
                commonState.releaseInfo.mergedValues &&
                commonState.releaseInfo.deployedAppDetail.appName === commonState.chartValues.name
            ) {
                dispatch({
                    type: ChartValuesViewActionTypes.multipleOptions,
                    payload: {
                        fetchingValuesYaml: false,
                        modifiedValuesYaml: YAMLStringify(JSON.parse(commonState.releaseInfo.mergedValues)),
                    },
                })
            }
        }
    }, [commonState.chartValues])

    useEffect(() => {
        if (commonState.selectedVersionUpdatePage?.id) {
            getChartRelatedReadMe(
                commonState.selectedVersionUpdatePage.id,
                commonState.fetchedReadMe,
                commonState.modifiedValuesYaml,
                dispatch,
            )
        }
    }, [commonState.selectedVersionUpdatePage, commonState.isReadMeAvailable])

    useEffect(() => {
        if (
            commonState.installedConfig &&
            commonState.installedConfig.environmentId &&
            commonState.installedConfig.teamId &&
            commonState.environments.length > 0 &&
            commonState.projects.length > 0
        ) {
            const project = commonState.projects.find(
                (e) => e.value.toString() === commonState.installedConfig.teamId.toString(),
            )

            let environment: ChartValuesOptionType
            for (const envList of commonState.environments) {
                environment = (envList.options as ChartValuesOptionType[]).find(
                    (e) => e.value.toString() === commonState.installedConfig.environmentId.toString(),
                )
                if (environment?.value) {
                    break
                }
            }

            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    selectedProject: project,
                    selectedEnvironment: environment,
                },
            })
        }
    }, [commonState.installedConfig, commonState.environments, commonState.projects])

    useEffect(() => {
        if (
            commonState.activeTab === 'manifest' &&
            (commonState.valuesYamlUpdated ||
                (isExternalApp &&
                    !commonState.manifestGenerationKey.endsWith(commonState.selectedVersionUpdatePage?.id)) ||
                (commonState.selectedEnvironment &&
                    !commonState.manifestGenerationKey.startsWith(commonState.selectedEnvironment.value)) ||
                !commonState.manifestGenerationKey.endsWith(commonState.selectedVersionUpdatePage?.id)) &&
            !commonState.generatingManifest
        ) {
            const appStoreApplicationVersionId =
                commonState.manifestGenerationKey &&
                commonState.selectedVersionUpdatePage &&
                !commonState.manifestGenerationKey.endsWith(commonState.selectedVersionUpdatePage.id)
                    ? commonState.selectedVersionUpdatePage.id
                    : commonState.chartValues?.appStoreVersionId || commonState.chartValues?.id

            updateGeneratedManifest(
                isCreateValueView,
                isUnlinkedCLIApp,
                isExternalApp,
                isDeployChartView,
                appName,
                valueName,
                commonState,
                appStoreApplicationVersionId,
                appId,
                deploymentVersion,
                commonState.modifiedValuesYaml,
                dispatch,
            )
        }
    }, [commonState.activeTab, commonState.selectedEnvironment, commonState.selectedVersionUpdatePage])

    useEffect(() => {
        if (chartValuesList.length > 0 || commonState.deploymentHistoryArr.length > 0) {
            const isVersionAvailableForDiff =
                chartValuesList.some((_chartValues) => _chartValues.kind === ChartKind.DEPLOYED) ||
                commonState.deploymentHistoryArr.length > 0 ||
                isCreateValueView

            dispatch({ type: ChartValuesViewActionTypes.isComparisonAvailable, payload: isVersionAvailableForDiff })
        }
    }, [chartValuesList, commonState.deploymentHistoryArr])

    const initData = async (_installedAppInfo: InstalledAppInfo, _releaseInfo: ReleaseInfo) => {
        try {
            const { result } = await getChartVersionDetailsV2(_installedAppInfo.installedAppVersionId)
            const _repoChartValue = {
                appStoreApplicationVersionId: result?.appStoreVersion,
                chartRepoName: _installedAppInfo.appStoreChartRepoName,
                chartId: _installedAppInfo.appStoreChartId,
                chartName: _installedAppInfo.appStoreChartName,
                version: _releaseInfo.deployedAppDetail.chartVersion,
                deprecated: result?.deprecated,
                gitRepoURL: result.gitRepoURL,
            }
            getChartValuesList(_repoChartValue.chartId, setChartValuesList)
            fetchChartVersionsData(_repoChartValue.chartId, dispatch, _releaseInfo.deployedAppDetail.chartVersion)
            getAndUpdateSchemaValue(result?.valuesOverrideYaml, _releaseInfo.valuesSchemaJson, dispatch)
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    isLoading: false,
                    repoChartValue: _repoChartValue,
                    chartValues: {
                        id: _installedAppInfo.installedAppVersionId,
                        appStoreVersionId: result?.appStoreVersion,
                        kind: ChartKind.DEPLOYED,
                        name: _releaseInfo.deployedAppDetail.appName,
                    },
                    installedConfig: result,
                    modifiedValuesYaml: result?.valuesOverrideYaml,
                    initialChartVersionValues: {
                        ...commonState.initialChartVersionValues,
                        chartValuesId: _installedAppInfo.installedAppVersionId,
                    },
                },
            })
        } catch (e: any) {
            dispatch({ type: ChartValuesViewActionTypes.isLoading, payload: false })
        }
    }

    const handleRepoChartValueChange = (event) => {
        if (isExternalApp) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    repoChartValue: event ?? {
                        appStoreApplicationVersionId: 0,
                        chartRepoName: '',
                        chartId: 0,
                        chartName: commonState.releaseInfo.deployedAppDetail.chartName,
                        version: commonState.releaseInfo.deployedAppDetail.chartVersion,
                        deprecated: false,
                    },
                    showConnectToChartTippy: false,
                },
            })

            if (event) {
                getChartValuesList(event.chartId, (_chartValuesList: ChartValuesType[]) => {
                    if (!commonState.installedAppInfo) {
                        const _defaultChartValues: ChartValuesType = {
                            id: 0,
                            kind: ChartKind.EXISTING,
                            name: commonState.releaseInfo.deployedAppDetail.appName,
                        }

                        _chartValuesList?.push(_defaultChartValues)
                        handleChartValuesSelection(_defaultChartValues)
                    }
                    setChartValuesList(_chartValuesList)
                })
                fetchChartVersionsData(event.chartId, dispatch, commonState.releaseInfo.deployedAppDetail.chartVersion)
            }
        } else {
            dispatch({ type: ChartValuesViewActionTypes.repoChartValue, payload: event })
            getChartValuesList(
                event.chartId,
                setChartValuesList,
                handleChartValuesSelection,
                appDetails.appStoreInstalledAppVersionId,
                commonState.installedConfig.id,
            )
            fetchChartVersionsData(event.chartId, dispatch)
        }
    }

    const deleteApplication = (deleteAction: DELETE_ACTION) => {
        if (commonState.isDeleteInProgress) {
            return
        }
        // updating the delete state to progressing
        dispatch({
            type: ChartValuesViewActionTypes.isDeleteInProgress,
            payload: true,
        })

        // initiating deletion (External Helm App/ Helm App/ Preset Value)
        getDeleteApplicationApi(deleteAction)
            .then((response: ResponseType) => {
                // preset value deleted successfully
                if (isCreateValueView) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: TOAST_INFO.DELETION_INITIATED,
                    })

                    if (typeof init === 'function') {
                        init()
                    }
                    history.push(getSavedValuesListURL(installedConfigFromParent.appStoreId))
                    return
                }
                // ends

                // helm app OR external helm app delete initiated
                if (
                    response.result.deleteResponse?.deleteInitiated ||
                    (isExternalApp && !commonState.installedAppInfo)
                ) {
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: TOAST_INFO.DELETION_INITIATED,
                    })

                    init && init()
                    history.push(`${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${appId}/env/${envId}`)
                    return
                }

                // helm app delete failed due to cluster not reachable (ArgoCD installed)
                if (
                    deleteAction !== DELETE_ACTION.NONCASCADE_DELETE &&
                    !response.result.deleteResponse?.clusterReachable &&
                    commonState.deploymentAppType === DeploymentAppTypes.GITOPS
                ) {
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            isDeleteInProgress: true,
                            showDeleteAppConfirmationDialog: false,
                        },
                    })
                    dispatch({
                        type: ChartValuesViewActionTypes.nonCascadeDeleteData,
                        payload: {
                            nonCascade: true,
                            clusterName: response.result.deleteResponse?.clusterName,
                        },
                    })
                    dispatch({
                        type: ChartValuesViewActionTypes.isDeleteInProgress,
                        payload: false,
                    })
                }
            })
            .catch((error) => {
                /*
                helm app delete failed due to:
                1. cluster not reachable (Helm installed)
                2. ArgoCD dashboard not reachable
                3. any other event loss
                */
                // updating state for force delete dialog box
                if (deleteAction !== DELETE_ACTION.FORCE_DELETE && error.code !== 403) {
                    let forceDeleteTitle = ''
                    let forceDeleteMessage = ''
                    if (error instanceof ServerErrors && Array.isArray(error.errors)) {
                        error.errors.map(({ userMessage, internalMessage }) => {
                            forceDeleteTitle = userMessage
                            forceDeleteMessage = internalMessage
                        })
                    }
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            isDeleteInProgress: true,
                            showDeleteAppConfirmationDialog: false,
                        },
                    })
                    dispatch({
                        type: ChartValuesViewActionTypes.nonCascadeDeleteData,
                        payload: {
                            nonCascade: false,
                            clusterName: '',
                        },
                    })
                    dispatch({
                        type: ChartValuesViewActionTypes.forceDeleteData,
                        payload: {
                            forceDelete: true,
                            title: forceDeleteTitle,
                            message: forceDeleteMessage,
                        },
                    })
                } else {
                    showError(error)
                }

                dispatch({
                    type: ChartValuesViewActionTypes.isDeleteInProgress,
                    payload: false,
                })
            })
    }

    const getDeleteApplicationApi = (deleteAction: DELETE_ACTION): Promise<any> => {
        // Delete: external helm app
        if (isExternalApp && !commonState.installedAppInfo) {
            return deleteApplicationRelease(appId)
        }
        // Delete: helm chart preset values
        if (isCreateValueView) {
            return deleteChartValues(parseInt(chartValueId))
        }
        // Delete: helm app

        return deleteInstalledChart(commonState.installedConfig.installedAppId, isGitops, deleteAction)
    }

    const hasChartChanged = () => {
        return (
            commonState.repoChartValue &&
            ((isExternalApp &&
                ((!commonState.installedAppInfo && !!commonState.repoChartValue.chartRepoName) ||
                    (commonState.installedAppInfo &&
                        commonState.installedAppInfo.appStoreChartRepoName !==
                            commonState.repoChartValue.chartRepoName))) ||
                (!isExternalApp && commonState.installedConfig.appStoreId !== commonState.repoChartValue.chartId))
        )
    }

    const isValidData = (validatedAppName?: { isValid: boolean; message: string }) => {
        const _validatedAppName = validatedAppName || validationRules.appName(appName)

        if (
            isDeployChartView &&
            (!_validatedAppName.isValid || !commonState.selectedEnvironment || !commonState.selectedProject)
        ) {
            return false
        }

        return true
    }

    const _buildAppDetailUrl = (newInstalledAppId: number, newEnvironmentId: number) => {
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId({
                clusterId: commonState.selectedEnvironment.clusterId,
                namespace: commonState.selectedEnvironment.namespace,
                appName,
            })}/${appName}`
        }

        return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${newInstalledAppId}/env/${newEnvironmentId}/${URLS.APP_DETAILS}?newDeployment=true`
    }

    const isRequestDataValid = (validatedName: { isValid: boolean; message: string }): boolean => {
        if (isCreateValueView && !validatedName.isValid) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidValueName: !validatedName.isValid,
                    invalidValueNameMessage: validatedName.message,
                },
            })
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: MULTI_REQUIRED_FIELDS_MSG,
            })
            return false
        }
        if (!isValidData(validatedName)) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidAppName: !validatedName.isValid,
                    invalidAppNameMessage: validatedName.message,
                    invalidaEnvironment: !commonState.selectedEnvironment,
                    invalidProject: !commonState.selectedProject,
                },
            })
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: MULTI_REQUIRED_FIELDS_MSG,
            })
            return false
        }
        if (commonState.activeTab === 'gui' && commonState.schemaJson?.size) {
            const requiredValues = [...commonState.schemaJson.values()].filter((_val) => _val.isRequired && !_val.value)
            if (requiredValues.length > 0) {
                const formErrors = {}
                requiredValues.forEach((e) => {
                    formErrors[e.key] = true
                })

                dispatch({
                    type: ChartValuesViewActionTypes.formValidationError,
                    payload: formErrors,
                })
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: MULTI_REQUIRED_FIELDS_MSG,
                })
                return false
            }
            dispatch({
                type: ChartValuesViewActionTypes.formValidationError,
                payload: {},
            })
        }

        // validate data
        try {
            if (!commonState.modifiedValuesYaml) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: `${UPDATE_DATA_VALIDATION_ERROR_MSG} "${EMPTY_YAML_ERROR}"`,
                })
                return false
            }
            JSON.stringify(YAML.parse(commonState.modifiedValuesYaml))
        } catch (err) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: `${UPDATE_DATA_VALIDATION_ERROR_MSG} “${err}”`,
            })
            return false
        }

        return true
    }

    const deployOrUpdateApplication = async () => {
        if (commonState.isUpdateInProgress) {
            return
        }

        const validatedName = validationRules.appName(isCreateValueView ? valueName : appName)
        if (!isRequestDataValid(validatedName)) {
            // If some validation error occurred, close the readme column or comparision column
            // to show the validations errors
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    openReadMe: false,
                    openComparison: false,
                },
            })
            return
        }

        if (isCreateValueView && !validatedName.isValid) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    isUpdateInProgress: true,
                    invalidValueName: false,
                    invalidValueNameMessage: '',
                },
            })
        } else {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    isUpdateInProgress: true,
                    invalidAppName: false,
                    invalidAppNameMessage: '',
                    invalidaEnvironment: false,
                    invalidProject: false,
                },
            })
        }

        const onClickManifestDownload = (appId: number, envId: number, appName: string, helmPackageName: string) => {
            if (!getDownloadManifestUrl) {
                return
            }
            const downloadManifestDownload = {
                appId,
                envId,
                appName: helmPackageName ?? appName,
                isHelmApp: true,
            }
            const downloadUrl = getDownloadManifestUrl(downloadManifestDownload)
            handleDownload({
                downloadUrl,
                fileName: downloadManifestDownload.appName,
                downloadSuccessToastContent: 'Manifest Downloaded Successfully',
            })
        }

        try {
            let res
            let toastMessage

            if (isExternalApp && !commonState.installedAppInfo) {
                if (commonState.repoChartValue?.chartRepoName) {
                    const payload: LinkToChartStoreRequest = {
                        appId,
                        valuesYaml: commonState.modifiedValuesYaml,
                        appStoreApplicationVersionId: commonState.selectedVersionUpdatePage.id,
                        referenceValueId: commonState.selectedVersionUpdatePage.id,
                        referenceValueKind: commonState.chartValues.kind,
                    }
                    res = await linkToChartStore(payload)
                } else {
                    const payload: UpdateAppReleaseWithoutLinkingRequest = {
                        appId,
                        valuesYaml: commonState.modifiedValuesYaml,
                    }
                    res = await updateAppReleaseWithoutLinking(payload)
                }
            } else if (isDeployChartView) {
                const payload = {
                    teamId: commonState.selectedProject.value,
                    referenceValueId: commonState.chartValues.id,
                    referenceValueKind: commonState.chartValues.kind,
                    environmentId: commonState.selectedEnvironment ? commonState.selectedEnvironment.value : 0,
                    clusterId: commonState.selectedEnvironment.clusterId,
                    namespace: commonState.selectedEnvironment.namespace,
                    appStoreVersion: commonState.selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: commonState.modifiedValuesYaml,
                    appName: appName.trim(),
                    deploymentAppType: isVirtualEnvironmentOnSelector
                        ? DeploymentAppTypes.MANIFEST_DOWNLOAD
                        : commonState.deploymentAppType,
                    gitRepoURL: commonState.gitRepoURL,
                    ...(ToggleSecurityScan && { isManifestScanEnabled: commonState.isManifestScanEnabled }),
                }
                res = await installChart(payload, chartValuesAbortRef.current?.signal)
            } else if (isCreateValueView) {
                const payload = {
                    name: valueName,
                    appStoreVersionId: commonState.selectedVersion,
                    values: commonState.modifiedValuesYaml,
                }
                if (chartValueId !== '0') {
                    const chartVersionObj = commonState.chartVersionsData.find(
                        (_chartVersion) => _chartVersion.id === commonState.selectedVersion,
                    )
                    payload['id'] = parseInt(chartValueId)
                    payload['chartVersion'] = chartVersionObj.version
                    toastMessage = CHART_VALUE_TOAST_MSGS.Updated
                    res = await updateChartValues(payload)
                } else {
                    toastMessage = CHART_VALUE_TOAST_MSGS.Created
                    res = await createChartValues(payload, chartValuesAbortRef.current.signal)
                }
            } else {
                const payload: UpdateAppReleaseRequest = {
                    id: hasChartChanged() ? 0 : commonState.installedConfig.id,
                    referenceValueId: commonState.chartValues.id,
                    referenceValueKind: commonState.chartValues.kind,
                    valuesOverrideYaml: commonState.modifiedValuesYaml,
                    installedAppId: commonState.installedConfig.installedAppId,
                    appStoreVersion: commonState.selectedVersionUpdatePage.id,
                    ...(ToggleSecurityScan && { isManifestScanEnabled: commonState.isManifestScanEnabled }),
                }
                res = await updateAppRelease(payload, chartValuesAbortRef.current.signal)
            }
            setShouldShowPrompt(false)
            dispatch({
                type: ChartValuesViewActionTypes.isUpdateInProgress,
                payload: false,
            })

            if (isCreateValueView) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: toastMessage,
                })
                history.push(getSavedValuesListURL(installedConfigFromParent.appStoreId))
            } else if (isDeployChartView && res?.result) {
                const {
                    result: { environmentId: newEnvironmentId, installedAppId: newInstalledAppId },
                } = res
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: CHART_VALUE_TOAST_MSGS.DeploymentInitiated,
                })
                history.push(_buildAppDetailUrl(newInstalledAppId, newEnvironmentId))
            } else if (res?.result && (res.result.success || res.result.appName)) {
                appDetails?.isVirtualEnvironment &&
                    onClickManifestDownload(
                        res.result.installedAppId,
                        +envId,
                        res.result.appName,
                        res.result?.helmPackageName,
                    )
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: CHART_VALUE_TOAST_MSGS.UpdateInitiated,
                })
                IndexStore.publishAppDetails({} as AppDetails, null)
                history.push(`${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`)
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: SOME_ERROR_MSG,
                })
            }
        } catch (err) {
            if (err['code'] === 409) {
                handleDrawerState(true)
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Some global configurations for GitOps has changed',
                })
                setStaleData(true)
                dispatch({
                    type: ChartValuesViewActionTypes.setGitRepoURL,
                    payload: AUTO_GENERATE_GITOPS_REPO,
                })
                handleDrawerState(true)
            } else if (err['code'] === 400 && err['errors'] && err['errors'][0].code === '3900') {
                setAllowedCustomBool(true)
                handleDrawerState(true)
            } else if (!getIsRequestAborted(err)) {
                showError(err)
            }
            dispatch({
                type: ChartValuesViewActionTypes.isUpdateInProgress,
                payload: false,
            })
            setShouldShowPrompt(true)
        }
    }

    const onEditorValueChange = (codeEditorData: string) => {
        if (commonState.activeTab !== 'manifest') {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    modifiedValuesYaml: codeEditorData,
                    valuesYamlUpdated: commonState.modifiedValuesYaml !== codeEditorData,
                },
            })
        }
    }

    const redirectToChartValues = async () => {
        const _chartId = commonState.repoChartValue?.chartId || commonState.installedConfig?.appStoreId
        if (_chartId) {
            history.push(getChartValuesURL(_chartId))
        }
    }

    const handleTabSwitch = (e) => {
        if (e?.target && e.target.value !== commonState.activeTab) {
            if (e.target.value === 'manifest') {
                const validatedName = validationRules.appName(isCreateValueView ? valueName : appName)
                if (isCreateValueView && !validatedName.isValid) {
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            openReadMe: false,
                            openComparison: false,
                            invalidValueName: !validatedName.isValid,
                            invalidValueNameMessage: validatedName.message,
                        },
                    })
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: MANIFEST_TAB_VALIDATION_ERROR,
                    })
                    return
                }
                if (!isValidData(validatedName)) {
                    dispatch({
                        type: ChartValuesViewActionTypes.multipleOptions,
                        payload: {
                            openReadMe: false,
                            openComparison: false,
                            invalidAppName: !validatedName.isValid,
                            invalidAppNameMessage: validatedName.message,
                            invalidaEnvironment: !commonState.selectedEnvironment,
                            invalidProject: !commonState.selectedProject,
                        },
                    })
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: MANIFEST_TAB_VALIDATION_ERROR,
                    })
                    return
                }
            }

            let _payload = {}
            if (e.target.value === 'gui' && commonState.schemaJson) {
                getAndUpdateSchemaValue(commonState.modifiedValuesYaml, commonState.schemaJson, dispatch)
            }

            if (
                commonState.invalidAppName ||
                commonState.invalidAppNameMessage ||
                commonState.invalidaEnvironment ||
                commonState.invalidProject
            ) {
                _payload = {
                    invalidAppName: false,
                    invalidAppNameMessage: '',
                    invalidaEnvironment: false,
                    invalidProject: false,
                    ..._payload,
                }
            }

            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    activeTab: e.target.value,
                    openReadMe: false,
                    openComparison: false,
                    ..._payload,
                },
            })
        }
    }

    const handleReadMeOptionClick = (disabled: boolean) => {
        if (commonState.fetchingReadMe || disabled) {
            return
        }

        dispatch({ type: ChartValuesViewActionTypes.openReadMe, payload: !commonState.openReadMe })
        if (commonState.openComparison) {
            dispatch({ type: ChartValuesViewActionTypes.openComparison, payload: false })
        }
    }

    const renderReadMeOption = (disabled?: boolean) => {
        return (
            <span
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 ml-8 ${
                    commonState.openReadMe ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => handleReadMeOptionClick(disabled)}
                data-testid="readme-option"
            >
                {commonState.openReadMe ? (
                    <>
                        <Close className="option-close__icon icon-dim-16 mr-8" />
                        Hide README
                    </>
                ) : (
                    <>
                        <File className="option-open__icon icon-dim-16 mr-8" />
                        README
                    </>
                )}
            </span>
        )
    }

    const handleComparisonOptionClick = (disabled: boolean) => {
        if (disabled) {
            return
        }

        dispatch({ type: ChartValuesViewActionTypes.openComparison, payload: !commonState.openComparison })
        if (commonState.openReadMe) {
            dispatch({ type: ChartValuesViewActionTypes.openReadMe, payload: false })
        }
    }

    const renderComparisonOption = (disabled?: boolean) => {
        return (
            <span
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 ${
                    commonState.openComparison ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => handleComparisonOptionClick(disabled)}
                data-testid="compare-values"
            >
                {commonState.openComparison ? (
                    <Close className="option-close__icon icon-dim-16 mr-8" />
                ) : (
                    <Arrows className="scn-7 icon-dim-16 mr-8 dc__no-shrink" />
                )}
                {commonState.openComparison
                    ? COMPARISON_OPTION_LABELS.HideComparison
                    : commonState.activeTab === 'yaml'
                      ? COMPARISON_OPTION_LABELS.CompareValues
                      : COMPARISON_OPTION_LABELS.CompareManifest}
            </span>
        )
    }

    const renderValuesTabs = () => {
        const initialSelectedTab =
            !(presetValueId || isCreateValueView) &&
            ((isExternalApp && !!commonState.releaseInfo?.valuesSchemaJson) ||
                !!commonState.installedConfig?.valuesSchemaJson)
                ? ConfigurationType.GUI
                : ConfigurationType.YAML

        return (
            <RadioGroup
                className="gui-yaml-switch"
                name="yaml-mode"
                initialTab={initialSelectedTab.toLowerCase()}
                disabled={false}
                onChange={handleTabSwitch}
            >
                {(initialSelectedTab === ConfigurationType.GUI || !!commonState.schemaJson) && (
                    <RadioGroup.Radio value={ConfigurationType.GUI.toLowerCase()}>
                        {ConfigurationType.GUI} (Beta)
                    </RadioGroup.Radio>
                )}
                <RadioGroup.Radio value={ConfigurationType.YAML.toLowerCase()} dataTestId="yaml-radio-button">
                    <Edit className="icon-dim-12 mr-6" />
                    {ConfigurationType.YAML}
                </RadioGroup.Radio>
                <RadioGroup.Radio
                    value="manifest"
                    canSelect={isValidData()}
                    tippyContent={MANIFEST_INFO.InfoText}
                    dataTestId="manifest-radio-button"
                >
                    Manifest output
                </RadioGroup.Radio>
            </RadioGroup>
        )
    }

    const getComparisonTippyContent = () => {
        if (commonState.isComparisonAvailable) {
            if (commonState.activeTab === 'manifest') {
                return commonState.deploymentHistoryArr && commonState.deploymentHistoryArr.length
                    ? COMPARISON_OPTION_TIPPY_CONTENT.EnabledManifest
                    : COMPARISON_OPTION_TIPPY_CONTENT.DiabledManifest
            }
            return isCreateValueView
                ? COMPARISON_OPTION_TIPPY_CONTENT.OtherValues
                : isDeployChartView
                  ? COMPARISON_OPTION_TIPPY_CONTENT.OtherDeployments
                  : COMPARISON_OPTION_TIPPY_CONTENT.PreviousDeployments
        }

        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">{COMPARISON_OPTION_TIPPY_CONTENT.Heading}</h2>
                <p className="fs-12 fw-4 lh-18 m-0">
                    {commonState.activeTab === 'manifest'
                        ? COMPARISON_OPTION_TIPPY_CONTENT.DiabledManifest
                        : COMPARISON_OPTION_TIPPY_CONTENT.InfoText}
                </p>
            </>
        )
    }

    const renderValuesTabsContainer = () => {
        return (
            <div className="chart-values-view__tabs-container flex dc__content-space dc__border-bottom">
                {renderValuesTabs()}
                <div className="flex">
                    <ConditionalWrap
                        condition={
                            !commonState.openReadMe &&
                            (commonState.fetchingReadMe ||
                                !commonState.isReadMeAvailable ||
                                !commonState.fetchedReadMe.get(commonState.selectedVersionUpdatePage?.id || 0))
                        }
                        wrap={() => renderComparisonOption(isDeployChartView)}
                    >
                        {commonState.activeTab !== VIEW_MODE.GUI && (
                            <Tippy
                                className="default-tt w-200"
                                arrow={false}
                                placement="bottom"
                                content={getComparisonTippyContent()}
                            >
                                {renderComparisonOption(
                                    commonState.activeTab === VIEW_MODE.MANIFEST
                                        ? !commonState.isComparisonAvailable ||
                                              !commonState.deploymentHistoryArr ||
                                              commonState.deploymentHistoryArr.length === 0
                                        : !commonState.isComparisonAvailable,
                                )}
                            </Tippy>
                        )}
                        {commonState.activeTab !== VIEW_MODE.MANIFEST && renderReadMeOption()}
                    </ConditionalWrap>
                </div>
            </div>
        )
    }

    const handleToggleSecurityScan = () => {
        dispatch({
            type: ChartValuesViewActionTypes.setIsManifestScanEnabled,
            payload: !commonState.isManifestScanEnabled,
        })
    }

    const handleProjectSelection = (selected: ChartValuesOptionType) => {
        dispatch({ type: ChartValuesViewActionTypes.selectedProject, payload: selected })
        if (commonState.invalidProject) {
            dispatch({
                type: ChartValuesViewActionTypes.invalidProject,
                payload: false,
            })
        }
    }

    const handleEnvironmentSelection = (selected: ChartEnvironmentOptionType) => {
        setShowRepoSelector(true)
        if (selected.allowedDeploymentTypes.indexOf(commonState.deploymentAppType) >= 0) {
            dispatch({ type: ChartValuesViewActionTypes.selectedEnvironment, payload: selected })
        } else {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    selectedEnvironment: selected,
                    deploymentAppType: getDeploymentAppType(
                        selected.allowedDeploymentTypes,
                        commonState.deploymentAppType,
                        selected.isVirtualEnvironment,
                    ),
                },
            })
        }
        setIsVirtualEnvironmentOnSelector(selected.isVirtualEnvironment)
        setAllowedDeploymentTypes(selected.allowedDeploymentTypes ?? [])
        if (commonState.invalidaEnvironment) {
            dispatch({
                type: ChartValuesViewActionTypes.invalidaEnvironment,
                payload: false,
            })
        }
    }

    const handleDeploymentAppTypeSelection = (event) => {
        dispatch({
            type: ChartValuesViewActionTypes.selectedDeploymentApp,
            payload: event.target.value,
        })
    }

    const handleVersionSelection = (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                selectedVersion,
                selectedVersionUpdatePage,
            },
        })
    }

    const handleChartValuesSelection = (chartValues: ChartValuesType) => {
        dispatch({ type: ChartValuesViewActionTypes.chartValues, payload: chartValues })
    }

    const handleAppNameChange = (newAppName: string) => {
        const validatedAppName = validationRules.appName(newAppName)
        if (!validatedAppName.isValid && commonState.invalidAppNameMessage !== validatedAppName.message) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidAppName: true,
                    invalidAppNameMessage: validatedAppName.message,
                },
            })
        } else if (validatedAppName.isValid) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidAppName: false,
                    invalidAppNameMessage: '',
                },
            })
        }
        setAppName(newAppName)
    }

    const handleNameOnBlur = () => {
        if (commonState.activeTab === 'manifest') {
            updateGeneratedManifest(
                isCreateValueView,
                isUnlinkedCLIApp,
                isExternalApp,
                isDeployChartView,
                appName,
                valueName,
                commonState,
                commonState.chartValues.appStoreVersionId || commonState.chartValues.id,
                appId,
                deploymentVersion,
                commonState.modifiedValuesYaml,
                dispatch,
            )
        }
    }

    const onClickHideNonCascadeDeletePopup = () => {
        dispatch({
            type: ChartValuesViewActionTypes.nonCascadeDeleteData,
            payload: {
                nonCascade: false,
                clusterName: '',
            },
        })
    }

    const onClickNonCascadeDelete = () => {
        dispatch({
            type: ChartValuesViewActionTypes.nonCascadeDeleteData,
            payload: {
                nonCascade: false,
                clusterName: '',
            },
        })
        deleteApplication(DELETE_ACTION.NONCASCADE_DELETE)
    }

    const renderChartValuesEditor = () => {
        return (
            <div className="chart-values-view__editor">
                {commonState.activeTab === 'manifest' && commonState.valuesEditorError ? (
                    <GenericEmptyState title="" subTitle={commonState.valuesEditorError} />
                ) : (
                    <ChartValuesEditor
                        loading={
                            commonState.fetchingValuesYaml ||
                            (commonState.activeTab === 'manifest' && commonState.generatingManifest)
                        }
                        isExternalApp={isExternalApp}
                        isDeployChartView={isDeployChartView}
                        isCreateValueView={isCreateValueView}
                        appId={appId}
                        appName={
                            isExternalApp
                                ? commonState.releaseInfo.deployedAppDetail.appName
                                : commonState.installedConfig.appName
                        }
                        valuesText={commonState.modifiedValuesYaml}
                        defaultValuesText={
                            isExternalApp
                                ? YAMLStringify(JSON.parse(commonState.releaseInfo.mergedValues))
                                : commonState.installedConfig?.valuesOverrideYaml
                        }
                        onChange={onEditorValueChange}
                        repoChartValue={commonState.repoChartValue}
                        showEditorHeader={commonState.openReadMe}
                        hasChartChanged={hasChartChanged()}
                        showInfoText={!commonState.openReadMe && !commonState.openComparison}
                        manifestView={commonState.activeTab === 'manifest'}
                        generatedManifest={commonState.generatedManifest}
                        comparisonView={commonState.openComparison}
                        chartValuesList={chartValuesList}
                        deploymentHistoryList={commonState.deploymentHistoryArr}
                        selectedChartValues={commonState.chartValues}
                    />
                )}
            </div>
        )
    }
    const handleValueNameChange = (newValueName: string) => {
        const validatedValueName = validationRules.appName(newValueName)
        if (!validatedValueName.isValid && commonState.invalidAppNameMessage !== validatedValueName.message) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidValueName: true,
                    invalidValueNameMessage: validatedValueName.message,
                },
            })
        } else if (validatedValueName.isValid) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidValueName: false,
                    invalidValueNameMessage: '',
                },
            })
        }
        setValueName(newValueName)
    }

    const handleConnectToChartClick = (): void => {
        dispatch({
            type: ChartValuesViewActionTypes.showRepoSelector,
            payload: true,
        })
    }

    const hideConnectToChartTippy = () => {
        dispatch({
            type: ChartValuesViewActionTypes.showConnectToChartTippy,
            payload: false,
        })
    }

    const renderConnectToHelmChart = (): JSX.Element => {
        return (
            <div className="flex left mt-8">
                <LinkIcon className="connect-to-chart-icon icon-dim-16 mr-8" />
                <span className="fs-13 fw-6 lh-20">Connect to helm chart</span>
            </div>
        )
    }

    const getHelmAppMetaInfoRes = async (): Promise<void> => {
        try {
            setProjectLoading(true)
            const { result } = await getHelmAppMetaInfo(appId)
            if (result) {
                setAppMetaInfo(result)
            }
        } catch (err) {
            showError(err)
        } finally {
            setProjectLoading(false)
        }
    }

    const toggleChangeProjectModal = () => {
        setShowUpdateAppModal(!showUpdateAppModal)
    }

    const renderGeneratedDownloadManifest = (): JSX.Element => {
        return (
            isVirtualEnvironmentOnSelector &&
            GeneratedHelmDownload && (
                <div>
                    <GeneratedHelmDownload />
                    <div className="chart-values-view__hr-divider bcn-1 mt-16 mb-16" />
                </div>
            )
        )
    }

    const renderData = () => {
        const deployedAppDetail = isExternalApp && appId && appId.split('|')
        const showDeploymentTools =
            !isExternalApp &&
            !isCreateValueView &&
            !isVirtualEnvironmentOnSelector &&
            (!isDeployChartView || allowedDeploymentTypes.length > 0) &&
            !appDetails?.isVirtualEnvironment
        return (
            <div
                className={`chart-values-view__container flexbox-col h-100 bcn-0 dc__overflow-hidden ${
                    isDeployChartView || isCreateValueView ? 'chart-values-view__deploy-chart' : ''
                } ${commonState.openReadMe ? 'readmeOpened' : ''} ${
                    commonState.openComparison ? 'comparisonOpened' : ''
                }`}
            >
                {renderValuesTabsContainer()}
                <div className="chart-values-view__wrapper flexbox flex-grow-1 dc__overflow-hidden">
                    <div className="flexbox-col dc__gap-12 chart-values-view__details dc__border-right dc__overflow-scroll">
                        {isCreateValueView && (
                            <ValueNameInput
                                valueName={valueName}
                                handleValueNameChange={handleValueNameChange}
                                handleValueNameOnBlur={handleNameOnBlur}
                                invalidValueName={commonState.invalidValueName}
                                invalidValueNameMessage={commonState.invalidValueNameMessage}
                                valueNameDisabled={chartValueId !== '0'}
                            />
                        )}
                        {isDeployChartView && (
                            <AppNameInput
                                appName={appName}
                                handleAppNameChange={handleAppNameChange}
                                handleAppNameOnBlur={handleNameOnBlur}
                                invalidAppName={commonState.invalidAppName}
                                invalidAppNameMessage={commonState.invalidAppNameMessage}
                            />
                        )}

                        {!isDeployChartView && !isCreateValueView && (
                            <div className="w-100">
                                <div className="fs-12 fw-4 lh-20 cn-7" data-testid="project-heading">
                                    Project
                                </div>
                                <div
                                    className="flex left dc__content-space fs-13 fw-6 lh-20 cn-9"
                                    data-testid="project-value"
                                >
                                    {appMetaInfo?.projectName ? appMetaInfo.projectName : 'unassigned'}
                                    <Edit
                                        className="icon-dim-20 cursor"
                                        onClick={toggleChangeProjectModal}
                                        data-testid="edit-project-icon"
                                    />
                                </div>
                            </div>
                        )}

                        {!isDeployChartView && showUpdateAppModal && !isCreateValueView && (
                            <div className="app-overview-container display-grid bcn-0 dc__overflow-hidden">
                                <ProjectUpdateModal
                                    appId={appId}
                                    appMetaInfo={appMetaInfo}
                                    installedAppId={commonState.installedConfig?.installedAppId}
                                    onClose={toggleChangeProjectModal}
                                    projectList={commonState.projects}
                                    getAppMetaInfoRes={getHelmAppMetaInfoRes}
                                />
                            </div>
                        )}

                        {isDeployChartView && (
                            <ChartProjectSelector
                                selectedProject={commonState.selectedProject}
                                handleProjectSelection={handleProjectSelection}
                                projects={commonState.projects}
                                invalidProject={commonState.invalidProject}
                            />
                        )}
                        {(isDeployChartView ||
                            (!isDeployChartView && (isExternalApp || commonState.selectedEnvironment))) && (
                            <ChartEnvironmentSelector
                                isExternal={isExternalApp}
                                isDeployChartView={isDeployChartView}
                                installedAppInfo={commonState.installedAppInfo}
                                releaseInfo={commonState.releaseInfo}
                                isUpdate={!!isUpdate}
                                selectedEnvironment={commonState.selectedEnvironment}
                                handleEnvironmentSelection={handleEnvironmentSelection}
                                environments={commonState.environments}
                                invalidEnvironment={commonState.invalidaEnvironment}
                                isVirtualEnvironmentOnSelector={isVirtualEnvironmentOnSelector}
                                isVirtualEnvironment={appDetails?.isVirtualEnvironment}
                            />
                        )}
                        {!window._env_.HIDE_GITOPS_OR_HELM_OPTION && showDeploymentTools && (
                            <DeploymentAppSelector
                                commonState={commonState}
                                isUpdate={isUpdate}
                                handleDeploymentAppTypeSelection={handleDeploymentAppTypeSelection}
                                isDeployChartView={isDeployChartView}
                                allowedDeploymentTypes={allowedDeploymentTypes}
                                gitRepoURL={installedConfigFromParent['gitRepoURL']}
                                allowedCustomBool={allowedCustomBool}
                            />
                        )}
                        {allowedCustomBool && showDeploymentTools && (
                            <GitOpsDrawer
                                commonState={commonState}
                                deploymentAppType={commonState.deploymentAppType}
                                allowedDeploymentTypes={allowedDeploymentTypes}
                                staleData={staleData}
                                setStaleData={setStaleData}
                                dispatch={dispatch}
                                isDrawerOpen={isDrawerOpen}
                                handleDrawerState={handleDrawerState}
                                showRepoSelector={showRepoSelector}
                                allowedCustomBool={allowedCustomBool}
                            />
                        )}
                        {/**
                         * ChartRepoSelector will be displayed only when,
                         * - It's not a deploy chart view
                         * - It's not an external app values view
                         * - It's an external app which is,
                         *   i. Already linked to a chart repo
                         *  ii. Not already linked but connect to repo action is performed (showRepoSelector is set to true)
                         */}
                        {!isDeployChartView &&
                            (!isExternalApp || commonState.installedAppInfo || commonState.showRepoSelector) && (
                                <ChartRepoSelector
                                    isExternal={isExternalApp}
                                    isUpdate={!!isUpdate}
                                    installedAppInfo={commonState.installedAppInfo}
                                    handleRepoChartValueChange={handleRepoChartValueChange}
                                    repoChartValue={commonState.repoChartValue}
                                    chartDetails={commonState.repoChartValue}
                                    showConnectToChartTippy={commonState.showConnectToChartTippy}
                                    hideConnectToChartTippy={hideConnectToChartTippy}
                                />
                            )}

                        {!isDeployChartView &&
                            isExternalApp &&
                            !commonState.installedAppInfo &&
                            !commonState.showRepoSelector && (
                                <InfoColourBar
                                    message={CONNECT_TO_HELM_CHART_TEXTS.Message}
                                    classname="connect-to-chart-wrapper info_bar"
                                    Icon={InfoIcon}
                                    linkOnClick={handleConnectToChartClick}
                                    linkText={renderConnectToHelmChart()}
                                />
                            )}
                        {renderGeneratedDownloadManifest()}
                        {(!isExternalApp ||
                            commonState.installedAppInfo ||
                            commonState.repoChartValue?.chartRepoName) && (
                            <ChartVersionValuesSelector
                                isUpdate={isUpdate}
                                selectedVersion={commonState.selectedVersion}
                                selectedVersionUpdatePage={commonState.selectedVersionUpdatePage}
                                handleVersionSelection={handleVersionSelection}
                                chartVersionsData={commonState.chartVersionsData}
                                chartVersionObj={commonState.chartVersionsData.find(
                                    (_chartVersion) => _chartVersion.id === commonState.selectedVersion,
                                )}
                                chartValuesList={chartValuesList}
                                chartValues={commonState.chartValues}
                                redirectToChartValues={redirectToChartValues}
                                handleChartValuesSelection={handleChartValuesSelection}
                                hideVersionFromLabel={
                                    isExternalApp &&
                                    !commonState.installedAppInfo &&
                                    commonState.chartValues.kind === ChartKind.EXISTING
                                }
                                hideCreateNewOption={isCreateValueView}
                            />
                        )}
                        {window._env_.ENABLE_RESOURCE_SCAN_V2 &&
                            !isExternalApp &&
                            (isDeployChartView || isUpdateAppView) &&
                            ToggleSecurityScan && (
                                <ToggleSecurityScan
                                    isManifestScanEnabled={commonState.isManifestScanEnabled}
                                    handleToggleSecurityScan={handleToggleSecurityScan}
                                />
                            )}
                        {!isDeployChartView &&
                            chartValueId !== '0' &&
                            !(
                                deployedAppDetail &&
                                checkIfDevtronOperatorHelmRelease(
                                    deployedAppDetail[2],
                                    deployedAppDetail[1],
                                    deployedAppDetail[0],
                                )
                            ) && (
                                <DeleteApplicationButton
                                    type={isCreateValueView ? 'preset value' : 'Application'}
                                    isUpdateInProgress={commonState.isUpdateInProgress}
                                    isDeleteInProgress={commonState.isDeleteInProgress}
                                    dispatch={dispatch}
                                />
                            )}
                    </div>
                    {commonState.openReadMe && (
                        <ActiveReadmeColumn
                            fetchingReadMe={commonState.fetchingReadMe}
                            activeReadMe={commonState.fetchedReadMe.get(commonState.selectedVersionUpdatePage?.id || 0)}
                        />
                    )}
                    {commonState.activeTab === 'gui' ? (
                        <ChartValuesGUIForm
                            schemaJson={commonState.schemaJson}
                            valuesYamlDocument={commonState.valuesYamlDocument}
                            fetchingSchemaJson={commonState.fetchingReadMe}
                            isUpdateInProgress={commonState.isUpdateInProgress}
                            isDeleteInProgress={commonState.isDeleteInProgress}
                            deployOrUpdateApplication={deployOrUpdateApplication}
                            dispatch={dispatch}
                            formValidationError={commonState.formValidationError}
                        />
                    ) : (
                        renderChartValuesEditor()
                    )}
                </div>
                <footer className="flexbox dc__content-end dc__border-top px-16 py-10">
                    <UpdateApplicationButton
                        isUpdateInProgress={commonState.isUpdateInProgress}
                        isDeleteInProgress={commonState.isDeleteInProgress}
                        isDeployChartView={isDeployChartView}
                        isCreateValueView={isCreateValueView}
                        deployOrUpdateApplication={deployOrUpdateApplication}
                    />
                </footer>
                {commonState.showDeleteAppConfirmationDialog && (
                    <DeleteChartDialog
                        appName={
                            (isCreateValueView && valueName) ||
                            (isExternalApp && commonState.releaseInfo.deployedAppDetail.appName) ||
                            commonState.installedConfig?.appName
                        }
                        handleDelete={() => deleteApplication(DELETE_ACTION.DELETE)}
                        toggleConfirmation={() => {
                            dispatch({
                                type: ChartValuesViewActionTypes.showDeleteAppConfirmationDialog,
                                payload: false,
                            })
                        }}
                        disableButton={commonState.isDeleteInProgress}
                        isCreateValueView={isCreateValueView}
                    />
                )}
                {commonState.forceDeleteData.forceDelete && (
                    <ForceDeleteDialog
                        forceDeleteDialogTitle={commonState.forceDeleteData.title}
                        forceDeleteDialogMessage={commonState.forceDeleteData.message}
                        onClickDelete={() => deleteApplication(DELETE_ACTION.FORCE_DELETE)}
                        closeDeleteModal={() => {
                            dispatch({
                                type: ChartValuesViewActionTypes.multipleOptions,
                                payload: {
                                    showDeleteAppConfirmationDialog: false,
                                    forceDeleteData: {
                                        forceDelete: false,
                                        title: '',
                                        message: '',
                                    },
                                },
                            })
                        }}
                    />
                )}
                {commonState.nonCascadeDeleteData.nonCascade && (
                    <ClusterNotReachableDailog
                        clusterName={commonState.nonCascadeDeleteData.clusterName}
                        onClickCancel={onClickHideNonCascadeDeletePopup}
                        onClickDelete={onClickNonCascadeDelete}
                    />
                )}
                {commonState.showNoGitOpsWarning && (
                    <NoGitOpsConfiguredWarning
                        closePopup={() =>
                            dispatch({
                                type: ChartValuesViewActionTypes.showNoGitOpsWarning,
                                payload: false,
                            })
                        }
                    />
                )}
                <Prompt
                    when={enablePrompt}
                    message={isFormDirty ? UNSAVED_CHANGES_PROMPT_MESSAGE : DEFAULT_ROUTE_PROMPT_MESSAGE}
                />
            </div>
        )
    }

    if (commonState.isLoading || isProjectLoading) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    }
    if (commonState.errorResponseCode) {
        return (
            <div className="dc__height-reduce-48">
                <ErrorScreenManager code={commonState.errorResponseCode} />
            </div>
        )
    }

    return !isExternalApp || (commonState.releaseInfo && commonState.repoChartValue) ? renderData() : <></>
}

export default ChartValuesView

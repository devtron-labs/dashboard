import React, { useState, useEffect, useContext, useReducer } from 'react'
import { useHistory, useRouteMatch, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { showError, Progressing, ErrorScreenManager, RadioGroup, useJsonYaml, ConditionalWrap } from '../../../common'
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
import { ServerErrors } from '../../../../modals/commonTypes'
import { SERVER_MODE, URLS } from '../../../../config'
import YAML from 'yaml'
import {
    ChartEnvironmentSelector,
    ChartRepoSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartValuesEditor,
    AppNotLinkedDialog,
    ChartProjectSelector,
    ChartVersionValuesSelector,
    DeleteApplicationButton,
    UpdateApplicationButton,
    AppNameInput,
    ErrorScreenWithInfo,
    ValueNameInput,
} from './ChartValuesView.component'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import {
    fetchChartVersionsData,
    fetchProjectsAndEnvironments,
    getChartRelatedReadMe,
    getChartValuesList,
} from '../common/chartValues.api'
import { getChartValuesURL, getSavedValuesListURL } from '../../../charts/charts.helper'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Arrows } from '../../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import {
    ChartDeploymentHistoryResponse,
    getDeploymentHistory,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { mainContext } from '../../../common/navigation/NavigationRoutes'
import ForceDeleteDialog from '../../../common/dialogs/ForceDeleteDialog'
import {
    ChartEnvironmentOptionType,
    ChartKind,
    ChartValuesOptionType,
    ChartValuesViewActionTypes,
    ChartValuesViewType,
} from './ChartValuesView.type'
import { chartValuesReducer, initState } from './ChartValuesView.reducer'
import { ValidationRules } from '../../../app/create/validationRules'
import { convertSchemaJsonToMap, getAndUpdateSchemaValue, updateGeneratedManifest } from './ChartValuesView.utils'
import { getAppId } from '../../appDetails/k8Resource/nodeDetail/nodeDetail.api'
import ChartValuesGUIForm from './ChartValuesGUIView'
import './ChartValuesView.scss'
import { isGitOpsModuleInstalledAndConfigured } from '../../../../services/service'
import NoGitOpsConfiguredWarning from '../../../workflowEditor/NoGitOpsConfiguredWarning'

function ChartValuesView({
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
}: ChartValuesViewType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const { chartValueId, presetValueId } = useParams<{ chartValueId: string; presetValueId: string }>()
    const { serverMode } = useContext(mainContext)
    const [chartValuesList, setChartValuesList] = useState<ChartValuesType[]>(chartValuesListFromParent || [])
    const [appName, setAppName] = useState('')
    const [valueName, setValueName] = useState('')
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
        ),
    )
    const [obj] = useJsonYaml(commonState.modifiedValuesYaml, 4, 'yaml', true)
    const isUpdate = isExternalApp || (commonState.installedConfig?.environmentId && commonState.installedConfig.teamId)
    const validationRules = new ValidationRules()

    const checkGitOpsConfiguration= async ():Promise<void>=> {
      try {
          const { result } = await isGitOpsModuleInstalledAndConfigured()
          if (result.isInstalled && !result.isConfigured) {
              dispatch({
                  type: ChartValuesViewActionTypes.showNoGitOpsWarning,
                  payload: true,
              })
          }
      } catch (error) {}
    }

    useEffect(() => {
        if (isDeployChartView || isCreateValueView) {
          checkGitOpsConfiguration()
            fetchProjectsAndEnvironments(serverMode, dispatch)
            getAndUpdateSchemaValue(
                commonState.installedConfig.rawValues,
                convertSchemaJsonToMap(commonState.installedConfig.valuesSchemaJson),
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
                            activeTab:
                                !_releaseInfo.valuesSchemaJson || presetValueId || isCreateValueView ? 'yaml' : 'gui',
                        },
                    })

                    if (_installedAppInfo) {
                        initData(_installedAppInfo, _releaseInfo)
                    } else {
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

                        const _valuesYaml = YAML.stringify(JSON.parse(_releaseInfo.mergedValues))
                        getAndUpdateSchemaValue(
                            _valuesYaml,
                            convertSchemaJsonToMap(_releaseInfo.valuesSchemaJson),
                            dispatch,
                        )
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
                convertSchemaJsonToMap(commonState.installedConfig.valuesSchemaJson),
                dispatch,
            )
            getChartValuesList(appDetails.appStoreChartId, setChartValuesList)
            fetchChartVersionsData(appDetails.appStoreChartId, dispatch, appDetails.appStoreAppVersion)
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
                    dispatch({
                        type: ChartValuesViewActionTypes.deploymentHistoryArr,
                        payload: _deploymentHistoryArr,
                    })
                })
                .catch((e) => {})
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
                            setValueName(response.result.name)
                            _valueName = response.result.name
                        }

                        if (
                            ((isExternalApp || (!isDeployChartView && !isCreateValueView)) &&
                                commonState.installedConfig) ||
                            (isDeployChartView && commonState.selectedEnvironment)
                        ) {
                            updateGeneratedManifest(
                                isCreateValueView,
                                isExternalApp,
                                isDeployChartView,
                                appName,
                                _valueName,
                                commonState,
                                commonState.chartValues.appStoreVersionId || commonState.chartValues.id,
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
                        modifiedValuesYaml: YAML.stringify(JSON.parse(commonState.releaseInfo.mergedValues)),
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
            const environment = (commonState.environments as ChartValuesOptionType[]).find(
                (e) => e.value.toString() === commonState.installedConfig.environmentId.toString(),
            )
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
                isExternalApp,
                isDeployChartView,
                appName,
                valueName,
                commonState,
                appStoreApplicationVersionId,
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
            }

            getChartValuesList(_repoChartValue.chartId, setChartValuesList)
            fetchChartVersionsData(_repoChartValue.chartId, dispatch, _releaseInfo.deployedAppDetail.chartVersion)
            getAndUpdateSchemaValue(
                result?.valuesOverrideYaml,
                convertSchemaJsonToMap(_releaseInfo.valuesSchemaJson),
                dispatch,
            )

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
                },
            })
        } catch (e) {
            dispatch({ type: ChartValuesViewActionTypes.isLoading, payload: false })
        }
    }

    const handleRepoChartValueChange = (event) => {
        dispatch({ type: ChartValuesViewActionTypes.repoChartValue, payload: event })

        if (isExternalApp) {
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
        } else {
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

    const deleteApplication = (force?: boolean) => {
        if (commonState.isDeleteInProgress) {
            return
        }

        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                isDeleteInProgress: true,
                showDeleteAppConfirmationDialog: false,
            },
        })
        getDeleteApplicationApi(force)
            .then(() => {
                dispatch({
                    type: ChartValuesViewActionTypes.isDeleteInProgress,
                    payload: false,
                })
                toast.success('Successfully deleted.')
                history.push(
                    isCreateValueView
                        ? getSavedValuesListURL(installedConfigFromParent.appStoreId)
                        : `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`,
                )
            })
            .catch((error) => {
                if (!force && error.code !== 403) {
                    let forceDeleteTitle = '',
                        forceDeleteMessage = ''
                    if (error instanceof ServerErrors && Array.isArray(error.errors)) {
                        error.errors.map(({ userMessage, internalMessage }) => {
                            forceDeleteTitle = userMessage
                            forceDeleteMessage = internalMessage
                        })
                    }

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

    const getDeleteApplicationApi = (force?: boolean): Promise<any> => {
        if (isExternalApp && !commonState.installedAppInfo) {
            return deleteApplicationRelease(appId)
        } else if (isCreateValueView) {
            return deleteChartValues(parseInt(chartValueId))
        } else {
            return deleteInstalledChart(commonState.installedConfig.installedAppId, force)
        }
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
            (!_validatedAppName.isValid ||
                !commonState.selectedEnvironment ||
                (serverMode === SERVER_MODE.FULL && !commonState.selectedProject))
        ) {
            return false
        }

        return true
    }

    const _buildAppDetailUrl = (newInstalledAppId: number, newEnvironmentId: number) => {
        if (serverMode === SERVER_MODE.EA_ONLY) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId(
                commonState.selectedEnvironment.clusterId,
                commonState.selectedEnvironment.namespace,
                appName,
            )}/${appName}`
        }

        return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${newInstalledAppId}/env/${newEnvironmentId}/${URLS.APP_DETAILS}?newDeployment=true`
    }

    const deployOrUpdateApplication = async (forceUpdate?: boolean) => {
        if (commonState.isUpdateInProgress) {
            return
        }

        const validatedName = validationRules.appName(isCreateValueView ? valueName : appName)
        if (isCreateValueView && !validatedName.isValid) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidValueName: !validatedName.isValid,
                    invalidValueNameMessage: validatedName.message,
                },
            })
            toast.error('Some required fields are missing')
            return
        } else if (!isValidData(validatedName)) {
            dispatch({
                type: ChartValuesViewActionTypes.multipleOptions,
                payload: {
                    invalidAppName: !validatedName.isValid,
                    invalidAppNameMessage: validatedName.message,
                    invalidaEnvironment: !commonState.selectedEnvironment,
                    invalidProject: !commonState.selectedProject,
                },
            })
            toast.error('Some required fields are missing')
            return
        } else if (commonState.activeTab === 'gui' && commonState.schemaJson?.size) {
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
                toast.error('Some required fields are missing')
                return
            } else {
                dispatch({
                    type: ChartValuesViewActionTypes.formValidationError,
                    payload: {},
                })
            }
        }

        if (
            isExternalApp &&
            !forceUpdate &&
            !commonState.installedAppInfo &&
            !commonState.repoChartValue?.chartRepoName
        ) {
            dispatch({
                type: ChartValuesViewActionTypes.showAppNotLinkedDialog,
                payload: true,
            })
            return
        }

        // validate data
        try {
            JSON.stringify(YAML.parse(commonState.modifiedValuesYaml))
        } catch (err) {
            toast.error(`Encountered data validation error while updating. “${err}”`)
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

        try {
            let res, toastMessage

            if (isExternalApp && !commonState.installedAppInfo) {
                if (!forceUpdate) {
                    const payload: LinkToChartStoreRequest = {
                        appId: appId,
                        valuesYaml: commonState.modifiedValuesYaml,
                        appStoreApplicationVersionId: commonState.selectedVersionUpdatePage.id,
                        referenceValueId: commonState.selectedVersionUpdatePage.id,
                        referenceValueKind: commonState.chartValues.kind,
                    }
                    res = await linkToChartStore(payload)
                } else {
                    const payload: UpdateAppReleaseWithoutLinkingRequest = {
                        appId: appId,
                        valuesYaml: commonState.modifiedValuesYaml,
                    }
                    res = await updateAppReleaseWithoutLinking(payload)
                }
            } else if (isDeployChartView) {
                const payload = {
                    teamId: serverMode == SERVER_MODE.FULL ? commonState.selectedProject.value : 0,
                    referenceValueId: commonState.chartValues.id,
                    referenceValueKind: commonState.chartValues.kind,
                    environmentId: serverMode == SERVER_MODE.FULL ? commonState.selectedEnvironment.value : 0,
                    clusterId: commonState.selectedEnvironment.clusterId,
                    namespace: commonState.selectedEnvironment.namespace,
                    appStoreVersion: commonState.selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: commonState.modifiedValuesYaml,
                    appName: appName.trim(),
                }
                res = await installChart(payload)
            } else if (isCreateValueView) {
                const payload = {
                    name: valueName,
                    appStoreVersionId: commonState.selectedVersion,
                    values: commonState.modifiedValuesYaml,
                }
                if (chartValueId !== '0') {
                    payload['id'] = parseInt(chartValueId)
                    payload['chartVersion'] = commonState.chartValues.chartVersion
                    toastMessage = 'Chart Value Updated'
                    res = await updateChartValues(payload)
                } else {
                    toastMessage = 'Chart Value Created'
                    res = await createChartValues(payload)
                }
            } else {
                const payload: UpdateAppReleaseRequest = {
                    id: hasChartChanged() ? 0 : commonState.installedConfig.id,
                    referenceValueId: commonState.chartValues.id,
                    referenceValueKind: commonState.chartValues.kind,
                    valuesOverrideYaml: commonState.modifiedValuesYaml,
                    installedAppId: commonState.installedConfig.installedAppId,
                    appStoreVersion: commonState.selectedVersionUpdatePage.id,
                }
                res = await updateAppRelease(payload)
            }

            dispatch({
                type: ChartValuesViewActionTypes.isUpdateInProgress,
                payload: false,
            })

            if (isCreateValueView) {
                toast.success(toastMessage)
                history.push(getSavedValuesListURL(installedConfigFromParent.appStoreId))
            } else if (isDeployChartView && res?.result) {
                const {
                    result: { environmentId: newEnvironmentId, installedAppId: newInstalledAppId },
                } = res
                toast.success('Deployment initiated')
                history.push(_buildAppDetailUrl(newInstalledAppId, newEnvironmentId))
            } else if (res?.result && (res.result.success || res.result.appName)) {
                toast.success('Update and deployment initiated')
                history.push(`${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`)
            } else {
                toast.error('Some error occurred')
            }
        } catch (err) {
            showError(err)
            dispatch({
                type: ChartValuesViewActionTypes.isUpdateInProgress,
                payload: false,
            })
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
                    toast.error('Please provide the required inputs to view generated manifest')
                    return
                } else if (!isValidData(validatedName)) {
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
                    toast.error('Please provide the required inputs to view generated manifest')
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
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 ${
                    commonState.openReadMe ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => handleReadMeOptionClick(disabled)}
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
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 mr-8 ${
                    commonState.openComparison ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => handleComparisonOptionClick(disabled)}
            >
                {commonState.openComparison ? (
                    <Close className="option-close__icon icon-dim-16 mr-8" />
                ) : (
                    <Arrows className="option-open__icon icon-dim-16 mr-8" />
                )}
                {commonState.activeTab === 'manifest'
                    ? 'Compare with deployed'
                    : commonState.openComparison
                    ? 'Hide comparison'
                    : 'Compare values'}
            </span>
        )
    }

    const renderValuesTabs = () => {
        return (
            <RadioGroup
                className="gui-yaml-switch"
                name="yaml-mode"
                initialTab={
                    presetValueId || isCreateValueView
                        ? 'yaml'
                        : (isExternalApp && !!commonState.releaseInfo?.valuesSchemaJson) ||
                          !!commonState.installedConfig?.valuesSchemaJson
                        ? 'gui'
                        : 'yaml'
                }
                disabled={false}
                onChange={handleTabSwitch}
            >
                <RadioGroup.Radio value="gui">GUI (Beta)</RadioGroup.Radio>
                <RadioGroup.Radio value="yaml">
                    <Edit className="icon-dim-12 mr-6" />
                    YAML
                </RadioGroup.Radio>
                <RadioGroup.Radio
                    value="manifest"
                    showTippy={isExternalApp && !commonState.installedAppInfo}
                    canSelect={isValidData()}
                    tippyContent={
                        'Manifest is generated only for apps linked to a helm chart. Link this app to a helm chart to view generated manifest.'
                    }
                    isDisabled={isExternalApp && !commonState.installedAppInfo}
                >
                    Manifest output
                </RadioGroup.Radio>
            </RadioGroup>
        )
    }

    const getComparisonTippyContent = () => {
        if (commonState.isComparisonAvailable) {
            return isCreateValueView
                ? 'Compare values with other values of this chart'
                : isDeployChartView
                ? 'Compare values with other deployments of this chart'
                : 'Compare values with previous deployments of this app or other deployments of this chart'
        }

        return (
            <>
                <h2 className="fs-12 fw-6 lh-18 m-0">Nothing to compare with</h2>
                <p className="fs-12 fw-4 lh-18 m-0">No applications found using this chart</p>
            </>
        )
    }

    const renderValuesTabsContainer = () => {
        return (
            <div className="chart-values-view__tabs-container flex dc__content-space">
                {renderValuesTabs()}
                <div className="flex">
                    {(commonState.activeTab === 'yaml' || (commonState.activeTab === 'manifest' && isExternalApp)) && (
                        <ConditionalWrap
                            condition={commonState.activeTab === 'manifest'}
                            wrap={() => renderComparisonOption()}
                        >
                            <Tippy
                                className="default-tt w-200"
                                arrow={false}
                                placement="bottom"
                                content={getComparisonTippyContent()}
                            >
                                {renderComparisonOption(!commonState.isComparisonAvailable)}
                            </Tippy>
                        </ConditionalWrap>
                    )}
                    {commonState.activeTab !== 'manifest' && (
                        <ConditionalWrap
                            condition={
                                !commonState.openReadMe &&
                                (commonState.fetchingReadMe ||
                                    !commonState.isReadMeAvailable ||
                                    !commonState.fetchedReadMe.get(commonState.selectedVersionUpdatePage?.id || 0))
                            }
                            wrap={() => (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={
                                        commonState.fetchingReadMe
                                            ? 'Fetching...'
                                            : 'Readme is not available for this chart'
                                    }
                                >
                                    {renderReadMeOption(true)}
                                </Tippy>
                            )}
                        >
                            {renderReadMeOption()}
                        </ConditionalWrap>
                    )}
                </div>
            </div>
        )
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
        dispatch({ type: ChartValuesViewActionTypes.selectedEnvironment, payload: selected })

        if (commonState.invalidaEnvironment) {
            dispatch({
                type: ChartValuesViewActionTypes.invalidaEnvironment,
                payload: false,
            })
        }
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
                isExternalApp,
                isDeployChartView,
                appName,
                valueName,
                commonState,
                commonState.chartValues.appStoreVersionId || commonState.chartValues.id,
                commonState.modifiedValuesYaml,
                dispatch,
            )
        }
    }

    const renderChartValuesEditor = () => {
        return (
            <div
                className={`chart-values-view__editor ${
                    commonState.openReadMe || commonState.openComparison ? 'chart-values-view__full-mode' : ''
                }`}
            >
                {commonState.activeTab === 'manifest' && commonState.valuesEditorError ? (
                    <ErrorScreenWithInfo info={commonState.valuesEditorError} />
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
                                ? YAML.stringify(JSON.parse(commonState.releaseInfo.mergedValues))
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
                {!commonState.openComparison && !commonState.openReadMe && (
                    <UpdateApplicationButton
                        isUpdateInProgress={commonState.isUpdateInProgress}
                        isDeleteInProgress={commonState.isDeleteInProgress}
                        isDeployChartView={isDeployChartView}
                        isCreateValueView={isCreateValueView}
                        deployOrUpdateApplication={deployOrUpdateApplication}
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

    const renderData = () => {
        return (
            <div
                className={`chart-values-view__container bcn-0 ${
                    isDeployChartView || isCreateValueView ? 'chart-values-view__deploy-chart' : ''
                } ${commonState.openReadMe ? 'readmeOpened' : ''} ${
                    commonState.openComparison ? 'comparisonOpened' : ''
                }`}
            >
                {renderValuesTabsContainer()}
                <div className="chart-values-view__hr-divider bcn-2" />
                <div className="chart-values-view__wrapper">
                    <div className="chart-values-view__details">
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
                        {!isExternalApp &&
                            ((!isDeployChartView && commonState.selectedProject) ||
                                (isDeployChartView && serverMode === SERVER_MODE.FULL)) && (
                                <ChartProjectSelector
                                    isDeployChartView={isDeployChartView}
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
                                invalidaEnvironment={commonState.invalidaEnvironment}
                            />
                        )}
                        <div className="chart-values-view__hr-divider bcn-1 mt-16 mb-16" />
                        {!isDeployChartView && (
                            <ChartRepoSelector
                                isExternal={isExternalApp}
                                isUpdate={!!isUpdate}
                                installedAppInfo={commonState.installedAppInfo}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                repoChartValue={commonState.repoChartValue}
                                chartDetails={commonState.repoChartValue}
                            />
                        )}
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
                        {!isDeployChartView && chartValueId !== '0' && (
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
                    {!commonState.openComparison && <div className="chart-values-view__vr-divider bcn-2" />}
                    {commonState.activeTab === 'gui' ? (
                        <ChartValuesGUIForm
                            schemaJson={commonState.schemaJson}
                            valuesYamlDocument={commonState.valuesYamlDocument}
                            fetchingSchemaJson={commonState.fetchingReadMe}
                            openReadMe={commonState.openReadMe}
                            isUpdateInProgress={commonState.isUpdateInProgress}
                            isDeleteInProgress={commonState.isDeleteInProgress}
                            isDeployChartView={isDeployChartView}
                            isCreateValueView={isCreateValueView}
                            deployOrUpdateApplication={deployOrUpdateApplication}
                            dispatch={dispatch}
                            formValidationError={commonState.formValidationError}
                        />
                    ) : (
                        renderChartValuesEditor()
                    )}
                </div>
                {commonState.showDeleteAppConfirmationDialog && (
                    <DeleteChartDialog
                        appName={
                            (isCreateValueView && valueName) ||
                            (isExternalApp && commonState.releaseInfo.deployedAppDetail.appName) ||
                            commonState.installedConfig?.appName
                        }
                        handleDelete={deleteApplication}
                        toggleConfirmation={() => {
                            dispatch({
                                type: ChartValuesViewActionTypes.showDeleteAppConfirmationDialog,
                                payload: false,
                            })
                        }}
                        isCreateValueView
                    />
                )}
                {commonState.forceDeleteData.forceDelete && (
                    <ForceDeleteDialog
                        forceDeleteDialogTitle={commonState.forceDeleteData.title}
                        forceDeleteDialogMessage={commonState.forceDeleteData.message}
                        onClickDelete={() => deleteApplication(true)}
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
                {commonState.showAppNotLinkedDialog && (
                    <AppNotLinkedDialog
                        close={() =>
                            dispatch({
                                type: ChartValuesViewActionTypes.showAppNotLinkedDialog,
                                payload: false,
                            })
                        }
                        update={deployOrUpdateApplication}
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
            </div>
        )
    }

    if (commonState.isLoading) {
        return (
            <div className="dc__loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    } else if (commonState.errorResponseCode) {
        return (
            <div className="dc__loading-wrapper">
                <ErrorScreenManager code={commonState.errorResponseCode} />
            </div>
        )
    }

    return !isExternalApp || (commonState.releaseInfo && commonState.repoChartValue) ? renderData() : <></>
}

export default ChartValuesView

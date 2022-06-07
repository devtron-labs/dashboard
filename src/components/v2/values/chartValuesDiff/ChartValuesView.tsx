import React, { useState, useEffect, useContext, useReducer } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { toast } from 'react-toastify'
import { showError, Progressing, ErrorScreenManager, RadioGroup, useJsonYaml } from '../../../common'
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
    ReleaseAndInstalledAppInfo,
} from '../../../external-apps/ExternalAppService'
import {
    deleteInstalledChart,
    getChartValues,
    getChartVersionDetails2,
    installChart,
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
} from './ChartValuesView.component'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import {
    fetchChartVersionsData,
    fetchProjectsAndEnvironments,
    getChartRelatedReadMe,
    getChartValuesList,
    getGeneratedHelManifest,
} from '../common/chartValues.api'
import { getChartValuesURL } from '../../../charts/charts.helper'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Arrows } from '../../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import {
    ChartDeploymentDetail,
    ChartDeploymentHistoryResponse,
    getDeploymentHistory,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { mainContext } from '../../../common/navigation/NavigationRoutes'
import ForceDeleteDialog from '../../../common/dialogs/ForceDeleteDialog'
import {
    ChartEnvironmentOptionType,
    ChartProjectAndEnvironmentType,
    ChartValuesOptionType,
    ChartValuesViewType,
    ForceDeleteDataType,
} from './ChartValuesView.type'
import './ChartValuesView.scss'
import { chartValuesReducer, initState } from './ChartValuesView.reducer'
import { ValidationRules } from '../../../app/create/validationRules'

function ChartValuesView({
    appId,
    isExternalApp,
    isDeployChartView,
    installedConfigFromParent,
    appDetails,
    chartValuesListFromParent = [],
    chartVersionsDataFromParent = [],
    chartValuesFromParent,
    selectedVersionFromParent,
}: ChartValuesViewType) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const [isUpdateInProgress, setUpdateInProgress] = useState(false)
    const [isDeleteInProgress, setDeleteInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [releaseAndInstalledAppInfo, setReleaseAndInstalledAppInfo] = useState<ReleaseAndInstalledAppInfo>({
        releaseInfo: null,
        installedAppInfo: null,
    })
    const [showDeleteAppConfirmationDialog, setShowDeleteAppConfirmationDialog] = useState(false)
    const [showAppNotLinkedDialog, setShowAppNotLinkedDialog] = useState(false)
    const [projectsAndEnvironments, setProjectsAndEnvironment] = useState<ChartProjectAndEnvironmentType>({
        projects: [],
        environments: [],
    })
    const [chartVersionsData, setChartVersionsData] = useState<ChartVersionType[]>(chartVersionsDataFromParent || [])
    const [chartValuesList, setChartValuesList] = useState<ChartValuesType[]>(chartValuesListFromParent || [])
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<ChartDeploymentDetail[]>([])
    const [forceDeleteData, setForceDeleteData] = useState<ForceDeleteDataType>({
        forceDelete: false,
        title: '',
        message: '',
    })
    const [appName, setAppName] = useState('')
    const [chartValidations, setChartValidations] = useState<{
        invalidAppName: boolean
        invalidAppNameMessage: string
        invalidaEnvironment: boolean
        invalidProject: boolean
    }>({
        invalidAppName: false,
        invalidAppNameMessage: '',
        invalidaEnvironment: false,
        invalidProject: false,
    })
    const [commonState, dispatch] = useReducer(
        chartValuesReducer,
        initState(selectedVersionFromParent, chartValuesFromParent, installedConfigFromParent),
    )
    const isUpdate = isExternalApp || (commonState.installedConfig?.environmentId && commonState.installedConfig.teamId)
    const { serverMode } = useContext(mainContext)
    const [obj] = useJsonYaml(commonState.modifiedValuesYaml, 4, 'yaml', true)
    const validationRules = new ValidationRules()

    useEffect(() => {
        if (isDeployChartView) {
            fetchProjectsAndEnvironments(serverMode, setProjectsAndEnvironment)
            const _fetchedReadMe = commonState.fetchedReadMe
            _fetchedReadMe.set(0, commonState.installedConfig.readme)

            dispatch({
                type: 'multipleOptions',
                payload: {
                    isLoading: false,
                    fetchedReadMe: _fetchedReadMe,
                },
            })
        } else if (!isExternalApp && !isDeployChartView) {
            fetchProjectsAndEnvironments(serverMode, setProjectsAndEnvironment)
            dispatch({ type: 'modifiedValuesYaml', payload: commonState.installedConfig.valuesOverrideYaml })

            const payload = {
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
                    kind: 'DEPLOYED',
                },
            }
            getChartValuesList(appDetails.appStoreChartId, setChartValuesList)
            fetchChartVersionsData(
                appDetails.appStoreChartId,
                setChartVersionsData,
                (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
                    dispatch({
                        type: 'multipleOptions',
                        payload: {
                            ...payload,
                            isLoading: false,
                            selectedVersion,
                            selectedVersionUpdatePage,
                        },
                    })
                },
                appDetails.appStoreAppVersion,
            )
        } else if (isExternalApp) {
            getReleaseInfo(appId)
                .then((releaseInfoResponse: ReleaseInfoResponse) => {
                    const _releaseInfo = releaseInfoResponse.result.releaseInfo
                    const _installedAppInfo = releaseInfoResponse.result.installedAppInfo
                    setReleaseAndInstalledAppInfo({
                        releaseInfo: _releaseInfo,
                        installedAppInfo: _installedAppInfo,
                    })

                    const _fetchedReadMe = commonState.fetchedReadMe
                    _fetchedReadMe.set(0, _releaseInfo.readme)

                    dispatch({
                        type: 'fetchedReadMe',
                        payload: _fetchedReadMe,
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
                            kind: 'EXISTING',
                            name: _releaseInfo.deployedAppDetail.appName,
                        }
                        setChartVersionsData([_chartVersionData])
                        setChartValuesList([_chartValues])
                        dispatch({
                            type: 'multipleOptions',
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
                                chartValues: _chartValues,
                                modifiedValuesYaml: YAML.stringify(JSON.parse(_releaseInfo.mergedValues)),
                            },
                        })
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setErrorResponseCode(errors.code)
                    dispatch({
                        type: 'isLoading',
                        payload: false,
                    })
                })
        }

        if (!isDeployChartView) {
            getDeploymentHistory(appId, isExternalApp)
                .then((deploymentHistoryResponse: ChartDeploymentHistoryResponse) => {
                    const _deploymentHistoryArr =
                        deploymentHistoryResponse.result?.deploymentHistory?.sort(
                            (a, b) => b.deployedAt.seconds - a.deployedAt.seconds,
                        ) || []
                    setDeploymentHistoryArr(_deploymentHistoryArr)
                })
                .catch((e) => {})
        }
    }, [])

    useEffect(() => {
        if (
            commonState.chartValues &&
            ((commonState.chartValues.id && commonState.chartValues.chartVersion) ||
                (isExternalApp && releaseAndInstalledAppInfo.releaseInfo))
        ) {
            dispatch({ type: 'fetchingValuesYaml', payload: true })
            if (commonState.chartValues.id && commonState.chartValues.chartVersion) {
                getChartValues(commonState.chartValues.id, commonState.chartValues.kind)
                    .then((response) => {
                        dispatch({
                            type: 'multipleOptions',
                            payload: {
                                fetchingValuesYaml: false,
                                modifiedValuesYaml: response.result.values || '',
                            },
                        })

                        if (
                            commonState.activeTab === 'manifest' &&
                            (!isExternalApp || (isExternalApp && releaseAndInstalledAppInfo.installedAppInfo)) &&
                            commonState.installedConfig
                        ) {
                            if (isDeployChartView) {
                                getGeneratedHelManifest(
                                    commonState.selectedEnvironment.value,
                                    commonState.selectedEnvironment.clusterId || commonState.installedConfig.clusterId,
                                    commonState.selectedEnvironment.namespace,
                                    appName,
                                    commonState.chartValues?.appStoreVersionId ||
                                        commonState.chartValues?.id ||
                                        commonState.installedConfig.appStoreVersion,
                                    response.result.values || commonState.modifiedValuesYaml,
                                    dispatch,
                                )
                            } else {
                                getGeneratedHelManifest(
                                    commonState.installedConfig.environmentId,
                                    commonState.installedConfig.clusterId,
                                    commonState.installedConfig.namespace,
                                    commonState.installedConfig.appName,
                                    commonState.chartValues?.appStoreVersionId ||
                                        commonState.chartValues?.id ||
                                        commonState.installedConfig.appStoreVersion,
                                    response.result.values || commonState.modifiedValuesYaml,
                                    dispatch,
                                )
                            }
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        dispatch({
                            type: 'fetchingValuesYaml',
                            payload: false,
                        })
                    })
            } else if (
                isExternalApp &&
                releaseAndInstalledAppInfo.releaseInfo.mergedValues &&
                releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName === commonState.chartValues.name
            ) {
                dispatch({
                    type: 'multipleOptions',
                    payload: {
                        fetchingValuesYaml: false,
                        modifiedValuesYaml: YAML.stringify(
                            JSON.parse(releaseAndInstalledAppInfo.releaseInfo.mergedValues),
                        ),
                    },
                })
            }
        }
    }, [commonState.chartValues])

    useEffect(() => {
        if (
            commonState.selectedVersionUpdatePage &&
            commonState.selectedVersionUpdatePage.id &&
            !commonState.fetchedReadMe.has(commonState.selectedVersionUpdatePage.id) &&
            commonState.activeTab !== 'manifest'
        ) {
            getChartRelatedReadMe(commonState.selectedVersionUpdatePage.id, commonState.fetchedReadMe, dispatch)
        }
    }, [commonState.selectedVersionUpdatePage, commonState.isReadMeAvailable])

    useEffect(() => {
        if (
            commonState.installedConfig &&
            commonState.installedConfig.environmentId &&
            commonState.installedConfig.teamId &&
            projectsAndEnvironments.environments.length > 0 &&
            projectsAndEnvironments.projects.length > 0
        ) {
            const project = projectsAndEnvironments.projects.find(
                (e) => e.value.toString() === commonState.installedConfig.teamId.toString(),
            )
            const environment = (projectsAndEnvironments.environments as ChartValuesOptionType[]).find(
                (e) => e.value.toString() === commonState.installedConfig.environmentId.toString(),
            )
            dispatch({
                type: 'multipleOptions',
                payload: {
                    selectedProject: project,
                    selectedEnvironment: environment,
                },
            })
        }
    }, [commonState.installedConfig, projectsAndEnvironments])

    useEffect(() => {
        if (
            commonState.activeTab === 'manifest' &&
            commonState.installedConfig &&
            (!commonState.generatedManifest ||
                (commonState.generatedManifest &&
                    (hasChartChanged() || commonState.chartValues.id !== commonState.installedConfig.id)))
        ) {
            if (isDeployChartView) {
                getGeneratedHelManifest(
                    commonState.selectedEnvironment.value,
                    commonState.selectedEnvironment.clusterId || commonState.installedConfig.clusterId,
                    commonState.selectedEnvironment.namespace,
                    appName,
                    commonState.chartValues?.appStoreVersionId ||
                        commonState.chartValues?.id ||
                        commonState.installedConfig.appStoreVersion,
                    commonState.installedConfig.valuesYaml,
                    dispatch,
                )
            } else {
                getGeneratedHelManifest(
                    commonState.installedConfig.environmentId,
                    commonState.installedConfig.clusterId,
                    commonState.installedConfig.namespace,
                    commonState.installedConfig.appName,
                    commonState.chartValues?.appStoreVersionId ||
                        commonState.chartValues?.id ||
                        commonState.installedConfig.appStoreVersion,
                    isExternalApp
                        ? releaseAndInstalledAppInfo.releaseInfo.mergedValues
                        : commonState.installedConfig.valuesOverrideYaml,
                    dispatch,
                )
            }
        }
    }, [commonState.activeTab, commonState.installedConfig])

    useEffect(() => {
        if (chartValuesList.length > 0 || deploymentHistoryArr.length > 0) {
            const isVersionAvailableForDiff =
                chartValuesList.some((_chartValues) => _chartValues.kind === 'DEPLOYED') ||
                deploymentHistoryArr.length > 0

            dispatch({ type: 'isComparisonAvailable', payload: isVersionAvailableForDiff })
        }
    }, [chartValuesList, deploymentHistoryArr])

    const initData = async (_installedAppInfo: InstalledAppInfo, _releaseInfo: ReleaseInfo) => {
        try {
            const { result } = await getChartVersionDetails2(_installedAppInfo.installedAppVersionId)
            const _repoChartValue = {
                appStoreApplicationVersionId: result?.appStoreVersion,
                chartRepoName: _installedAppInfo.appStoreChartRepoName,
                chartId: _installedAppInfo.appStoreChartId,
                chartName: _installedAppInfo.appStoreChartName,
                version: _releaseInfo.deployedAppDetail.chartVersion,
                deprecated: result?.deprecated,
            }

            getChartValuesList(_repoChartValue.chartId, setChartValuesList)
            fetchChartVersionsData(
                _repoChartValue.chartId,
                setChartVersionsData,
                (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
                    dispatch({
                        type: 'multipleOptions',
                        payload: {
                            repoChartValue: _repoChartValue,
                            chartValues: {
                                id: _installedAppInfo.installedAppVersionId,
                                appStoreVersionId: result?.appStoreVersion,
                                kind: 'DEPLOYED',
                                name: _releaseInfo.deployedAppDetail.appName,
                            },
                            selectedVersion,
                            selectedVersionUpdatePage,
                        },
                    })
                },
                _releaseInfo.deployedAppDetail.chartVersion,
            )

            dispatch({
                type: 'multipleOptions',
                payload: {
                    isLoading: false,
                    installedConfig: result,
                    modifiedValuesYaml: result?.valuesOverrideYaml,
                },
            })
        } catch (e) {
            dispatch({ type: 'isLoading', payload: false })
        }
    }

    const handleRepoChartValueChange = (event) => {
        handleRepoChartValueChange(event)

        if (isExternalApp) {
            fetchChartVersionsData(
                event.chartId,
                setChartVersionsData,
                handleVersionSelection,
                releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.chartVersion,
            )
            getChartValuesList(event.chartId, (_chartValuesList: ChartValuesType[]) => {
                if (!releaseAndInstalledAppInfo.installedAppInfo) {
                    const _defaultChartValues: ChartValuesType = {
                        id: 0,
                        kind: 'EXISTING',
                        name: releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName,
                    }

                    _chartValuesList?.push(_defaultChartValues)
                    handleChartValuesSelection(_defaultChartValues)
                }
                setChartValuesList(_chartValuesList)
            })
        } else {
            fetchChartVersionsData(event.chartId, setChartVersionsData, handleVersionSelection)
            getChartValuesList(
                event.chartId,
                setChartValuesList,
                handleChartValuesSelection,
                appDetails.appStoreInstalledAppVersionId,
                commonState.installedConfig.id,
            )
        }
    }

    const deleteApplication = (force?: boolean) => {
        if (isDeleteInProgress) {
            return
        }
        setDeleteInProgress(true)
        setShowDeleteAppConfirmationDialog(false)
        getDeleteApplicationApi(force)
            .then(() => {
                setDeleteInProgress(false)
                toast.success('Successfully deleted.')
                history.push(`${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`)
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

                    setForceDeleteData({
                        forceDelete: true,
                        title: forceDeleteTitle,
                        message: forceDeleteMessage,
                    })
                } else {
                    showError(error)
                }
            })
            .finally(() => {
                setDeleteInProgress(false)
            })
    }

    const getDeleteApplicationApi = (force?: boolean): Promise<any> => {
        if (isExternalApp && !releaseAndInstalledAppInfo.installedAppInfo) {
            return deleteApplicationRelease(appId)
        } else {
            return deleteInstalledChart(commonState.installedConfig.installedAppId, force)
        }
    }

    const hasChartChanged = () => {
        return (
            commonState.repoChartValue &&
            ((isExternalApp &&
                ((!releaseAndInstalledAppInfo.installedAppInfo && !!commonState.repoChartValue.chartRepoName) ||
                    (releaseAndInstalledAppInfo.installedAppInfo &&
                        releaseAndInstalledAppInfo.installedAppInfo.appStoreChartRepoName !==
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

    const deployOrUpdateApplication = async (forceUpdate?: boolean) => {
        if (isUpdateInProgress) {
            return
        }

        const validatedAppName = validationRules.appName(appName)

        if (!isValidData(validatedAppName)) {
            setChartValidations({
                invalidAppName: !validatedAppName.isValid,
                invalidAppNameMessage: validatedAppName.message,
                invalidaEnvironment: !commonState.selectedEnvironment,
                invalidProject: !commonState.selectedProject,
            })
            toast.error('Please provide the required inputs to view generated manifest')
            return
        }

        if (
            isExternalApp &&
            !forceUpdate &&
            !releaseAndInstalledAppInfo.installedAppInfo &&
            !commonState.repoChartValue?.chartRepoName
        ) {
            setShowAppNotLinkedDialog(true)
            return
        }

        // validate data
        try {
            JSON.stringify(YAML.parse(commonState.modifiedValuesYaml))
        } catch (err) {
            toast.error(`Encountered data validation error while updating. “${err}”`)
            return
        }

        setUpdateInProgress(true)
        setChartValidations({
            invalidAppName: false,
            invalidAppNameMessage: '',
            invalidaEnvironment: false,
            invalidProject: false,
        })

        try {
            let res

            if (isExternalApp && !releaseAndInstalledAppInfo.installedAppInfo) {
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

            setUpdateInProgress(false)

            if (isDeployChartView && res?.result) {
                const {
                    result: { environmentId: newEnvironmentId, installedAppId: newInstalledAppId },
                } = res
                toast.success('Deployment initiated')
                history.push(
                    `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${newInstalledAppId}/env/${newEnvironmentId}/${URLS.APP_DETAILS}?refetchData=true`,
                )
            } else if (res?.result && (res.result.success || res.result.appName)) {
                toast.success('Update and deployment initiated.')
                history.push(`${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`)
            } else {
                toast.error('Some error occurred')
            }
        } catch (err) {
            showError(err)
            setUpdateInProgress(false)
        }
    }

    const OnEditorValueChange = (codeEditorData: string) => {
        if (commonState.activeTab !== 'manifest') {
            dispatch({ type: 'modifiedValuesYaml', payload: codeEditorData })
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
                const validatedAppName = validationRules.appName(appName)
                if (!isValidData(validatedAppName)) {
                    setChartValidations({
                        invalidAppName: !validatedAppName.isValid,
                        invalidAppNameMessage: validatedAppName.message,
                        invalidaEnvironment: !commonState.selectedEnvironment,
                        invalidProject: !commonState.selectedProject,
                    })
                    dispatch({
                        type: 'multipleOptions',
                        payload: {
                            openReadMe: false,
                            openComparison: false,
                        },
                    })
                    toast.error('Please provide the required inputs to view generated manifest')
                    return
                } else if (Object.values(chartValidations).some((isInvalid) => isInvalid)) {
                    setChartValidations({
                        invalidAppName: false,
                        invalidAppNameMessage: '',
                        invalidaEnvironment: false,
                        invalidProject: false,
                    })
                }
            }
            dispatch({
                type: 'multipleOptions',
                payload: {
                    activeTab: e.target.value,
                    openReadMe: false,
                    openComparison: false,
                },
            })
        }
    }

    const renderReadMeOption = (disabled?: boolean) => {
        return (
            <span
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 ${
                    commonState.openReadMe ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => {
                    if (commonState.fetchingReadMe || disabled) {
                        return
                    }

                    dispatch({ type: 'openReadMe', payload: !commonState.openReadMe })
                    if (commonState.openComparison) {
                        dispatch({ type: 'openComparison', payload: false })
                    }
                }}
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

    const renderComparisonOption = (disabled?: boolean) => {
        return (
            <span
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 mr-8 ${
                    commonState.openComparison ? 'opened' : ''
                } ${disabled ? 'disabled' : ''}`}
                onClick={() => {
                    if (disabled) {
                        return
                    }

                    dispatch({ type: 'openComparison', payload: !commonState.openComparison })
                    if (commonState.openReadMe) {
                        dispatch({ type: 'openReadMe', payload: false })
                    }
                }}
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
                className="chart-values-view__tabs gui-yaml-switch"
                name="yaml-mode"
                initialTab={'yaml'}
                disabled={isExternalApp && !releaseAndInstalledAppInfo.installedAppInfo}
                onChange={handleTabSwitch}
            >
                {/* <RadioGroup.Radio value="gui">GUI (Basic)</RadioGroup.Radio> */}
                <RadioGroup.Radio value="yaml">
                    <Edit className="icon-dim-12 mr-6" />
                    YAML
                </RadioGroup.Radio>
                <RadioGroup.Radio
                    value="manifest"
                    showTippy={isExternalApp && !releaseAndInstalledAppInfo.installedAppInfo}
                    canSelect={isValidData()}
                    tippyContent={
                        'Manifest is generated only for apps linked to a helm chart. Link this app to a helm chart to view generated manifest.'
                    }
                >
                    Manifest output
                </RadioGroup.Radio>
            </RadioGroup>
        )
    }

    const renderValuesTabsContainer = () => {
        return (
            <div className="chart-values-view__tabs-container flex content-space">
                {renderValuesTabs()}
                <div className="flex">
                    {(commonState.activeTab === 'yaml' || (commonState.activeTab === 'manifest' && isExternalApp)) && (
                        <>
                            {commonState.isComparisonAvailable ? (
                                renderComparisonOption(
                                    commonState.activeTab === 'manifest' && !!commonState.valuesEditorError,
                                )
                            ) : (
                                <Tippy
                                    className="default-tt fixed-width-200"
                                    arrow={false}
                                    placement="bottom"
                                    content={
                                        <>
                                            <h2 className="fs-12 fw-6 lh-18 m-0">Nothing to compare with</h2>
                                            <p className="fs-12 fw-4 lh-18 m-0">
                                                No applications found using this chart
                                            </p>
                                        </>
                                    }
                                >
                                    {renderComparisonOption(commonState.activeTab === 'yaml')}
                                </Tippy>
                            )}
                        </>
                    )}
                    {commonState.activeTab !== 'manifest' && (
                        <>
                            {!commonState.openReadMe &&
                            (commonState.fetchingReadMe ||
                                !commonState.isReadMeAvailable ||
                                !commonState.fetchedReadMe.get(commonState.selectedVersionUpdatePage?.id || 0)) ? (
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
                            ) : (
                                renderReadMeOption()
                            )}
                        </>
                    )}
                </div>
            </div>
        )
    }

    const handleProjectSelection = (selected: ChartValuesOptionType) => {
        dispatch({ type: 'selectedProject', payload: selected })

        if (chartValidations.invalidProject) {
            setChartValidations({
                ...chartValidations,
                invalidProject: false,
            })
        }
    }

    const handleEnvironmentSelection = (selected: ChartEnvironmentOptionType) => {
        dispatch({ type: 'selectedEnvironment', payload: selected })

        if (chartValidations.invalidaEnvironment) {
            setChartValidations({
                ...chartValidations,
                invalidaEnvironment: false,
            })
        }
    }

    const handleVersionSelection = (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
        dispatch({
            type: 'multipleOptions',
            payload: {
                selectedVersion,
                selectedVersionUpdatePage,
            },
        })
    }

    const handleChartValuesSelection = (chartValues: ChartValuesType) => {
        dispatch({ type: 'chartValues', payload: chartValues })
    }

    const handleAppNameChange = (newAppName: string) => {
        const validatedAppName = validationRules.appName(newAppName)
        if (!validatedAppName.isValid && chartValidations.invalidAppNameMessage !== validatedAppName.message) {
            setChartValidations({
                ...chartValidations,
                invalidAppName: true,
                invalidAppNameMessage: validatedAppName.message,
            })
        } else if (validatedAppName.isValid) {
            setChartValidations({
                ...chartValidations,
                invalidAppName: false,
                invalidAppNameMessage: '',
            })
        }
        setAppName(newAppName)
    }

    const renderData = () => {
        return (
            <div
                className={`chart-values-view__container bcn-0 ${
                    isDeployChartView ? 'chart-values-view__deploy-chart' : ''
                } ${commonState.openReadMe ? 'readmeOpened' : ''} ${
                    commonState.openComparison ? 'comparisonOpened' : ''
                }`}
            >
                {renderValuesTabsContainer()}
                <div className="chart-values-view__hr-divider bcn-2" />
                <div className="chart-values-view__wrapper">
                    <div className="chart-values-view__details">
                        {isDeployChartView && (
                            <AppNameInput
                                appName={appName}
                                handleAppNameChange={handleAppNameChange}
                                invalidAppName={chartValidations.invalidAppName}
                                invalidAppNameMessage={chartValidations.invalidAppNameMessage}
                            />
                        )}
                        {!isExternalApp &&
                            ((!isDeployChartView && commonState.selectedProject) ||
                                (isDeployChartView && serverMode === SERVER_MODE.FULL)) && (
                                <>
                                    <ChartProjectSelector
                                        isDeployChartView={isDeployChartView}
                                        selectedProject={commonState.selectedProject}
                                        handleProjectSelection={handleProjectSelection}
                                        projects={projectsAndEnvironments.projects}
                                        invalidProject={chartValidations.invalidProject}
                                    />
                                </>
                            )}
                        {(isDeployChartView ||
                            (!isDeployChartView && (isExternalApp || commonState.selectedEnvironment))) && (
                            <>
                                <ChartEnvironmentSelector
                                    isExternal={isExternalApp}
                                    isDeployChartView={isDeployChartView}
                                    installedAppInfo={releaseAndInstalledAppInfo.installedAppInfo}
                                    releaseInfo={releaseAndInstalledAppInfo.releaseInfo}
                                    isUpdate={!!isUpdate}
                                    selectedEnvironment={commonState.selectedEnvironment}
                                    handleEnvironmentSelection={handleEnvironmentSelection}
                                    environments={projectsAndEnvironments.environments}
                                    invalidaEnvironment={chartValidations.invalidaEnvironment}
                                />
                            </>
                        )}
                        <div className="chart-values-view__hr-divider bcn-1 mt-16 mb-16" />
                        {!isDeployChartView && (
                            <ChartRepoSelector
                                isExternal={isExternalApp}
                                isUpdate={!!isUpdate}
                                installedAppInfo={releaseAndInstalledAppInfo.installedAppInfo}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                repoChartValue={commonState.repoChartValue}
                                chartDetails={commonState.repoChartValue}
                            />
                        )}
                        {(isDeployChartView ||
                            !isExternalApp ||
                            (isExternalApp &&
                                (releaseAndInstalledAppInfo.installedAppInfo ||
                                    (!releaseAndInstalledAppInfo.installedAppInfo &&
                                        commonState.repoChartValue?.chartRepoName)))) && (
                            <ChartVersionValuesSelector
                                isUpdate={isUpdate}
                                selectedVersion={commonState.selectedVersion}
                                selectedVersionUpdatePage={commonState.selectedVersionUpdatePage}
                                handleVersionSelection={handleVersionSelection}
                                chartVersionsData={chartVersionsData}
                                chartVersionObj={chartVersionsData.find(
                                    (_chartVersion) => _chartVersion.id === commonState.selectedVersion,
                                )}
                                chartValuesList={chartValuesList}
                                chartValues={commonState.chartValues}
                                redirectToChartValues={redirectToChartValues}
                                handleChartValuesSelection={handleChartValuesSelection}
                                hideVersionFromLabel={
                                    isExternalApp &&
                                    !releaseAndInstalledAppInfo.installedAppInfo &&
                                    commonState.chartValues.kind === 'EXISTING'
                                }
                            />
                        )}
                        {!isDeployChartView && (
                            <DeleteApplicationButton
                                isUpdateInProgress={isUpdateInProgress}
                                isDeleteInProgress={isDeleteInProgress}
                                setShowDeleteAppConfirmationDialog={setShowDeleteAppConfirmationDialog}
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
                                    (commonState.activeTab === 'yaml' && commonState.fetchingValuesYaml) ||
                                    (commonState.activeTab === 'manifest' && commonState.generatingManifest)
                                }
                                isExternalApp={isExternalApp}
                                isDeployChartView={isDeployChartView}
                                appId={appId}
                                appName={
                                    isExternalApp
                                        ? releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName
                                        : commonState.installedConfig.appName
                                }
                                valuesText={commonState.modifiedValuesYaml}
                                defaultValuesText={
                                    isExternalApp
                                        ? YAML.stringify(
                                              JSON.parse(releaseAndInstalledAppInfo.releaseInfo.mergedValues),
                                          )
                                        : commonState.installedConfig?.valuesOverrideYaml
                                }
                                onChange={OnEditorValueChange}
                                repoChartValue={commonState.repoChartValue}
                                showEditorHeader={commonState.openReadMe}
                                hasChartChanged={hasChartChanged()}
                                showInfoText={!commonState.openReadMe && !commonState.openComparison}
                                manifestView={commonState.activeTab === 'manifest'}
                                generatedManifest={commonState.generatedManifest}
                                comparisonView={commonState.openComparison}
                                chartValuesList={chartValuesList}
                                deploymentHistoryList={deploymentHistoryArr}
                            />
                        )}
                        {!commonState.openComparison && !commonState.openReadMe && (
                            <UpdateApplicationButton
                                isUpdateInProgress={isUpdateInProgress}
                                isDeleteInProgress={isDeleteInProgress}
                                isDeployChartView={isDeployChartView}
                                deployOrUpdateApplication={deployOrUpdateApplication}
                            />
                        )}
                    </div>
                </div>
                {showDeleteAppConfirmationDialog && (
                    <DeleteChartDialog
                        appName={
                            (isExternalApp && releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName) ||
                            commonState.installedConfig?.appName
                        }
                        handleDelete={deleteApplication}
                        toggleConfirmation={setShowDeleteAppConfirmationDialog}
                    />
                )}
                {forceDeleteData.forceDelete && (
                    <ForceDeleteDialog
                        forceDeleteDialogTitle={forceDeleteData.title}
                        forceDeleteDialogMessage={forceDeleteData.message}
                        onClickDelete={() => deleteApplication(true)}
                        closeDeleteModal={() => {
                            setShowDeleteAppConfirmationDialog(false)
                            setForceDeleteData({
                                forceDelete: false,
                                title: '',
                                message: '',
                            })
                        }}
                    />
                )}
                {showAppNotLinkedDialog && (
                    <AppNotLinkedDialog
                        close={() => setShowAppNotLinkedDialog(false)}
                        update={deployOrUpdateApplication}
                    />
                )}
            </div>
        )
    }

    if (commonState.isLoading) {
        return (
            <div className="loading-wrapper">
                <Progressing pageLoader />
            </div>
        )
    } else if (errorResponseCode) {
        return (
            <div className="loading-wrapper">
                <ErrorScreenManager code={errorResponseCode} />
            </div>
        )
    }

    return !isExternalApp || (isExternalApp && releaseAndInstalledAppInfo.releaseInfo && commonState.repoChartValue) ? (
        renderData()
    ) : (
        <></>
    )
}

export default ChartValuesView

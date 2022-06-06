import React, { useState, useEffect, useCallback, useContext, useReducer } from 'react'
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
import { ChartRepoOtions } from '../DeployChart'
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
    ChartValuesYamlDataType,
    ForceDeleteDataType,
} from './ChartValuesView.type'
import './ChartValuesView.scss'
import {
    initSelectedOptionsData,
    initValuesAndManifestYamlData,
    selectedOptionsDataReducer,
    valuesAndManifestYamlDataReducer,
} from './ChartValuesView.utils'

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
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdateInProgress, setUpdateInProgress] = useState(false)
    const [isDeleteInProgress, setDeleteInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [openComparison, setOpenComparison] = useState(false)
    const [openReadMe, setOpenReadMe] = useState(false)
    const [fetchedReadMe, setFetchedReadMe] = useState<Map<number, string>>(new Map<number, string>())
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
    const [installedConfig, setInstalledConfig] = useState(installedConfigFromParent)
    const [activeTab, setActiveTab] = useState('yaml')
    const [fetchingReadMe, setFetchingReadMe] = useState<boolean>(false)
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<ChartDeploymentDetail[]>([])
    const [forceDeleteData, setForceDeleteData] = useState<ForceDeleteDataType>({
        forceDelete: false,
        title: '',
        message: '',
    })
    const [appName, setAppName] = useState('')
    const [tabOptionsAvailable, setTabOptionsAvailable] = useState<{
        isComparisonAvailable: boolean
        isReadMeAvailable: boolean
    }>({
        isComparisonAvailable: true,
        isReadMeAvailable: true,
    })
    const [chartValidations, setChartValidations] = useState<{
        invalidAppName: boolean
        invalidaEnvironment: boolean
        invalidProject: boolean
    }>({
        invalidAppName: false,
        invalidaEnvironment: false,
        invalidProject: false,
    })
    const isUpdate = isExternalApp || (installedConfig?.environmentId && installedConfig.teamId)
    const { serverMode } = useContext(mainContext)
    const [selectedOptionsData, dispatchSelectedOption] = useReducer(
        selectedOptionsDataReducer,
        initSelectedOptionsData(selectedVersionFromParent, chartValuesFromParent),
    )
    const [valuesAndManifestYamlData, dispatchYamlData] = useReducer(
        valuesAndManifestYamlDataReducer,
        initValuesAndManifestYamlData,
    )

    const [obj] = useJsonYaml(valuesAndManifestYamlData.modifiedValuesYaml, 4, 'yaml', true)

    useEffect(() => {
        if (isDeployChartView) {
            fetchProjectsAndEnvironments(serverMode, setProjectsAndEnvironment)
            const _fetchedReadMe = fetchedReadMe
            _fetchedReadMe.set(0, installedConfig.readme)
            setFetchedReadMe(_fetchedReadMe)
            setIsLoading(false)
        } else if (!isExternalApp && !isDeployChartView) {
            fetchProjectsAndEnvironments(serverMode, setProjectsAndEnvironment)
            dispatchYamlData({ type: 'modifiedValuesYaml', payload: installedConfig.valuesOverrideYaml })

            const payload = {
                repoChartValue: {
                    appStoreApplicationVersionId: installedConfig.appStoreVersion,
                    chartRepoName: appDetails.appStoreChartName,
                    chartId: installedConfig.appStoreId,
                    chartName: appDetails.appStoreAppName,
                    version: appDetails.appStoreAppVersion,
                    deprecated: installedConfig.deprecated,
                },
                chartValues: {
                    id: appDetails.appStoreInstalledAppVersionId,
                    appStoreVersionId: installedConfig.appStoreVersion,
                    kind: 'DEPLOYED',
                },
            }
            fetchChartVersionsData(
                appDetails.appStoreChartId,
                setChartVersionsData,
                (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
                    dispatchSelectedOption({
                        type: 'multipleOptions',
                        payload: {
                            ...payload,
                            selectedVersion,
                            selectedVersionUpdatePage,
                        },
                    })
                },
                appDetails.appStoreAppVersion,
            )
            getChartValuesList(appDetails.appStoreChartId, setChartValuesList)
            setIsLoading(false)
        } else if (isExternalApp) {
            getReleaseInfo(appId)
                .then((releaseInfoResponse: ReleaseInfoResponse) => {
                    const _releaseInfo = releaseInfoResponse.result.releaseInfo
                    const _installedAppInfo = releaseInfoResponse.result.installedAppInfo
                    setReleaseAndInstalledAppInfo({
                        releaseInfo: _releaseInfo,
                        installedAppInfo: _installedAppInfo,
                    })

                    const _fetchedReadMe = fetchedReadMe
                    _fetchedReadMe.set(0, _releaseInfo.readme)
                    setFetchedReadMe(_fetchedReadMe)

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
                        dispatchSelectedOption({
                            type: 'multipleOptions',
                            payload: {
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
                            },
                        })
                        dispatchYamlData({
                            type: 'modifiedValuesYaml',
                            payload: YAML.stringify(JSON.parse(_releaseInfo.mergedValues)),
                        })
                        setIsLoading(false)
                    }
                })
                .catch((errors: ServerErrors) => {
                    showError(errors)
                    setErrorResponseCode(errors.code)
                    setIsLoading(false)
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
            selectedOptionsData.chartValues &&
            ((selectedOptionsData.chartValues.id && selectedOptionsData.chartValues.chartVersion) ||
                (isExternalApp && releaseAndInstalledAppInfo.releaseInfo))
        ) {
            dispatchYamlData({ type: 'fetchingValuesYaml', payload: true })
            if (selectedOptionsData.chartValues.id && selectedOptionsData.chartValues.chartVersion) {
                getChartValues(selectedOptionsData.chartValues.id, selectedOptionsData.chartValues.kind)
                    .then((response) => {
                        dispatchYamlData({
                            type: 'multipleOptions',
                            payload: {
                                fetchingValuesYaml: false,
                                modifiedValuesYaml: response.result.values || '',
                            },
                        })

                        if (
                            activeTab === 'manifest' &&
                            (!isExternalApp || (isExternalApp && releaseAndInstalledAppInfo.installedAppInfo)) &&
                            installedConfig
                        ) {
                            if (isDeployChartView) {
                                getGeneratedHelManifest(
                                    selectedOptionsData.selectedEnvironment.value,
                                    selectedOptionsData.selectedEnvironment.clusterId || installedConfig.clusterId,
                                    selectedOptionsData.selectedEnvironment.namespace,
                                    appName,
                                    selectedOptionsData.chartValues?.appStoreVersionId ||
                                        selectedOptionsData.chartValues?.id ||
                                        installedConfig.appStoreVersion,
                                    response.result.values || valuesAndManifestYamlData.modifiedValuesYaml,
                                    dispatchYamlData,
                                )
                            } else {
                                getGeneratedHelManifest(
                                    installedConfig.environmentId,
                                    installedConfig.clusterId,
                                    installedConfig.namespace,
                                    installedConfig.appName,
                                    selectedOptionsData.chartValues?.appStoreVersionId ||
                                        selectedOptionsData.chartValues?.id ||
                                        installedConfig.appStoreVersion,
                                    response.result.values || valuesAndManifestYamlData.modifiedValuesYaml,
                                    dispatchYamlData,
                                )
                            }
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        dispatchYamlData({
                            type: 'fetchingValuesYaml',
                            payload: false,
                        })
                    })
            } else if (
                isExternalApp &&
                releaseAndInstalledAppInfo.releaseInfo.mergedValues &&
                releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName ===
                    selectedOptionsData.chartValues.name
            ) {
                dispatchYamlData({
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
    }, [selectedOptionsData.chartValues])

    const handleFetchedReadMe = useCallback(
        (id: number, readme: string) => {
            const currentFetchedReadMe = fetchedReadMe
            if (!currentFetchedReadMe.has(id)) {
                currentFetchedReadMe.set(id, readme)
                setFetchedReadMe(currentFetchedReadMe)
            }
        },
        [fetchedReadMe],
    )

    useEffect(() => {
        if (
            selectedOptionsData.selectedVersionUpdatePage &&
            selectedOptionsData.selectedVersionUpdatePage.id &&
            !fetchedReadMe.has(selectedOptionsData.selectedVersionUpdatePage.id) &&
            activeTab !== 'manifest'
        ) {
            getChartRelatedReadMe(
                selectedOptionsData.selectedVersionUpdatePage.id,
                setFetchingReadMe,
                handleFetchedReadMe,
            )
        }
    }, [selectedOptionsData.selectedVersionUpdatePage])

    useEffect(() => {
        if (
            installedConfig &&
            installedConfig.environmentId &&
            installedConfig.teamId &&
            projectsAndEnvironments.environments.length > 0 &&
            projectsAndEnvironments.projects.length > 0
        ) {
            const project = projectsAndEnvironments.projects.find(
                (e) => e.value.toString() === installedConfig.teamId.toString(),
            )
            const environment = (projectsAndEnvironments.environments as ChartValuesOptionType[]).find(
                (e) => e.value.toString() === installedConfig.environmentId.toString(),
            )
            dispatchSelectedOption({
                type: 'multipleOptions',
                payload: {
                    selectedProject: project,
                    selectedEnvironment: environment,
                },
            })
        }
    }, [installedConfig, projectsAndEnvironments])

    useEffect(() => {
        if (
            activeTab === 'manifest' &&
            installedConfig &&
            (!valuesAndManifestYamlData.generatedManifest ||
                (valuesAndManifestYamlData.generatedManifest &&
                    (hasChartChanged() || selectedOptionsData.chartValues.id !== installedConfig.id)))
        ) {
            if (isDeployChartView) {
                getGeneratedHelManifest(
                    selectedOptionsData.selectedEnvironment.value,
                    selectedOptionsData.selectedEnvironment.clusterId || installedConfig.clusterId,
                    selectedOptionsData.selectedEnvironment.namespace,
                    appName,
                    selectedOptionsData.chartValues?.appStoreVersionId ||
                        selectedOptionsData.chartValues?.id ||
                        installedConfig.appStoreVersion,
                    installedConfig.valuesYaml,
                    dispatchYamlData,
                )
            } else {
                getGeneratedHelManifest(
                    installedConfig.environmentId,
                    installedConfig.clusterId,
                    installedConfig.namespace,
                    installedConfig.appName,
                    selectedOptionsData.chartValues?.appStoreVersionId ||
                        selectedOptionsData.chartValues?.id ||
                        installedConfig.appStoreVersion,
                    isExternalApp
                        ? releaseAndInstalledAppInfo.releaseInfo?.mergedValues
                        : installedConfig.valuesOverrideYaml,
                    dispatchYamlData,
                )
            }
        }
    }, [activeTab, installedConfig])

    useEffect(() => {
        if (chartValuesList.length > 0 && deploymentHistoryArr.length > 0) {
            const isVersionAvailableForDiff =
                chartValuesList.some((_chartValues) => _chartValues.kind === 'DEPLOYED') ||
                deploymentHistoryArr.length > 1

            setTabOptionsAvailable({
                ...tabOptionsAvailable,
                isComparisonAvailable: isVersionAvailableForDiff,
            })
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

            fetchChartVersionsData(
                _repoChartValue.chartId,
                setChartVersionsData,
                (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
                    dispatchSelectedOption({
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
            getChartValuesList(_repoChartValue.chartId, setChartValuesList)

            setInstalledConfig(result)
            dispatchYamlData({ type: 'modifiedValuesYaml', payload: result?.valuesOverrideYaml })
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
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
                installedConfig.id,
            )
        }
    }

    const deleteApplication = (force?: boolean) => {
        if (isDeleteInProgress) {
            return
        }
        setDeleteInProgress(true)
        setShowDeleteAppConfirmationDialog(false)
        getDeleteApplicationApi()
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
            return deleteInstalledChart(installedConfig.installedAppId, force)
        }
    }

    const hasChartChanged = () => {
        return (
            selectedOptionsData.repoChartValue &&
            ((isExternalApp &&
                ((!releaseAndInstalledAppInfo.installedAppInfo && !!selectedOptionsData.repoChartValue.chartRepoName) ||
                    (releaseAndInstalledAppInfo.installedAppInfo &&
                        releaseAndInstalledAppInfo.installedAppInfo.appStoreChartRepoName !==
                            selectedOptionsData.repoChartValue.chartRepoName))) ||
                (!isExternalApp && installedConfig.appStoreId !== selectedOptionsData.repoChartValue.chartId))
        )
    }

    const isValidData = () => {
        if (
            isDeployChartView &&
            (!appName.trim() ||
                !selectedOptionsData.selectedEnvironment ||
                (serverMode === SERVER_MODE.FULL && !selectedOptionsData.selectedProject))
        ) {
            return false
        }

        return true
    }

    const deployOrUpdateApplication = async (forceUpdate?: boolean) => {
        if (isUpdateInProgress) {
            return
        }

        if (!isValidData()) {
            setChartValidations({
                invalidAppName: !appName.trim(),
                invalidaEnvironment: !selectedOptionsData.selectedEnvironment,
                invalidProject: !selectedOptionsData.selectedProject,
            })
            return
        }

        if (
            isExternalApp &&
            !forceUpdate &&
            !releaseAndInstalledAppInfo.installedAppInfo &&
            !selectedOptionsData.repoChartValue?.chartRepoName
        ) {
            setShowAppNotLinkedDialog(true)
            return
        }

        // validate data
        try {
            JSON.stringify(YAML.parse(valuesAndManifestYamlData.modifiedValuesYaml))
        } catch (err) {
            toast.error(`Encountered data validation error while updating. “${err}”`)
            return
        }

        setUpdateInProgress(true)
        setChartValidations({
            invalidAppName: false,
            invalidaEnvironment: false,
            invalidProject: false,
        })

        try {
            let res

            if (isExternalApp && !releaseAndInstalledAppInfo.installedAppInfo) {
                if (!forceUpdate) {
                    const payload: LinkToChartStoreRequest = {
                        appId: appId,
                        valuesYaml: valuesAndManifestYamlData.modifiedValuesYaml,
                        appStoreApplicationVersionId: selectedOptionsData.selectedVersionUpdatePage.id,
                        referenceValueId: selectedOptionsData.selectedVersionUpdatePage.id,
                        referenceValueKind: selectedOptionsData.chartValues.kind,
                    }
                    res = await linkToChartStore(payload)
                } else {
                    const payload: UpdateAppReleaseWithoutLinkingRequest = {
                        appId: appId,
                        valuesYaml: valuesAndManifestYamlData.modifiedValuesYaml,
                    }
                    res = await updateAppReleaseWithoutLinking(payload)
                }
            } else if (isDeployChartView) {
                const payload = {
                    teamId: serverMode == SERVER_MODE.FULL ? selectedOptionsData.selectedProject.value : 0,
                    referenceValueId: selectedOptionsData.chartValues.id,
                    referenceValueKind: selectedOptionsData.chartValues.kind,
                    environmentId: serverMode == SERVER_MODE.FULL ? selectedOptionsData.selectedEnvironment.value : 0,
                    clusterId: selectedOptionsData.selectedEnvironment.clusterId,
                    namespace: selectedOptionsData.selectedEnvironment.namespace,
                    appStoreVersion: selectedOptionsData.selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: valuesAndManifestYamlData.modifiedValuesYaml,
                    appName: appName.trim(),
                }
                res = await installChart(payload)
            } else {
                const payload: UpdateAppReleaseRequest = {
                    id: hasChartChanged() ? 0 : installedConfig.id,
                    referenceValueId: selectedOptionsData.chartValues.id,
                    referenceValueKind: selectedOptionsData.chartValues.kind,
                    valuesOverrideYaml: valuesAndManifestYamlData.modifiedValuesYaml,
                    installedAppId: installedConfig.installedAppId,
                    appStoreVersion: selectedOptionsData.selectedVersionUpdatePage.id,
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
        if (activeTab !== 'manifest') {
            dispatchYamlData({ type: 'modifiedValuesYaml', payload: codeEditorData })
        }
    }

    const redirectToChartValues = async () => {
        if (selectedOptionsData.repoChartValue?.chartId) {
            history.push(getChartValuesURL(selectedOptionsData.repoChartValue.chartId))
        }
    }

    const handleTabSwitch = (e) => {
        if (e?.target && e.target.value !== activeTab) {
            if (e.target.value === 'manifest') {
                if (!isValidData()) {
                    setChartValidations({
                        invalidAppName: !appName.trim(),
                        invalidaEnvironment: !selectedOptionsData.selectedEnvironment,
                        invalidProject: !selectedOptionsData.selectedProject,
                    })
                    toast.error('Please provide the required inputs to view generated manifest')
                    return
                } else if (Object.values(chartValidations).some((isInvalid) => isInvalid)) {
                    setChartValidations({
                        invalidAppName: false,
                        invalidaEnvironment: false,
                        invalidProject: false,
                    })
                }
            }
            setActiveTab(e.target.value)
            setOpenComparison(false)
            setOpenReadMe(false)
        }
    }

    const renderReadMeOption = (disabled?: boolean) => {
        return (
            <span
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 ${disabled ? 'disabled' : ''}`}
                onClick={() => {
                    if (fetchingReadMe || disabled) {
                        return
                    }

                    setOpenReadMe(!openReadMe)
                    if (openComparison) {
                        setOpenComparison(false)
                    }
                }}
            >
                {openReadMe ? (
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
                className={`chart-values-view__option flex cursor fs-13 fw-6 cn-7 mr-8 ${disabled ? 'disabled' : ''}`}
                onClick={() => {
                    if (disabled) {
                        return
                    }

                    setOpenComparison(!openComparison)
                    if (openReadMe) {
                        setOpenReadMe(false)
                    }
                }}
            >
                {openComparison ? (
                    <Close className="option-close__icon icon-dim-16 mr-8" />
                ) : (
                    <Arrows className="option-open__icon icon-dim-16 mr-8" />
                )}
                {activeTab === 'manifest'
                    ? 'Compare with deployed'
                    : openComparison
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
                    {(activeTab === 'yaml' || (activeTab === 'manifest' && isExternalApp)) && (
                        <>
                            {tabOptionsAvailable.isComparisonAvailable ? (
                                renderComparisonOption(
                                    activeTab === 'manifest' && !!valuesAndManifestYamlData.valuesEditorError,
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
                                    {renderComparisonOption(activeTab === 'yaml')}
                                </Tippy>
                            )}
                        </>
                    )}
                    {activeTab !== 'manifest' && (
                        <>
                            {!openReadMe &&
                            (fetchingReadMe ||
                                !fetchedReadMe.get(selectedOptionsData.selectedVersionUpdatePage?.id || 0)) ? (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={fetchingReadMe ? 'Fetching...' : 'Readme is not available for this chart'}
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
        dispatchSelectedOption({ type: 'selectedProject', payload: selected })
    }

    const handleEnvironmentSelection = (selected: ChartEnvironmentOptionType) => {
        dispatchSelectedOption({ type: 'selectedEnvironment', payload: selected })
    }

    const handleVersionSelection = (selectedVersion: number, selectedVersionUpdatePage: ChartVersionType) => {
        dispatchSelectedOption({
            type: 'multipleOptions',
            payload: {
                selectedVersion,
                selectedVersionUpdatePage,
            },
        })
    }

    const handleChartValuesSelection = (chartValues: ChartValuesType) => {
        dispatchSelectedOption({ type: 'chartValues', payload: chartValues })
    }

    const renderData = () => {
        return (
            <div
                className={`chart-values-view__container bcn-0 ${
                    isDeployChartView ? 'chart-values-view__deploy-chart' : ''
                } ${openReadMe ? 'readmeOpened' : ''} ${openComparison ? 'comparisonOpened' : ''}`}
            >
                {renderValuesTabsContainer()}
                <div className="chart-values-view__hr-divider bcn-2" />
                <div className="chart-values-view__wrapper">
                    <div className="chart-values-view__details">
                        {isDeployChartView && (
                            <AppNameInput
                                appName={appName}
                                setAppName={setAppName}
                                invalidAppName={chartValidations.invalidAppName}
                            />
                        )}
                        {!isExternalApp &&
                            ((!isDeployChartView && selectedOptionsData.selectedProject) ||
                                (isDeployChartView && serverMode === SERVER_MODE.FULL)) && (
                                <>
                                    <ChartProjectSelector
                                        isDeployChartView={isDeployChartView}
                                        selectedProject={selectedOptionsData.selectedProject}
                                        handleProjectSelection={handleProjectSelection}
                                        projects={projectsAndEnvironments.projects}
                                        invalidProject={chartValidations.invalidProject}
                                    />
                                </>
                            )}
                        {(isDeployChartView ||
                            (!isDeployChartView && (isExternalApp || selectedOptionsData.selectedEnvironment))) && (
                            <>
                                <ChartEnvironmentSelector
                                    isExternal={isExternalApp}
                                    isDeployChartView={isDeployChartView}
                                    installedAppInfo={releaseAndInstalledAppInfo.installedAppInfo}
                                    releaseInfo={releaseAndInstalledAppInfo.releaseInfo}
                                    isUpdate={!!isUpdate}
                                    selectedEnvironment={selectedOptionsData.selectedEnvironment}
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
                                repoChartValue={selectedOptionsData.repoChartValue}
                                chartDetails={selectedOptionsData.repoChartValue}
                            />
                        )}
                        {(isDeployChartView ||
                            !isExternalApp ||
                            (isExternalApp &&
                                (releaseAndInstalledAppInfo.installedAppInfo ||
                                    (!releaseAndInstalledAppInfo.installedAppInfo &&
                                        selectedOptionsData.repoChartValue?.chartRepoName)))) && (
                            <ChartVersionValuesSelector
                                isUpdate={isUpdate}
                                selectedVersion={selectedOptionsData.selectedVersion}
                                selectedVersionUpdatePage={selectedOptionsData.selectedVersionUpdatePage}
                                handleVersionSelection={handleVersionSelection}
                                chartVersionsData={chartVersionsData}
                                chartVersionObj={chartVersionsData.find(
                                    (_chartVersion) => _chartVersion.id === selectedOptionsData.selectedVersion,
                                )}
                                chartValuesList={chartValuesList}
                                chartValues={selectedOptionsData.chartValues}
                                redirectToChartValues={redirectToChartValues}
                                handleChartValuesSelection={handleChartValuesSelection}
                                hideVersionFromLabel={
                                    !releaseAndInstalledAppInfo.installedAppInfo &&
                                    selectedOptionsData.chartValues.kind === 'EXISTING'
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
                    {openReadMe && (
                        <ActiveReadmeColumn
                            fetchingReadMe={fetchingReadMe}
                            activeReadMe={fetchedReadMe.get(selectedOptionsData.selectedVersionUpdatePage?.id || 0)}
                        />
                    )}
                    {!openComparison && <div className="chart-values-view__vr-divider bcn-2" />}
                    <div
                        className={`chart-values-view__editor ${
                            openReadMe || openComparison ? 'chart-values-view__full-mode' : ''
                        }`}
                    >
                        {activeTab === 'manifest' && valuesAndManifestYamlData.valuesEditorError ? (
                            <ErrorScreenWithInfo info={valuesAndManifestYamlData.valuesEditorError} />
                        ) : (
                            <ChartValuesEditor
                                loading={
                                    (activeTab === 'yaml' && valuesAndManifestYamlData.fetchingValuesYaml) ||
                                    (activeTab === 'manifest' && valuesAndManifestYamlData.generatingManifest)
                                }
                                isExternalApp={isExternalApp}
                                isDeployChartView={isDeployChartView}
                                appId={appId}
                                appName={
                                    isExternalApp
                                        ? releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName
                                        : installedConfig.appName
                                }
                                valuesText={valuesAndManifestYamlData.modifiedValuesYaml}
                                defaultValuesText={
                                    isExternalApp
                                        ? YAML.stringify(
                                              JSON.parse(releaseAndInstalledAppInfo.releaseInfo.mergedValues),
                                          )
                                        : installedConfig?.valuesOverrideYaml
                                }
                                onChange={OnEditorValueChange}
                                repoChartValue={selectedOptionsData.repoChartValue}
                                showEditorHeader={openReadMe}
                                hasChartChanged={hasChartChanged()}
                                showInfoText={!openReadMe && !openComparison}
                                manifestView={activeTab === 'manifest'}
                                generatedManifest={valuesAndManifestYamlData.generatedManifest}
                                comparisonView={openComparison}
                                chartValuesList={chartValuesList}
                                deploymentHistoryList={deploymentHistoryArr}
                            />
                        )}
                        {!openComparison && !openReadMe && (
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
                        appName={releaseAndInstalledAppInfo.releaseInfo.deployedAppDetail.appName}
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

    if (isLoading) {
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

    return !isExternalApp ||
        (isExternalApp && releaseAndInstalledAppInfo.releaseInfo && selectedOptionsData.repoChartValue) ? (
        renderData()
    ) : (
        <></>
    )
}

export default ChartValuesView

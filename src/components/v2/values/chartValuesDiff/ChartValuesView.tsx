import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { toast } from 'react-toastify'
import { showError, Progressing, ErrorScreenManager, sortCallback, RadioGroup } from '../../../common'
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
    deleteInstalledChart,
    generateHelmManifest,
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
    ChartVersionValuesSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartValuesEditor,
    AppNotLinkedDialog,
    ChartValuesSelector,
    ChartVersionSelector,
    ChartProjectSelector,
} from '../common/ChartValuesSelectors'
import { ChartRepoOtions } from '../DeployChart'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import {
    fetchChartVersionsData,
    fetchEnvironments,
    fetchProjects,
    getChartRelatedReadMe,
    getChartValuesList,
    getGeneratedHelManifest,
} from '../common/chartValues.api'
import { getChartValuesURL } from '../../../charts/charts.helper'
import './ChartValuesView.scss'
import ReactSelect from 'react-select'
import { DropdownIndicator, styles } from '../../common/ReactSelect.utils'
import { menuList } from '../../../charts/charts.util'
import { OptionType } from '../../../app/types'
import { getEnvironmentListHelmApps, getEnvironmentListMin, getTeamListMin } from '../../../../services/service'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Arrows } from '../../../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import {
    ChartDeploymentDetail,
    ChartDeploymentHistoryResponse,
    getDeploymentHistory,
    getDeploymentManifestDetails,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { mainContext } from '../../../common/navigation/NavigationRoutes'
import ForceDeleteDialog from '../../../common/dialogs/ForceDeleteDialog'

function ChartValuesView({
    appId,
    isExternalApp,
    isDeployChartView,
    installedConfigFromParent,
    appDetails,
}: {
    appId: string
    isExternalApp?: boolean
    isDeployChartView?: boolean
    installedConfigFromParent?: any
    appDetails?: any
}) {
    const history = useHistory()
    const { url } = useRouteMatch()
    const [isLoading, setIsLoading] = useState(true)
    const [fetchingValuesYaml, setFetchingValuesYaml] = useState(false)
    const [isUpdateInProgress, setUpdateInProgress] = useState(false)
    const [isDeleteInProgress, setDeleteInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [openComparison, setOpenComparison] = useState(false)
    const [openReadMe, setOpenReadMe] = useState(false)
    const [fetchedReadMe, setFetchedReadMe] = useState<Map<number, string>>(new Map<number, string>())
    const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo>(undefined)
    const [showDeleteAppConfirmationDialog, setShowDeleteAppConfirmationDialog] = useState(false)
    const [showAppNotLinkedDialog, setShowAppNotLinkedDialog] = useState(false)
    const [modifiedValuesYaml, setModifiedValuesYaml] = useState('')
    const [installedAppInfo, setInstalledAppInfo] = useState<InstalledAppInfo>(undefined)
    const [repoChartValue, setRepoChartValue] = useState<ChartRepoOtions>()
    const [chartVersionsData, setChartVersionsData] = useState<ChartVersionType[]>([])
    const [chartValuesList, setChartValuesList] = useState<ChartValuesType[]>([])
    const [selectedVersion, selectVersion] = useState<any>()
    const [selectedVersionUpdatePage, setSelectedVersionUpdatePage] = useState<ChartVersionType>()
    const [chartValues, setChartValues] = useState<ChartValuesType>()
    const [installedConfig, setInstalledConfig] = useState(installedConfigFromParent)
    const [environments, setEnvironments] = useState([])
    const [selectedEnvironment, selectEnvironment] = useState<{ label: string; value: number }>()
    const [projects, setProjects] = useState([])
    const [selectedProject, selectProject] = useState<OptionType>()
    const [activeTab, setActiveTab] = useState('yaml')
    const [fetchingReadMe, setFetchingReadMe] = useState<boolean>(false)
    const [generatingManifest, setGeneratingManifest] = useState<boolean>(false)
    const [generatedManifest, setGeneratedManifest] = useState('')
    const [deploymentHistoryArr, setDeploymentHistoryArr] = useState<ChartDeploymentDetail[]>([])
    const [deployedManifest, setDeployedManifest] = useState('')
    const [forceDeleteData, setForceDeleteData] = useState<{
        forceDelete: boolean
        title: string
        message: string
    }>({
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
    const isUpdate = isExternalApp || (installedConfig?.environmentId && installedConfig.teamId)
    const { serverMode } = useContext(mainContext)

    // component load
    useEffect(() => {
        if (!isExternalApp && !isDeployChartView) {
            fetchProjects(setProjects)
            fetchEnvironments(serverMode, setEnvironments)
            setRepoChartValue({
                appStoreApplicationVersionId: installedConfig.appStoreVersion,
                chartRepoName: appDetails.appStoreChartName,
                chartId: installedConfig.appStoreId,
                chartName: appDetails.appStoreAppName,
                version: appDetails.appStoreAppVersion,
                deprecated: installedConfig.deprecated,
            })
            setChartValues({
                id: appDetails.appStoreInstalledAppVersionId,
                appStoreVersionId: installedConfig.appStoreVersion,
                kind: 'DEPLOYED',
            })
            setModifiedValuesYaml(installedConfig.valuesOverrideYaml)
            fetchChartVersionsData(
                appDetails.appStoreChartId,
                false,
                true,
                setSelectedVersionUpdatePage,
                setChartVersionsData,
                setIsLoading,
                appDetails.appStoreAppVersion,
                selectVersion,
            )
            getChartValuesList(appDetails.appStoreChartId, setChartValuesList, setChartValues, setIsLoading)
            setIsLoading(false)
        } else if (isExternalApp) {
            getReleaseInfo(appId)
                .then((releaseInfoResponse: ReleaseInfoResponse) => {
                    const _releaseInfo = releaseInfoResponse.result.releaseInfo
                    const _installedAppInfo = releaseInfoResponse.result.installedAppInfo
                    setReleaseInfo(_releaseInfo)
                    setInstalledAppInfo(_installedAppInfo)

                    if (_installedAppInfo) {
                        initData(_installedAppInfo, _releaseInfo)
                    } else {
                        setRepoChartValue({
                            appStoreApplicationVersionId: 0,
                            chartRepoName: '',
                            chartId: 0,
                            chartName: _releaseInfo.deployedAppDetail.chartName,
                            version: _releaseInfo.deployedAppDetail.chartVersion,
                            deprecated: false,
                        })

                        const _chartVersionData: ChartVersionType = {
                            id: 0,
                            version: _releaseInfo.deployedAppDetail.chartVersion,
                        }

                        setSelectedVersionUpdatePage(_chartVersionData)
                        setChartVersionsData([_chartVersionData])

                        const _chartValues: ChartValuesType = {
                            id: 0,
                            kind: 'EXISTING',
                            name: _releaseInfo.deployedAppDetail.appName,
                        }

                        setChartValues(_chartValues)
                        setChartValuesList([_chartValues])
                        setModifiedValuesYaml(YAML.stringify(JSON.parse(_releaseInfo.mergedValues)))
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
        if (chartValues && ((chartValues.id && chartValues.chartVersion) || (isExternalApp && releaseInfo))) {
            setFetchingValuesYaml(true)
            if (chartValues.id && chartValues.chartVersion) {
                getChartValues(chartValues.id, chartValues.kind)
                    .then((response) => {
                        setModifiedValuesYaml(response.result.values || '')
                        setFetchingValuesYaml(false)

                        if (
                            activeTab === 'manifest' &&
                            (!isExternalApp || (isExternalApp && installedAppInfo)) &&
                            installedConfig &&
                            selectedVersionUpdatePage
                        ) {
                            getGeneratedHelManifest(
                                installedConfig,
                                chartValues.appStoreVersionId || chartValues.id,
                                response.result.values || modifiedValuesYaml,
                                setGeneratingManifest,
                                setGeneratedManifest,
                            )
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        setFetchingValuesYaml(false)
                    })
            } else if (
                isExternalApp &&
                releaseInfo.mergedValues &&
                releaseInfo.deployedAppDetail.appName === chartValues.name
            ) {
                setModifiedValuesYaml(YAML.stringify(JSON.parse(releaseInfo.mergedValues)))
                setFetchingValuesYaml(false)
            }
        }
    }, [chartValues])

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
            selectedVersionUpdatePage &&
            selectedVersionUpdatePage.id &&
            !fetchedReadMe.has(selectedVersionUpdatePage.id) &&
            activeTab !== 'manifest'
        ) {
            getChartRelatedReadMe(selectedVersionUpdatePage.id, setFetchingReadMe, handleFetchedReadMe)
        }
    }, [selectedVersionUpdatePage])

    useEffect(() => {
        if (installedConfig?.environmentId && environments.length) {
            let environment = environments.find((e) => e.value.toString() === installedConfig.environmentId.toString())
            selectEnvironment(environment)
        }
    }, [installedConfig?.environmentId, environments, installedConfig])

    useEffect(() => {
        if (installedConfig?.teamId && projects.length) {
            let project = projects.find((e) => e.value.toString() === installedConfig.teamId.toString())
            selectProject(project)
        }
    }, [installedConfig?.teamId, projects, installedConfig])

    useEffect(() => {
        if (
            activeTab === 'manifest' &&
            installedConfig &&
            (!generatedManifest || (generatedManifest && hasChartChanged()))
        ) {
            getGeneratedHelManifest(
                installedConfig,
                chartValues?.appStoreVersionId || chartValues?.id || installedConfig.appStoreVersion,
                isExternalApp ? releaseInfo?.mergedValues : installedConfig.valuesOverrideYaml,
                setGeneratingManifest,
                setGeneratedManifest,
            )
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
                true,
                false,
                setSelectedVersionUpdatePage,
                setChartVersionsData,
                setIsLoading,
                _releaseInfo.deployedAppDetail.chartVersion,
                selectVersion,
            )
            getChartValuesList(_repoChartValue.chartId, setChartValuesList, setChartValues)

            setInstalledConfig(result)
            setRepoChartValue(_repoChartValue)
            setChartValues({
                id: _installedAppInfo.installedAppVersionId,
                appStoreVersionId: result?.appStoreVersion,
                kind: 'DEPLOYED',
                name: _releaseInfo.deployedAppDetail.appName,
            })
            setModifiedValuesYaml(result?.valuesOverrideYaml)
        } catch (e) {
            setIsLoading(false)
        }
    }

    const handleRepoChartValueChange = (event) => {
        setRepoChartValue(event)

        if (isExternalApp) {
            fetchChartVersionsData(
                event.chartId,
                true,
                false,
                setSelectedVersionUpdatePage,
                setChartVersionsData,
                undefined,
                releaseInfo.deployedAppDetail.chartVersion,
                selectVersion,
            )
            getChartValuesList(
                event.chartId,
                (_chartValuesList: ChartValuesType[]) => {
                    if (!installedAppInfo) {
                        const _defaultChartValues: ChartValuesType = {
                            id: 0,
                            kind: 'EXISTING',
                            name: releaseInfo.deployedAppDetail.appName,
                        }

                        _chartValuesList?.push(_defaultChartValues)
                        setChartValues(_defaultChartValues)
                    }

                    setChartValuesList(_chartValuesList)
                },
                setChartValues,
            )
        } else {
            fetchChartVersionsData(event.chartId, false, true, setSelectedVersionUpdatePage, setChartVersionsData)
            getChartValuesList(
                event.chartId,
                setChartValuesList,
                setChartValues,
                undefined,
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
        if (isExternalApp && !installedAppInfo) {
            return deleteApplicationRelease(appId)
        } else {
            return deleteInstalledChart(installedConfig.installedAppId, force)
        }
    }

    const hasChartChanged = () => {
        return (
            repoChartValue &&
            ((isExternalApp &&
                ((!installedAppInfo && !!repoChartValue.chartRepoName) ||
                    (installedAppInfo && installedAppInfo.appStoreChartRepoName !== repoChartValue.chartRepoName))) ||
                (!isExternalApp && installedConfig.appStoreId !== repoChartValue.chartId))
        )
    }

    const updateApplication = async (forceUpdate?: boolean) => {
        if (isUpdateInProgress) {
            return
        }

        if (isExternalApp && !forceUpdate && !installedAppInfo && !repoChartValue?.chartRepoName) {
            setShowAppNotLinkedDialog(true)
            return
        }

        // validate data
        try {
            JSON.stringify(YAML.parse(modifiedValuesYaml))
        } catch (err) {
            toast.error(`Encountered data validation error while updating. “${err}”`)
            return
        }

        setUpdateInProgress(true)

        try {
            let res

            if (isExternalApp && !installedAppInfo) {
                if (!forceUpdate) {
                    const payload: LinkToChartStoreRequest = {
                        appId: appId,
                        valuesYaml: modifiedValuesYaml,
                        appStoreApplicationVersionId: selectedVersionUpdatePage.id,
                        referenceValueId: selectedVersionUpdatePage.id,
                        referenceValueKind: chartValues.kind,
                    }
                    res = await linkToChartStore(payload)
                } else {
                    const payload: UpdateAppReleaseWithoutLinkingRequest = {
                        appId: appId,
                        valuesYaml: modifiedValuesYaml,
                    }
                    res = await updateAppReleaseWithoutLinking(payload)
                }
            } else if (isDeployChartView) {
                const payload = {
                    teamId: selectedProject.value,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    environmentId: selectedEnvironment.value,
                    appStoreVersion: selectedVersion,
                    // valuesOverride: obj,
                    // valuesOverrideYaml: textRef,
                    appName,
                }
                res = await installChart(payload)
            } else {
                const payload: UpdateAppReleaseRequest = {
                    id: hasChartChanged() ? 0 : installedConfig.id,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    valuesOverrideYaml: modifiedValuesYaml,
                    installedAppId: installedConfig.installedAppId,
                    appStoreVersion: selectedVersionUpdatePage.id,
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
            setModifiedValuesYaml(codeEditorData)
        }
    }

    const redirectToChartValues = async () => {
        if (repoChartValue?.chartId) {
            history.push(getChartValuesURL(repoChartValue.chartId))
        }
    }

    const handleTabSwitch = useCallback(
        (e) => {
            if (e?.target && e.target.value !== activeTab) {
                setActiveTab(e.target.value)
                setOpenComparison(false)
                setOpenReadMe(false)
            }
        },
        [activeTab],
    )

    const renderReadMeOption = () => {
        return (
            <span
                className={`chart-values-view__option flex fs-13 fw-6 cn-7 ${
                    fetchingReadMe || !fetchedReadMe.get(selectedVersionUpdatePage?.id)
                        ? 'cursor-not-allowed'
                        : 'cursor'
                }`}
                onClick={() => {
                    if (fetchingReadMe) {
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
                disabled={isExternalApp && !installedAppInfo}
                onChange={handleTabSwitch}
            >
                {/* <RadioGroup.Radio value="gui">GUI (Basic)</RadioGroup.Radio> */}
                <RadioGroup.Radio value="yaml">
                    <Edit className="icon-dim-12 mr-6" />
                    YAML
                </RadioGroup.Radio>
                <RadioGroup.Radio
                    value="manifest"
                    showTippy={isExternalApp && !installedAppInfo}
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
                                renderComparisonOption()
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
                            {!openReadMe && (fetchingReadMe || !fetchedReadMe.get(selectedVersionUpdatePage?.id)) ? (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={fetchingReadMe ? 'Fetching...' : 'Readme is not available for this chart'}
                                >
                                    {renderReadMeOption()}
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

    function renderData() {
        return (
            <div
                className={`chart-values-view__container bcn-0 ${openReadMe ? 'readmeOpened' : ''} ${
                    openComparison ? 'comparisonOpened' : ''
                }`}
            >
                {renderValuesTabsContainer()}
                <div className="chart-values-view__hr-divider bcn-2" />
                <div className="chart-values-view__wrapper">
                    <div className="chart-values-view__details">
                        {isDeployChartView && (
                            <label className="form__row form__row--w-100">
                                <span className="form__label required-field">App Name</span>
                                <input
                                    autoComplete="off"
                                    tabIndex={1}
                                    placeholder="Eg. kube-prometheus"
                                    className="form__input"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                />
                            </label>
                        )}
                        {!isExternalApp &&
                            ((!isDeployChartView && selectedProject) ||
                                (isDeployChartView && serverMode === SERVER_MODE.FULL)) && (
                                <ChartProjectSelector
                                    isDeployChartView={isDeployChartView}
                                    selectedProject={selectedProject}
                                    selectProject={selectProject}
                                    projects={projects}
                                />
                            )}
                        {isDeployChartView ||
                            (!isDeployChartView && (isExternalApp || selectedEnvironment) && (
                                <ChartEnvironmentSelector
                                    isExternal={isExternalApp}
                                    isDeployChartView={isDeployChartView}
                                    installedAppInfo={installedAppInfo}
                                    releaseInfo={releaseInfo}
                                    isUpdate={!!isUpdate}
                                    selectedEnvironment={selectedEnvironment}
                                    selectEnvironment={selectEnvironment}
                                    environments={environments}
                                />
                            ))}
                        <div className="chart-values-view__hr-divider bcn-1 mt-16 mb-16" />
                        {!isDeployChartView && (
                            <ChartRepoSelector
                                isExternal={isExternalApp}
                                isUpdate={!!isUpdate}
                                installedAppInfo={installedAppInfo}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                repoChartValue={repoChartValue}
                                chartDetails={repoChartValue}
                            />
                        )}
                        {(installedAppInfo || (!installedAppInfo && repoChartValue?.chartRepoName)) && (
                            <>
                                <ChartVersionSelector
                                    isUpdate={isUpdate}
                                    selectedVersion={selectedVersion}
                                    selectVersion={selectVersion}
                                    selectedVersionUpdatePage={selectedVersionUpdatePage}
                                    setSelectedVersionUpdatePage={setSelectedVersionUpdatePage}
                                    chartVersionsData={chartVersionsData}
                                />
                                <ChartValuesSelector
                                    chartValuesList={chartValuesList}
                                    chartValues={chartValues}
                                    redirectToChartValues={redirectToChartValues}
                                    setChartValues={setChartValues}
                                    hideVersionFromLabel={!installedAppInfo && chartValues.kind === 'EXISTING'}
                                />
                            </>
                        )}
                        {!isDeployChartView && (
                            <button
                                className="chart-values-view__delete-cta cta delete"
                                disabled={isUpdateInProgress || isDeleteInProgress}
                                onClick={(e) => setShowDeleteAppConfirmationDialog(true)}
                            >
                                {isDeleteInProgress ? (
                                    <div className="flex">
                                        <span>Deleting</span>
                                        <span className="ml-10">
                                            <Progressing />
                                        </span>
                                    </div>
                                ) : (
                                    'Delete Application'
                                )}
                            </button>
                        )}
                    </div>
                    {openReadMe && (
                        <ActiveReadmeColumn
                            fetchingReadMe={fetchingReadMe}
                            activeReadMe={fetchedReadMe.get(selectedVersionUpdatePage?.id)}
                        />
                    )}
                    {!openComparison && <div className="chart-values-view__vr-divider bcn-2" />}
                    <div
                        className={`chart-values-view__editor ${
                            openReadMe || openComparison ? 'chart-values-view__full-mode' : ''
                        }`}
                    >
                        <ChartValuesEditor
                            loading={
                                (activeTab === 'yaml' && fetchingValuesYaml) ||
                                (activeTab === 'manifest' && generatingManifest)
                            }
                            isExternalApp={isExternalApp}
                            appId={appId}
                            appName={isExternalApp ? releaseInfo.deployedAppDetail.appName : installedConfig.appName}
                            valuesText={modifiedValuesYaml}
                            defaultValuesText={
                                isExternalApp
                                    ? YAML.stringify(JSON.parse(releaseInfo.mergedValues))
                                    : installedConfig?.valuesOverrideYaml
                            }
                            onChange={OnEditorValueChange}
                            repoChartValue={repoChartValue}
                            showEditorHeader={openReadMe}
                            hasChartChanged={hasChartChanged()}
                            showInfoText={!openReadMe && !openComparison}
                            manifestView={activeTab === 'manifest'}
                            generatedManifest={generatedManifest}
                            comparisonView={openComparison}
                            chartValuesList={chartValuesList}
                            deploymentHistoryList={deploymentHistoryArr}
                        />
                        {!openComparison && !openReadMe && (
                            <button
                                type="button"
                                tabIndex={6}
                                disabled={isUpdateInProgress || isDeleteInProgress}
                                className={`chart-values-view__update-cta cta ${
                                    isUpdateInProgress || isDeleteInProgress ? 'disabled' : ''
                                }`}
                                onClick={() => {
                                    if (isDeployChartView) {
                                        // Deploy chart
                                    } else {
                                        updateApplication(false)
                                    }
                                }}
                            >
                                {isUpdateInProgress ? (
                                    <div className="flex">
                                        <span>{isDeployChartView ? 'Deploying chart' : 'Updating and deploying'}</span>
                                        <span className="ml-10">
                                            <Progressing />
                                        </span>
                                    </div>
                                ) : isDeployChartView ? (
                                    'Deploy chart'
                                ) : (
                                    'Update and deploy'
                                )}
                            </button>
                        )}
                    </div>
                </div>
                {showDeleteAppConfirmationDialog && (
                    <DeleteChartDialog
                        appName={releaseInfo.deployedAppDetail.appName}
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
                    <AppNotLinkedDialog close={() => setShowAppNotLinkedDialog(false)} update={updateApplication} />
                )}
            </div>
        )
    }

    return (
        <>
            {isLoading && (
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            )}

            {!isLoading && errorResponseCode && (
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            )}

            {!isLoading &&
                !errorResponseCode &&
                (!isExternalApp || (isExternalApp && releaseInfo)) &&
                repoChartValue &&
                renderData()}
        </>
    )
}

export default ChartValuesView

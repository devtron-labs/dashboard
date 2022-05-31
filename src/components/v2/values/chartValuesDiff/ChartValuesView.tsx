import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { toast } from 'react-toastify'
import { showError, Progressing, ErrorScreenManager, sortCallback } from '../../../common'
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
import { deleteInstalledChart, getChartValues, getChartVersionDetails2 } from '../../../charts/charts.service'
import { ServerErrors } from '../../../../modals/commonTypes'
import { URLS } from '../../../../config'
import YAML from 'yaml'
import {
    ChartEnvironmentSelector,
    ChartRepoSelector,
    ChartVersionValuesSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartValuesEditor,
    AppNotLinkedDialog,
    StaticChartRepoInput,
    ChartValuesSelector,
    ChartVersionSelector,
} from '../common/ChartValuesSelectors'
import { ChartRepoOtions } from '../DeployChart'
import { ChartValuesType, ChartVersionType } from '../../../charts/charts.types'
import { fetchChartVersionsData, getChartValuesList } from '../common/chartValues.api'
import { getChartValuesURL } from '../../../charts/charts.helper'
import './ChartValuesView.scss'
import ReactSelect from 'react-select'
import { DropdownIndicator, styles } from '../../common/ReactSelect.utils'
import { menuList } from '../../../charts/charts.util'
import { OptionType } from '../../../app/types'
import { getEnvironmentListMin, getTeamListMin } from '../../../../services/service'
import { ReactComponent as File } from '../../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'

function ChartValuesView({ appId, isExternalApp }: { appId: string; isExternalApp: boolean }) {
    const history = useHistory()
    const { url } = useRouteMatch()

    const [isLoading, setIsLoading] = useState(true)
    const [fetchingValuesYaml, setFetchingValuesYaml] = useState(false)
    const [isUpdateInProgress, setUpdateInProgress] = useState(false)
    const [isDeleteInProgress, setDeleteInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [openReadMe, setOpenReadMe] = useState(false)
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
    const [installedConfig, setInstalledConfig] = useState(null)
    const [environments, setEnvironments] = useState([])
    const [selectedEnvironment, selectEnvironment] = useState<{ label: string; value: number }>()
    const [projects, setProjects] = useState([])
    const [selectedProject, selectProject] = useState<OptionType>()
    const deployChartRef = useRef<HTMLDivElement>(null)
    const isUpdate = isExternalApp || (installedConfig?.environmentId && installedConfig.teamId)

    // component load
    useEffect(() => {
        if (!isExternalApp) {
            fetchProjects()
            fetchEnvironments()
        }

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
    }, [])

    useEffect(() => {
        if (releaseInfo && chartValues) {
            setFetchingValuesYaml(true)
            if (
                chartValues.id &&
                chartValues.chartVersion &&
                chartValues.name !== releaseInfo.deployedAppDetail.appName
            ) {
                getChartValues(chartValues.id, chartValues.kind)
                    .then((response) => {
                        setModifiedValuesYaml(response.result.values || '')
                        setFetchingValuesYaml(false)
                    })
                    .catch((error) => {
                        showError(error)
                        setFetchingValuesYaml(false)
                    })
            } else if (releaseInfo.mergedValues && releaseInfo.deployedAppDetail.appName === chartValues.name) {
                setModifiedValuesYaml(YAML.stringify(JSON.parse(releaseInfo?.mergedValues)))
                setFetchingValuesYaml(false)
            }
        }
    }, [chartValues])

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
                kind: 'DEPLOYED',
                name: _releaseInfo.deployedAppDetail.appName,
            })
            setModifiedValuesYaml(result?.valuesOverrideYaml)
        } catch (e) {
            setIsLoading(false)
        }
    }

    const fetchProjects = async () => {
        let { result } = await getTeamListMin()
        let projectList = result.map((p) => {
            return { value: p.id, label: p.name }
        })
        projectList = projectList.sort((a, b) => sortCallback('label', a, b, true))
        setProjects(projectList)
    }

    const fetchEnvironments = async () => {
        let response = await getEnvironmentListMin()
        let envList = response.result ? response.result : []
        envList = envList.map((env) => {
            return { value: env.id, label: env.environment_name, active: env.active }
        })
        envList = envList.sort((a, b) => sortCallback('label', a, b, true))
        setEnvironments(envList)
    }

    const handleRepoChartValueChange = (event) => {
        setRepoChartValue(event)
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
    }

    const deleteApplication = () => {
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
            .catch((errors: ServerErrors) => {
                showError(errors)
                setDeleteInProgress(false)
            })
    }

    const getDeleteApplicationApi = (): Promise<any> => {
        if (installedAppInfo && installedAppInfo.installedAppId) {
            return deleteInstalledChart(installedAppInfo.installedAppId)
        } else {
            return deleteApplicationRelease(appId)
        }
    }

    const hasChartChanged = () => {
        return (
            repoChartValue &&
            ((!installedAppInfo && !!repoChartValue.chartRepoName) ||
                (installedAppInfo && installedAppInfo.appStoreChartRepoName !== repoChartValue.chartRepoName))
        )
    }

    const updateApplication = async (forceUpdate?: boolean) => {
        if (isUpdateInProgress) {
            return
        }

        if (!forceUpdate && !installedAppInfo && !repoChartValue?.chartRepoName) {
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
            if (!forceUpdate && !installedAppInfo) {
                const payload: LinkToChartStoreRequest = {
                    appId: appId,
                    valuesYaml: modifiedValuesYaml,
                    appStoreApplicationVersionId: selectedVersionUpdatePage.id,
                    referenceValueId: selectedVersionUpdatePage.id,
                    referenceValueKind: chartValues.kind,
                }
                res = await linkToChartStore(payload)
            } else if (!forceUpdate && installedAppInfo) {
                const payload: UpdateAppReleaseRequest = {
                    id: hasChartChanged() ? 0 : installedConfig?.id,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    valuesOverrideYaml: modifiedValuesYaml,
                    installedAppId: installedConfig.installedAppId,
                    appStoreVersion: selectedVersionUpdatePage.id,
                }
                res = await updateAppRelease(payload)
            } else {
                const payload: UpdateAppReleaseWithoutLinkingRequest = {
                    appId: appId,
                    valuesYaml: modifiedValuesYaml,
                }
                res = await updateAppReleaseWithoutLinking(payload)
            }

            setUpdateInProgress(false)

            if (res?.result && (res.result.success || res.result.appName)) {
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
        setModifiedValuesYaml(codeEditorData)
    }

    const redirectToChartValues = async () => {
        if (repoChartValue?.chartId) {
            history.push(getChartValuesURL(repoChartValue.chartId))
        }
    }

    const renderValuesTabsContainer = () => {
        return (
            <div className="chart-values-view__tabs-container flex content-space">
                <div></div>
                <div>
                    <span
                        className="chart-values-view__readme-option flex cursor"
                        onClick={() => setOpenReadMe(!openReadMe)}
                    >
                        {openReadMe ? (
                            <>
                                <Close className="readme-close__icon icon-dim-16 mr-8" />
                                Hide README
                            </>
                        ) : (
                            <>
                                <File className="readme-open__icon icon-dim-16 mr-8" />
                                README
                            </>
                        )}
                    </span>
                </div>
            </div>
        )
    }

    function renderData() {
        return (
            <div className={`chart-values-view__container bcn-0 ${openReadMe ? 'readmeOpened' : ''}`}>
                {renderValuesTabsContainer()}
                <div className="chart-values-view-divider bcn-2" />
                <div className="chart-values-view__wrapper">
                    <div className="chart-values-view__details">
                        {!isExternalApp && (
                            <label className="form__row form__row--w-100">
                                <span className="form__label">App Name</span>
                                <input
                                    autoComplete="off"
                                    tabIndex={1}
                                    placeholder="App name"
                                    className="form__input"
                                    value={installedConfig?.appName}
                                    autoFocus
                                    disabled={!!isUpdate}
                                    // onChange={(e) => setAppName(e.target.value)}
                                />
                            </label>
                        )}
                        {isExternalApp ? (
                            <div className="chart-values__project-container mb-12">
                                <h2 className="chart-values__project-label fs-13 fw-4 lh-20 cn-7">Project</h2>
                                <span className="chart-values__project-name fs-13 fw-6 lh-20 cn-9">
                                    {releaseInfo.deployedAppDetail.appName}
                                </span>
                            </div>
                        ) : (
                            <label className="form__row form__row--w-100">
                                <span className="form__label">Project</span>
                                <ReactSelect
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
                                    }}
                                    isDisabled={!!isUpdate}
                                    placeholder="Select Project"
                                    value={selectedProject}
                                    styles={{
                                        ...styles,
                                        ...menuList,
                                    }}
                                    onChange={selectProject}
                                    options={projects}
                                />
                            </label>
                        )}
                        <ChartEnvironmentSelector
                            isExternal={isExternalApp}
                            installedAppInfo={installedAppInfo}
                            releaseInfo={releaseInfo}
                            isUpdate={!!isUpdate}
                            selectedEnvironment={selectedEnvironment}
                            selectEnvironment={selectEnvironment}
                            environments={environments}
                        />
                        <div className="chart-values-view-divider bcn-1 mt-16 mb-16" />
                        <ChartRepoSelector
                            isExternal={isExternalApp}
                            installedAppInfo={installedAppInfo}
                            handleRepoChartValueChange={handleRepoChartValueChange}
                            repoChartValue={repoChartValue}
                            chartDetails={repoChartValue}
                        />
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
                    </div>
                    {openReadMe && (
                        <ActiveReadmeColumn
                            readmeCollapsed={openReadMe}
                            toggleReadmeCollapsed={setOpenReadMe}
                            defaultReadme={releaseInfo.readme}
                            selectedVersionUpdatePage={selectedVersionUpdatePage}
                        />
                    )}
                    <div className={`chart-values-view__editor ${openReadMe ? 'full-mode-view' : ''}`}>
                        <ChartValuesEditor
                            loading={fetchingValuesYaml}
                            valuesText={modifiedValuesYaml}
                            onChange={OnEditorValueChange}
                            repoChartValue={repoChartValue}
                            hasChartChanged={hasChartChanged()}
                            parentRef={deployChartRef}
                            autoFocus={!!installedAppInfo}
                        />
                        {!openReadMe && (
                            <button
                                type="button"
                                tabIndex={6}
                                disabled={isUpdateInProgress || isDeleteInProgress}
                                className={`chart-values-view__update-cta cta ${
                                    isUpdateInProgress || isDeleteInProgress ? 'disabled' : ''
                                }`}
                                onClick={() => updateApplication(false)}
                            >
                                {isUpdateInProgress ? (
                                    <div className="flex">
                                        <span>Updating and deploying</span>
                                        <span className="ml-10">
                                            <Progressing />
                                        </span>
                                    </div>
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

            {!isLoading && !errorResponseCode && releaseInfo && repoChartValue && renderData()}
        </>
    )
}

export default ChartValuesView

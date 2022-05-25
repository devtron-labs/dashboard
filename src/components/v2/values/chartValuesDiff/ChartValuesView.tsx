import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { toast } from 'react-toastify'
import { showError, Progressing, ErrorScreenManager } from '../../../common'
import {
    getReleaseInfo,
    ReleaseInfoResponse,
    ReleaseInfo,
    InstalledAppInfo,
    deleteApplicationRelease,
    updateApplicationRelease,
    UpdateApplicationRequest,
    linkToChartStore,
    LinkToChartStoreRequest,
} from '../../../external-apps/ExternalAppService'
import { deleteInstalledChart, getChartValues } from '../../../charts/charts.service'
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

function ChartValuesView({ appId }: { appId: string }) {
    const history = useHistory()
    const { url } = useRouteMatch()

    const [isLoading, setIsLoading] = useState(true)
    const [fetchingValuesYaml, setFetchingValuesYaml] = useState(false)
    const [isUpdateInProgress, setUpdateInProgress] = useState(false)
    const [isDeleteInProgress, setDeleteInProgress] = useState(false)
    const [errorResponseCode, setErrorResponseCode] = useState(undefined)
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true)
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
    const deployChartRef = useRef<HTMLDivElement>(null)

    // component load
    useEffect(() => {
        getReleaseInfo(appId)
            .then((releaseInfoResponse: ReleaseInfoResponse) => {
                const _releaseInfo = releaseInfoResponse.result.releaseInfo
                setReleaseInfo(_releaseInfo)

                if (!releaseInfoResponse.result.installedAppInfo) {
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
                }
                setInstalledAppInfo(releaseInfoResponse.result.installedAppInfo)
                setModifiedValuesYaml(YAML.stringify(JSON.parse(_releaseInfo.mergedValues)))
                setIsLoading(false)
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
            let result, errors
            if (!forceUpdate && !installedAppInfo) {
                const payload: LinkToChartStoreRequest = {
                    appId: appId,
                    valuesYaml: modifiedValuesYaml,
                    appStoreApplicationVersionId: selectedVersionUpdatePage.id,
                    referenceValueId: selectedVersionUpdatePage.id,
                    referenceValueKind: chartValues.kind,
                }
                const res = await linkToChartStore(payload)
                result = res.result
                errors = res.errors
            } else {
                const payload: UpdateApplicationRequest = {
                    appId: appId,
                    valuesYaml: modifiedValuesYaml,
                }
                const res = await updateApplicationRelease(payload)
                result = res.result
                errors = res.errors
            }

            setUpdateInProgress(false)

            if (result?.success) {
                toast.success('Update and deployment initiated.')
                history.push(`${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`)
            } else if (errors) {
                showError(errors)
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

    function renderData() {
        return (
            <div
                className={`chart-values-view__container bcn-0 ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'}`}
                style={{ height: 'calc(100vh - 50px)' }}
            >
                {/* <ActiveReadmeColumn
                    readmeCollapsed={readmeCollapsed}
                    toggleReadmeCollapsed={toggleReadmeCollapsed}
                    defaultReadme={releaseInfo.readme}
                    selectedVersionUpdatePage={selectedVersionUpdatePage}
                /> */}
                <div className="chart-values-view__wrapper h-100">
                    <div className="chart-values-view__details">
                        <div className="chart-values__project-container mb-12">
                            <h2 className="chart-values__project-label fs-13 fw-4 lh-20 cn-7">Project</h2>
                            <span className="chart-values__project-name fs-13 fw-6 lh-20 cn-9">
                                {releaseInfo.deployedAppDetail.appName}
                            </span>
                        </div>
                        <ChartEnvironmentSelector
                            isExternal={true}
                            installedAppInfo={installedAppInfo}
                            releaseInfo={releaseInfo}
                        />
                        <div className="chart-values-view-divider mt-16 mb-16" />
                        {installedAppInfo && <StaticChartRepoInput releaseInfo={releaseInfo} />}
                        {!installedAppInfo && (
                            <ChartRepoSelector
                                isExternal={true}
                                installedAppInfo={installedAppInfo}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                repoChartValue={repoChartValue}
                                chartDetails={{
                                    appStoreApplicationVersionId: 0,
                                    chartRepoName: releaseInfo.deployedAppDetail.chartName,
                                    chartId: 0,
                                    chartName: releaseInfo.deployedAppDetail.chartName,
                                    version: releaseInfo.deployedAppDetail.chartVersion,
                                    deprecated: false,
                                }}
                            />
                        )}
                        {!installedAppInfo && repoChartValue?.chartRepoName && (
                            <>
                                <ChartVersionSelector
                                    isUpdate={true}
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
                            // <ChartVersionValuesSelector
                            //     isUpdate={true}
                            //     selectedVersion={selectedVersion}
                            //     selectVersion={selectVersion}
                            //     selectedVersionUpdatePage={selectedVersionUpdatePage}
                            //     setSelectedVersionUpdatePage={setSelectedVersionUpdatePage}
                            //     chartVersionsData={chartVersionsData}
                            //     chartValuesList={chartValuesList}
                            //     chartValues={chartValues}
                            //     setChartValues={setChartValues}
                            //     hideVersionFromLabel={!installedAppInfo && chartValues.kind === 'EXISTING'}
                            //     redirectToChartValues={redirectToChartValues}
                            // />
                        )}
                        <button
                            className="cta delete"
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
                    <div className="chart-values-view__editor">
                        <ChartValuesEditor
                            loading={fetchingValuesYaml}
                            valuesText={modifiedValuesYaml}
                            onChange={OnEditorValueChange}
                            repoChartValue={repoChartValue}
                            hasChartChanged={!!repoChartValue?.chartRepoName}
                            parentRef={deployChartRef}
                            autoFocus={!!installedAppInfo}
                        />
                        <button
                            type="button"
                            tabIndex={6}
                            disabled={isUpdateInProgress || isDeleteInProgress}
                            className={`cta flex-1 float-right mt-12 mr-20 ${
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

            {!isLoading && !errorResponseCode && releaseInfo && renderData()}
        </>
    )
}

export default ChartValuesView

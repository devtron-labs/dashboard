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

import {
    ACTION_STATE,
    getRandomColor,
    handleRelativeDateSorting,
    Progressing,
    showError,
    SortingOrder,
    EditableTextArea,
    useSearchString,
    AppInfoListType,
    MODAL_TYPE,
    DEPLOYMENT_WINDOW_TYPE,
    ArtifactInfoModal,
    ArtifactInfoModalProps,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { HibernateModal } from './HibernateModal'
import HibernateStatusListDrawer from './HibernateStatusListDrawer'
import { RestartWorkloadModal } from './RestartWorkloadModal'
import { Moment12HourFormat } from '../../../../config'
import { importComponentFromFELibrary } from '../../../common'
import { getDeploymentStatus } from '../../AppGroup.service'
import {
    AppGroupDetailDefaultType,
    AppGroupListType,
    AppListDataType,
    HibernateModalProps,
    ManageAppsResponse,
    StatusDrawer,
} from '../../AppGroup.types'
import { GROUP_LIST_HEADER } from '../../Constants'
import { BIO_MAX_LENGTH, BIO_MAX_LENGTH_ERROR, URL_SEARCH_PARAMS } from './constants'
import { ReactComponent as ICInfoFilled } from '@Icons/ic-info-filled.svg'
import { ReactComponent as GridIconBlue } from '../../../../assets/icons/ic-grid-view-blue.svg'
import { ReactComponent as GridIcon } from '../../../../assets/icons/ic-grid-view.svg'
import { ReactComponent as HibernateIcon } from '../../../../assets/icons/ic-hibernate-3.svg'
import { ReactComponent as UnhibernateIcon } from '../../../../assets/icons/ic-unhibernate.svg'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { renderCIListHeader } from '../../../app/details/cdDetails/utils'
import './envOverview.scss'
import { EnvironmentOverviewTable } from '@Pages/Shared/EnvironmentOverviewTable/EnvironmentOverviewTable.component'
import { EnvironmentOverviewTableSortableKeys } from '@Pages/Shared/EnvironmentOverviewTable/EnvironmentOverview.constants'

const processDeploymentWindowAppGroupOverviewMap = importComponentFromFELibrary(
    'processDeploymentWindowAppGroupOverviewMap',
    null,
    'function',
)
const ClonePipelineButton = importComponentFromFELibrary('ClonePipelineButton', null, 'function')

export default function EnvironmentOverview({
    appGroupListData,
    filteredAppIds,
    isVirtualEnv,
    description,
    getAppListData,
    handleSaveDescription,
}: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const [appListData, setAppListData] = useState<AppListDataType>()
    const [loading, setLoading] = useState<boolean>()
    const [showHibernateStatusDrawer, setShowHibernateStatusDrawer] = useState<StatusDrawer>({
        hibernationOperation: true,
        showStatus: false,
        inProgress: false,
    })
    const [appStatusResponseList, setAppStatusResponseList] = useState<ManageAppsResponse[]>([])
    const timerId = useRef(null)
    const [selectedAppDetailsList, setSelectedAppDetailsList] = useState<AppInfoListType[]>([])
    const [openedHibernateModalType, setOpenedHibernateModalType] =
        useState<HibernateModalProps['openedHibernateModalType']>(null)
    const [commitInfoModalConfig, setCommitInfoModalConfig] = useState<Pick<
        ArtifactInfoModalProps,
        'ciArtifactId' | 'envId'
    > | null>(null)
    const [isDeploymentLoading, setIsDeploymentLoading] = useState<boolean>(false)
    const [showDefaultDrawer, setShowDefaultDrawer] = useState<boolean>(true)
    const [hibernateInfoMap, setHibernateInfoMap] = useState<
        Record<string, { type: string; excludedUserEmails: string[]; userActionState: ACTION_STATE; isActive: boolean }>
    >({})
    const [restartLoader, setRestartLoader] = useState<boolean>(false)
    // NOTE: there is a slim chance that the api is called before httpProtocol is set
    const httpProtocol = useRef('')
    const isDeploymentBlockedViaWindow = Object.values(hibernateInfoMap).some(
        ({ type, isActive }) =>
            (type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT && isActive) ||
            (type === DEPLOYMENT_WINDOW_TYPE.MAINTENANCE && !isActive),
    )

    useEffect(() => {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const protocol = entry.nextHopProtocol
                if (protocol && entry.initiatorType === 'fetch') {
                    httpProtocol.current = protocol
                    observer.disconnect()
                }
            })
        })

        observer.observe({ type: 'resource', buffered: true })
        return () => {
            observer.disconnect()
        }
    }, [])

    const { searchParams } = useSearchString()
    const history = useHistory()

    useEffect(() => {
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        }
    }, [])

    async function getDeploymentWindowEnvOverrideMetaData() {
        const appEnvTuples = selectedAppDetailsList.map((appDetail) => ({
            appId: +appDetail.appId,
            envId: +appDetail.envId,
        }))
        setIsDeploymentLoading(true)
        const _hibernate = await processDeploymentWindowAppGroupOverviewMap(appEnvTuples, setShowDefaultDrawer, envId)
        setHibernateInfoMap(_hibernate)
        setIsDeploymentLoading(false)
    }

    useEffect(() => {
        if (
            processDeploymentWindowAppGroupOverviewMap &&
            (openedHibernateModalType ||
                showHibernateStatusDrawer.showStatus ||
                location.search.includes(URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD))
        ) {
            getDeploymentWindowEnvOverrideMetaData()
        }
    }, [openedHibernateModalType, showHibernateStatusDrawer.showStatus, location.search])

    useEffect(() => {
        setLoading(true)
        fetchDeployments()
        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        }
    }, [appGroupListData])

    async function fetchDeployments() {
        try {
            const response = await getDeploymentStatus(+envId, filteredAppIds)
            if (response?.result) {
                let statusRecord = {}
                response.result.forEach((item) => {
                    statusRecord = {
                        ...statusRecord,
                        [item.appId]: {
                            status: item.deployStatus,
                            pipelineId: item.pipelineId,
                        },
                    }
                })

                parseAppListData(appGroupListData, statusRecord)
                setLoading(false)
            }
        } catch (err) {
            showError(err)
        }
    }

    const handleCheckboxSelect = (id: number, checked: boolean, allChecked: boolean) => {
        if (allChecked) {
            setSelectedAppDetailsList(checked ? appListData.appInfoList : [])
        } else {
            const targetApp = appListData.appInfoList.find((appInfo) => appInfo.appId === id)
            if (!targetApp) {
                return
            }

            if (checked) {
                setSelectedAppDetailsList([...selectedAppDetailsList, targetApp])
            } else {
                setSelectedAppDetailsList(selectedAppDetailsList.filter((app) => app.appId !== targetApp.appId))
            }
        }
    }

    const getDeploymentHistoryLink = (appId: number, pipelineId: number) =>
        `/application-group/${envId}/cd-details/${appId}/${pipelineId}/`

    const getAppRedirectLink = (appId: number, envId: number) => `/app/${appId}/details/${envId}`

    const sortAndUpdateAppListData = (_appListData) => {
        const { sortBy, sortOrder } = searchParams
        setAppListData({
            ..._appListData,
            ist: _appListData.appInfoList.sort((a, b) => {
                if (sortBy === EnvironmentOverviewTableSortableKeys.DEPLOYED_AT) {
                    return handleRelativeDateSorting(a.lastDeployed, b.lastDeployed, sortOrder)
                }

                return sortOrder === SortingOrder.ASC
                    ? a.application.localeCompare(b.application)
                    : b.application.localeCompare(a.application)
            }),
        })
    }

    useEffect(() => {
        if (appListData) {
            sortAndUpdateAppListData(appListData)
        }
    }, [searchParams.sortBy, searchParams.sortOrder])

    const parseAppListData = (
        data: AppGroupListType,
        statusRecord: Record<string, { status: string; pipelineId: number }>,
    ): void => {
        const parsedData = {
            environment: data.environmentName,
            namespace: data.namespace || '-',
            cluster: data.clusterName,
            appInfoList: [],
        }

        data?.apps?.forEach((app) => {
            const appInfo = {
                appId: app.appId,
                application: app.appName,
                appStatus: app.appStatus,
                deploymentStatus: statusRecord[app.appId].status,
                pipelineId: statusRecord[app.appId].pipelineId,
                lastDeployed: app.lastDeployedTime,
                lastDeployedBy: app.lastDeployedBy,
                lastDeployedImage: app.lastDeployedImage,
                commits: app.commits,
                ciArtifactId: app.ciArtifactId,
            }
            parsedData.appInfoList.push(appInfo)
        })

        parsedData.appInfoList = parsedData.appInfoList.sort((a, b) => a.application.localeCompare(b.application))

        sortAndUpdateAppListData(parsedData)
    }

    const closePopup = () => {
        setShowHibernateStatusDrawer({
            ...showHibernateStatusDrawer,
            showStatus: false,
            inProgress: false,
        })
    }

    const openHibernateModalPopup = () => {
        setOpenedHibernateModalType(MODAL_TYPE.HIBERNATE)
    }

    const openUnHibernateModalPopup = () => {
        setOpenedHibernateModalType(MODAL_TYPE.UNHIBERNATE)
    }

    const onClickShowBulkRestartModal = () => {
        const newParams = {
            ...searchParams,
            modal: URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD,
        }
        history.push({ search: new URLSearchParams(newParams).toString() })
    }

    const closeCommitInfoModal = () => {
        setCommitInfoModalConfig(null)
    }

    if (loading) {
        return (
            <div className="loading-state">
                <Progressing pageLoader />
            </div>
        )
    }

    const openCommitInfoModal = (ciArtifactId: number) => (e) => {
        e.stopPropagation()
        setCommitInfoModalConfig({
            envId,
            ciArtifactId: ciArtifactId,
        })
    }

    const environmentOverviewTableRows = appListData?.appInfoList?.map((appInfo) => ({
        environment: {
            id: appInfo.appId,
            name: appInfo.application,
            commits: appInfo.commits,
            deployedAt: appInfo.lastDeployed,
            status: appInfo.appStatus,
            deploymentStatus: appInfo.deploymentStatus,
            deployedBy: appInfo.lastDeployedBy,
            lastDeployedImage: appInfo.lastDeployedImage,
        },
        isChecked: selectedAppDetailsList.some(({ appId }) => appId === appInfo.appId),
        onLastDeployedImageClick: openCommitInfoModal(appInfo.ciArtifactId),
        onCommitClick: openCommitInfoModal(appInfo.ciArtifactId),
        deployedAtLink: getDeploymentHistoryLink(appInfo.appId, appInfo.pipelineId),
        redirectLink: getAppRedirectLink(appInfo.appId, +envId),
    }))

    const renderSideInfoColumn = () => {
        return (
            <aside className="flexbox-col dc__gap-16">
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <div className="mxh-64 dc__mxw-120 mh-40 w-100 h-100 flexbox">
                            <div className="flex dc__border-radius-8-imp mw-48 h-48 bcb-1">
                                <GridIconBlue className="w-32 h-32" />
                            </div>
                        </div>
                    </div>

                    <div className="fs-16 fw-7 lh-24 cn-9 dc__word-break font-merriweather">
                        {appGroupListData.environmentName}
                    </div>
                    <EditableTextArea
                        emptyState="Write a short description for this environment"
                        placeholder="Write a short description for this environment"
                        rows={4}
                        initialText={description}
                        updateContent={handleSaveDescription}
                        validations={{
                            maxLength: {
                                value: BIO_MAX_LENGTH,
                                message: BIO_MAX_LENGTH_ERROR,
                            },
                        }}
                    />
                </div>
                <div className="dc__border-top-n1" />
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Type</div>
                        <div className="flexbox flex-justify flex-align-center dc__gap-10 fs-13 fw-6 lh-20 cn-9">
                            {appGroupListData.environmentType}
                        </div>
                    </div>

                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Namespace</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">
                            <span>{appGroupListData.namespace}</span>
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Cluster</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">
                            <span>{appGroupListData.clusterName}</span>
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Created on</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break">
                            {appGroupListData.createdOn
                                ? moment(appGroupListData.createdOn).format(Moment12HourFormat)
                                : '-'}
                        </div>
                    </div>
                    <div>
                        <div className="fs-13 fw-4 lh-20 cn-7 mb-4">Created by</div>
                        <div className="fs-13 fw-6 lh-20 cn-9 dc__word-break flexbox flex-align-center dc__gap-8">
                            <div
                                className="icon-dim-20 mw-20 flexbox flex-justify-center flex-align-center dc__border-radius-50-per dc__uppercase cn-0 fw-4"
                                style={{ backgroundColor: getRandomColor(appGroupListData.createdBy) }}
                            >
                                {appGroupListData.createdBy[0]}
                            </div>
                            {appGroupListData.createdBy}
                        </div>
                    </div>
                </div>
            </aside>
        )
    }

    const renderOverviewModal = () => {
        if (location.search?.includes(URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD)) {
            return (
                <RestartWorkloadModal
                    selectedAppDetailsList={selectedAppDetailsList}
                    envName={appListData.environment}
                    envId={envId}
                    setRestartLoader={setRestartLoader}
                    restartLoader={restartLoader}
                    hibernateInfoMap={hibernateInfoMap}
                    httpProtocol={httpProtocol.current}
                    isDeploymentBlockedViaWindow={isDeploymentBlockedViaWindow}
                />
            )
        }

        if (openedHibernateModalType) {
            return (
                <HibernateModal
                    selectedAppDetailsList={selectedAppDetailsList}
                    appDetailsList={appGroupListData.apps}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenedHibernateModalType={setOpenedHibernateModalType}
                    setAppStatusResponseList={setAppStatusResponseList}
                    setShowHibernateStatusDrawer={setShowHibernateStatusDrawer}
                    isDeploymentWindowLoading={isDeploymentLoading}
                    showDefaultDrawer={showDefaultDrawer}
                    httpProtocol={httpProtocol.current}
                    openedHibernateModalType={openedHibernateModalType}
                    isDeploymentBlockedViaWindow={isDeploymentBlockedViaWindow}
                />
            )
        }

        if (showHibernateStatusDrawer.showStatus || showHibernateStatusDrawer.inProgress) {
            return (
                <HibernateStatusListDrawer
                    closePopup={closePopup}
                    envName={appListData.environment}
                    responseList={appStatusResponseList}
                    getAppListData={getAppListData}
                    showHibernateStatusDrawer={showHibernateStatusDrawer}
                    hibernateInfoMap={hibernateInfoMap}
                    isDeploymentWindowLoading={isDeploymentLoading}
                />
            )
        }

        if (commitInfoModalConfig) {
            return (
                <ArtifactInfoModal
                    ciArtifactId={commitInfoModalConfig.ciArtifactId}
                    envId={commitInfoModalConfig.envId}
                    handleClose={closeCommitInfoModal}
                    renderCIListHeader={renderCIListHeader}
                />
            )
        }

        return null
    }

    return appListData?.appInfoList?.length > 0 ? (
        <div className="env-overview-container dc__content-center bcn-0  pt-20 pb-20 pl-20 pr-20">
            <div>{renderSideInfoColumn()}</div>
            <div className="dc__h-fit-content mw-none">
                <div className="flex column left">
                    <div className="dc__align-self-stretch flex dc__content-space left fs-14 h-30 fw-6 lh-20 cn-9 mb-12">
                        <span className="flex">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                        </span>
                        {selectedAppDetailsList.length > 0 ? (
                            <div className="flexbox dc__gap-6">
                                {ClonePipelineButton && appListData.environment && (
                                    <ClonePipelineButton
                                        sourceEnvironmentName={appListData.environment}
                                        selectedAppDetailsList={selectedAppDetailsList}
                                        httpProtocol={httpProtocol.current}
                                    />
                                )}

                                <button
                                    onClick={openHibernateModalPopup}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex h-28"
                                >
                                    <HibernateIcon className="icon-dim-12 mr-4" />
                                    Hibernate
                                </button>
                                <button
                                    onClick={openUnHibernateModalPopup}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex h-28"
                                >
                                    <UnhibernateIcon className="icon-dim-12 mr-4" />
                                    Unhibernate
                                </button>
                                <button
                                    onClick={onClickShowBulkRestartModal}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex h-28"
                                >
                                    <RotateIcon className="icon-dim-12 mr-4 scn-9" />
                                    Restart Workload
                                </button>
                            </div>
                        ) : (
                            <p className="m-0 flex dc__gap-8 cn-9 fs-13 lh-20 fw-4">
                                <ICInfoFilled className="icon-dim-20" />
                                <span>Select applications to take bulk actions</span>
                            </p>
                        )}
                    </div>
                    <EnvironmentOverviewTable
                        rows={environmentOverviewTableRows}
                        isVirtualEnv={isVirtualEnv}
                        onCheckboxSelect={handleCheckboxSelect}
                    />
                </div>
            </div>
            {renderOverviewModal()}
        </div>
    ) : null
}

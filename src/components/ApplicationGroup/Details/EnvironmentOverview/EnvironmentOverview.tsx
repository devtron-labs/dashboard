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
    AppStatus,
    getRandomColor,
    handleRelativeDateSorting,
    processDeployedTime,
    Progressing,
    showError,
    SortableTableHeaderCell,
    SortingOrder,
    useUrlFilters,
    EditableTextArea,
    useSearchString,
    AppInfoListType,
    MODAL_TYPE,
    DEPLOYMENT_WINDOW_TYPE,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { HibernateModal } from './HibernateModal'
import HibernateStatusListDrawer from './HibernateStatusListDrawer'
import { RestartWorkloadModal } from './RestartWorkloadModal'
import { Moment12HourFormat } from '../../../../config'
import CommitChipCell from '../../../../Pages/Shared/CommitChipCell'
import { StatusConstants } from '../../../app/list-new/Constants'
import { TriggerInfoModal, TriggerInfoModalProps } from '../../../app/list/TriggerInfo'
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
import { EnvironmentOverviewSortableKeys, GROUP_LIST_HEADER, OVERVIEW_HEADER } from '../../Constants'
import { BIO_MAX_LENGTH, BIO_MAX_LENGTH_ERROR, URL_SEARCH_PARAMS } from './constants'
import { ReactComponent as DockerIcon } from '../../../../assets/icons/git/docker.svg'
import { ReactComponent as ActivityIcon } from '../../../../assets/icons/ic-activity.svg'
import { ReactComponent as ArrowLineDown } from '../../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as DevtronIcon } from '../../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as GridIconBlue } from '../../../../assets/icons/ic-grid-view-blue.svg'
import { ReactComponent as GridIcon } from '../../../../assets/icons/ic-grid-view.svg'
import { ReactComponent as HibernateIcon } from '../../../../assets/icons/ic-hibernate-3.svg'
import { ReactComponent as UnhibernateIcon } from '../../../../assets/icons/ic-unhibernate.svg'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import './envOverview.scss'

const processDeploymentWindowAppGroupOverviewMap = importComponentFromFELibrary(
    'processDeploymentWindowAppGroupOverviewMap',
    null,
    'function',
)

// Adding here since in prompt re-direction PR have organized above imports to send them above
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
    const [isHovered, setIsHovered] = useState<number>(null)
    const [isLastDeployedExpanded, setIsLastDeployedExpanded] = useState<boolean>(false)
    const [commitInfoModalConfig, setCommitInfoModalConfig] = useState<Pick<
        TriggerInfoModalProps,
        'ciArtifactId' | 'envId'
    > | null>(null)
    const lastDeployedClassName = isLastDeployedExpanded ? 'last-deployed-expanded' : ''
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

    const { sortBy, sortOrder, handleSorting } = useUrlFilters({
        initialSortKey: EnvironmentOverviewSortableKeys.application,
    })

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

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked, value } = e.target

        if (value === 'ALL') {
            if (checked) {
                setSelectedAppDetailsList(appListData.appInfoList)
                return
            }

            setSelectedAppDetailsList([])
            return
        }

        const targetApp = appListData.appInfoList.find((appInfo) => appInfo.appId === +value)
        if (!targetApp) {
            return
        }

        if (checked) {
            setSelectedAppDetailsList([...selectedAppDetailsList, targetApp])
            return
        }

        setSelectedAppDetailsList(selectedAppDetailsList.filter((app) => app.appId !== targetApp.appId))
    }

    const toggleIsLastDeployedExpanded = () => {
        setIsLastDeployedExpanded(!isLastDeployedExpanded)
    }

    const getDeploymentHistoryLink = (appId: number, pipelineId: number) =>
        `/application-group/${envId}/cd-details/${appId}/${pipelineId}/`

    const sortByApplication = () => {
        handleSorting(EnvironmentOverviewSortableKeys.application)
    }

    const sortByDeployedAt = () => {
        handleSorting(EnvironmentOverviewSortableKeys.deployedAt)
    }

    const sortAndUpdateAppListData = (_appListData) => {
        setAppListData({
            ..._appListData,
            appInfoList: _appListData.appInfoList.sort((a, b) => {
                if (sortBy === EnvironmentOverviewSortableKeys.deployedAt) {
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
    }, [sortBy, sortOrder])

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

    const renderAppInfoRow = (item: AppInfoListType, index: number) => {
        const isSelected = selectedAppDetailsList.some((appDetail) => appDetail.appId === item.appId)

        const openCommitInfoModal = (e) => {
            e.stopPropagation()
            setCommitInfoModalConfig({
                envId,
                ciArtifactId: item.ciArtifactId,
            })
        }

        return (
            <div
                key={`${item.application}-${index}`}
                className={`app-deployments-info-row dc__w-fit-inherit display-grid dc__align-items-center ${
                    isHovered === index ? 'bc-n50' : 'bcn-0'
                } ${lastDeployedClassName}`}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
            >
                <div
                    className={`pl-16 pr-16 app-deployment-info-row-leftsection h-100 dc__border-right-n1 dc__align-items-center display-grid dc__position-sticky sticky-column dc__ellipsis-right  ${
                        isHovered === index ? 'bc-n50' : 'bcn-0'
                    }`}
                >
                    {isHovered !== index && !isSelected ? (
                        <DevtronIcon className="icon-dim-20" />
                    ) : (
                        <label className="dc__position-rel pointer mb-0">
                            <input
                                type="checkbox"
                                className="form__checkbox"
                                value={item.appId}
                                onChange={handleSelect}
                                checked={isSelected}
                            />
                            <span className={`form__checkbox-container ${isSelected ? 'tick-icon' : ''}`} />
                        </label>
                    )}
                    {!isVirtualEnv && <AppStatus appStatus={item.appStatus} hideStatusMessage />}
                    <span className="fs-13 fw-4 cn-7 dc__ellipsis-right">{item.application}</span>
                </div>
                <AppStatus
                    appStatus={item.lastDeployed ? item.deploymentStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                    isDeploymentStatus
                    isVirtualEnv={isVirtualEnv}
                />
                {item?.lastDeployedImage && (
                    <div className="cn-7 fs-14 lh-20 flexbox">
                        <Tippy content={item.lastDeployedImage} className="default-tt" placement="auto">
                            <div
                                className="env-deployments-info-row__last-deployed-cell bcn-1 br-6 pl-6 pr-6 flex dc__gap-4 cursor max-w-100"
                                onClick={openCommitInfoModal}
                            >
                                <DockerIcon className="icon-dim-14 mw-14" />
                                {isLastDeployedExpanded ? (
                                    <div className="mono dc__ellipsis-left direction-left">
                                        {item.lastDeployedImage}
                                    </div>
                                ) : (
                                    <>
                                        <div>…</div>
                                        <div className="mono dc__ellipsis-left direction-left text-overflow-clip">
                                            {item.lastDeployedImage.split(':').at(-1)}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Tippy>
                    </div>
                )}
                <CommitChipCell handleClick={openCommitInfoModal} commits={item?.commits} />
                {item?.lastDeployedBy && (
                    <span
                        className="fs-13 fw-4 cn-9 dc__word-break flex left dc__gap-6 pr-8 mw-none"
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <span className="flex left dc__gap-8">
                            <span
                                className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4"
                                style={{
                                    backgroundColor: getRandomColor(item?.lastDeployedBy),
                                }}
                            >
                                {item?.lastDeployedBy[0]}
                            </span>
                            <span>{item?.lastDeployedBy}</span>
                        </span>
                        <Link to={getDeploymentHistoryLink(item.appId, item.pipelineId)}>
                            {processDeployedTime(item?.lastDeployed, true)}
                        </Link>
                    </span>
                )}
            </div>
        )
    }

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
            return <TriggerInfoModal {...commitInfoModalConfig} close={closeCommitInfoModal} />
        }

        return null
    }

    return appListData?.appInfoList?.length > 0 ? (
        <div className="env-overview-container dc__content-center bcn-0  pt-20 pb-20 pl-20 pr-20">
            <div>{renderSideInfoColumn()}</div>
            <div className="dc__h-fit-content">
                <div className="flex column left">
                    <div className="dc__align-self-stretch flex dc__content-space left fs-14 h-30 fw-6 lh-20 cn-9 mb-12">
                        <span className="flex">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                        </span>
                        {selectedAppDetailsList.length > 0 && (
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
                        )}
                    </div>
                    <div className="app-deployments-info-wrapper dc__overflow-scroll w-100 dc__position-rel min-w-500">
                        <div
                            className={`app-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7 ${lastDeployedClassName}`}
                        >
                            <div className="pl-16 pr-16 app-deployment-info-row-leftsection dc__border-right-n1 display-grid dc__position-sticky sticky-column bcn-0 h-100 dc__align-items-center dc__ellipsis-right">
                                <label className="dc__position-rel pointer m-0-imp">
                                    <input
                                        type="checkbox"
                                        className="form__checkbox"
                                        value="ALL"
                                        onChange={handleSelect}
                                        checked={selectedAppDetailsList.length === appListData.appInfoList.length}
                                    />
                                    <span
                                        className={`form__checkbox-container ${
                                            selectedAppDetailsList.length === appListData.appInfoList.length
                                                ? 'tick-icon'
                                                : selectedAppDetailsList.length > 0
                                                  ? 'any-selected'
                                                  : ''
                                        }`}
                                    />
                                </label>
                                {!isVirtualEnv && <ActivityIcon className="icon-dim-16" />}
                                <SortableTableHeaderCell
                                    title={OVERVIEW_HEADER.APPLICATION}
                                    triggerSorting={sortByApplication}
                                    isSorted={sortBy === EnvironmentOverviewSortableKeys.application}
                                    sortOrder={sortOrder}
                                    disabled={loading}
                                />
                            </div>
                            <span>{OVERVIEW_HEADER.DEPLOYMENT_STATUS}</span>
                            <button
                                type="button"
                                className="dc__outline-none-imp p-0 dc__uppercase dc__transparent flexbox dc__align-items-center dc__gap-4"
                                onClick={toggleIsLastDeployedExpanded}
                            >
                                <span>{OVERVIEW_HEADER.LAST_DEPLOYED}</span>
                                <ArrowLineDown
                                    className="icon-dim-14 scn-5 rotate"
                                    style={{ ['--rotateBy' as any]: isLastDeployedExpanded ? '90deg' : '-90deg' }}
                                />
                            </button>
                            <span>{OVERVIEW_HEADER.COMMIT}</span>
                            <SortableTableHeaderCell
                                title={OVERVIEW_HEADER.DEPLOYED_AT}
                                triggerSorting={sortByDeployedAt}
                                isSorted={sortBy === EnvironmentOverviewSortableKeys.deployedAt}
                                sortOrder={sortOrder}
                                disabled={loading}
                            />
                        </div>
                        <div>{appListData.appInfoList.map((item, index) => renderAppInfoRow(item, index))}</div>
                    </div>
                </div>
            </div>

            {renderOverviewModal()}
        </div>
    ) : null
}

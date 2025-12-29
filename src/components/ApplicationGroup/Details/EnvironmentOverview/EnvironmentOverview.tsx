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

import { useEffect, useRef, useState } from 'react'
import { generatePath, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    ACTION_STATE,
    AppInfoListType,
    ArtifactInfoModal,
    ArtifactInfoModalProps,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DEPLOYMENT_WINDOW_TYPE,
    EditableTextArea,
    getRandomColor,
    Icon,
    MODAL_TYPE,
    Progressing,
    showError,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as GridIcon } from '@Icons/ic-grid-view.svg'
import { ReactComponent as GridIconBlue } from '@Icons/ic-grid-view-blue.svg'
import { renderCIListHeader } from '@Components/app/details/cdDetails/utils'
import { getDeploymentStatus } from '@Components/ApplicationGroup/AppGroup.service'
import {
    AppGroupDetailDefaultType,
    AppListDataType,
    HibernateModalProps,
    ManageAppsResponse,
    StatusDrawer,
} from '@Components/ApplicationGroup/AppGroup.types'
import {
    getAppRedirectLink,
    getDeploymentHistoryLink,
    parseAppListData,
} from '@Components/ApplicationGroup/AppGroup.utils'
import { GROUP_LIST_HEADER } from '@Components/ApplicationGroup/Constants'
import { importComponentFromFELibrary } from '@Components/common'
import { Moment12HourFormat } from '@Config/constants'
import { URLS } from '@Config/routes'
import {
    EnvironmentOverviewBulkSelectionWidget,
    EnvironmentOverviewTable,
    EnvironmentOverviewTableRow,
} from '@Pages/Shared/EnvironmentOverviewTable'

import { BIO_MAX_LENGTH, BIO_MAX_LENGTH_ERROR, URL_SEARCH_PARAMS } from './constants'
import { HibernateModal } from './HibernateModal'
import HibernateStatusListDrawer from './HibernateStatusListDrawer'
import { RestartWorkloadModal } from './RestartWorkloadModal'

import './envOverview.scss'

const processDeploymentWindowAppGroupOverviewMap = importComponentFromFELibrary(
    'processDeploymentWindowAppGroupOverviewMap',
    null,
    'function',
)
const BulkManageTrafficDrawer = importComponentFromFELibrary('BulkManageTrafficDrawer', null, 'function')
const ManageTrafficButton = importComponentFromFELibrary('ManageTrafficButton', null, 'function')
const ClonePipelineMenuButton = importComponentFromFELibrary('ClonePipelineMenuButton', null, 'function')
const ClonePipelineModal = importComponentFromFELibrary('ClonePipelineModal', null, 'function')
const getManageTrafficMenuButtonConfig = importComponentFromFELibrary(
    'getManageTrafficMenuButtonConfig',
    null,
    'function',
)

const ENV_OVERVIEW_PATH = `${URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}/:envId/${URLS.APP_OVERVIEW}`

const EnvironmentOverview = ({
    appGroupListData,
    filteredAppIds,
    isVirtualEnv,
    description,
    getAppListData,
    handleSaveDescription,
}: AppGroupDetailDefaultType) => {
    // STATES
    const [loading, setLoading] = useState<boolean>(false)
    const [appListData, setAppListData] = useState<AppListDataType>()
    const [appStatusResponseList, setAppStatusResponseList] = useState<ManageAppsResponse[]>([])
    const [showHibernateStatusDrawer, setShowHibernateStatusDrawer] = useState<StatusDrawer>({
        hibernationOperation: true,
        showStatus: false,
        inProgress: false,
    })
    const [selectedAppDetailsList, setSelectedAppDetailsList] = useState<AppInfoListType[]>([])
    const [selectedAppDetails, setSelectedAppDetails] = useState<AppInfoListType>(null)
    const [openedHibernateModalType, setOpenedHibernateModalType] =
        useState<HibernateModalProps['openedHibernateModalType']>(null)
    const [openClonePipelineConfig, setOpenClonePipelineConfig] = useState(false)
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

    // HOOKS
    const {
        path,
        params: { envId },
    } = useRouteMatch<{ envId: string }>()
    const history = useHistory()
    const location = useLocation()
    const { searchParams } = useSearchString()

    // REFS
    const timerId = useRef<NodeJS.Timeout | null>(null)
    const parentRef = useRef<HTMLDivElement | null>(null)

    // CONSTANTS
    const isDeploymentBlockedViaWindow = Object.values(hibernateInfoMap).some(
        ({ type, isActive }) =>
            (type === DEPLOYMENT_WINDOW_TYPE.BLACKOUT && isActive) ||
            (type === DEPLOYMENT_WINDOW_TYPE.MAINTENANCE && !isActive),
    )

    const isAppSelected = selectedAppDetails ?? !!selectedAppDetailsList.length
    const selectedApps = selectedAppDetails ?? selectedAppDetailsList

    useEffect(
        () => () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        },
        [],
    )

    // POLLING APIs
    const getDeploymentWindowEnvOverrideMetaData = async () => {
        const appEnvTuples = (selectedAppDetails ? [selectedAppDetails] : selectedAppDetailsList).map((appDetail) => ({
            appId: +appDetail.appId,
            envId: Number(envId),
        }))
        if (appEnvTuples.length) {
            setIsDeploymentLoading(true)
            const _hibernate = await processDeploymentWindowAppGroupOverviewMap(
                appEnvTuples,
                setShowDefaultDrawer,
                envId,
            )
            setHibernateInfoMap(_hibernate)
        }
        setIsDeploymentLoading(false)
    }

    useEffect(() => {
        if (
            processDeploymentWindowAppGroupOverviewMap &&
            isAppSelected &&
            (openedHibernateModalType ||
                showHibernateStatusDrawer.showStatus ||
                location.search.includes(URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD))
        ) {
            // TODO: can move to useAsync
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            getDeploymentWindowEnvOverrideMetaData()
        }
    }, [openedHibernateModalType, showHibernateStatusDrawer.showStatus, location.search, isAppSelected])

    const fetchDeployments = async () => {
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

                setAppListData(parseAppListData(appGroupListData, statusRecord))
                setLoading(false)
            }
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        setLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchDeployments()

        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        }
    }, [appGroupListData])

    // EARLY RETURN FOR LOADING
    if (loading) {
        return (
            <div className="flex-grow-1">
                <Progressing pageLoader />
            </div>
        )
    }

    // HANDLERS
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

    const closePopup = () => {
        setShowHibernateStatusDrawer({
            ...showHibernateStatusDrawer,
            showStatus: false,
            inProgress: false,
        })
    }

    const openHibernateModalPopup = () => {
        setIsDeploymentLoading(!!processDeploymentWindowAppGroupOverviewMap)
        setOpenedHibernateModalType(MODAL_TYPE.HIBERNATE)
    }

    const openUnHibernateModalPopup = () => {
        setIsDeploymentLoading(!!processDeploymentWindowAppGroupOverviewMap)
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

    const resetSelectedAppDetails = () => {
        setSelectedAppDetails(null)
    }

    const handleCloseClonePipelineModal = () => {
        setOpenClonePipelineConfig(null)
        resetSelectedAppDetails()
    }

    const openCommitInfoModal = (ciArtifactId: number) => (e) => {
        e.stopPropagation()
        setCommitInfoModalConfig({
            envId,
            ciArtifactId,
        })
    }

    const handleBulkSelectionWidgetClose = () => setSelectedAppDetailsList([])

    const getManageTrafficPath = () => generatePath(`${ENV_OVERVIEW_PATH}/${URLS.MANAGE_TRAFFIC}`, { envId })

    const handleOpenManageTrafficDrawer = () => {
        history.push(getManageTrafficPath())
    }

    const handleCloseManageTrafficDrawer = () => {
        history.push(generatePath(ENV_OVERVIEW_PATH, { envId }))
    }

    // CONFIGS
    const environmentOverviewTableRows = (appListData?.appInfoList ?? []).map<EnvironmentOverviewTableRow>(
        (appInfo) => ({
            app: {
                id: appInfo.appId,
                name: appInfo.application,
                commits: appInfo.commits,
                deployedAt: appInfo.lastDeployed,
                status: appInfo.appStatus,
                deploymentStatus: appInfo.deploymentStatus,
                deployedBy: appInfo.lastDeployedBy,
                lastDeployedImage: appInfo.lastDeployedImage,
            },
            popUpMenuItems: [
                ...((ClonePipelineMenuButton && appListData.environment
                    ? [
                          <ClonePipelineMenuButton
                              sourceEnvironmentName={appListData.environment}
                              onClick={() => {
                                  setSelectedAppDetails(appInfo)
                                  setOpenClonePipelineConfig(true)
                              }}
                          />,
                      ]
                    : []) as EnvironmentOverviewTableRow['popUpMenuItems']),
                {
                    label: 'Hibernate',
                    iconName: 'ic-hibernate-circle',
                    disabled: !appInfo.lastDeployed,
                    onClick: () => {
                        setSelectedAppDetails(appInfo)
                        openHibernateModalPopup()
                    },
                },
                {
                    label: 'Unhibernate',
                    iconName: 'ic-sun',
                    disabled: !appInfo.lastDeployed,
                    onClick: () => {
                        setSelectedAppDetails(appInfo)
                        openUnHibernateModalPopup()
                    },
                },
                {
                    label: 'Restart Workload',
                    iconName: 'ic-arrows-clockwise',
                    disabled: !appInfo.lastDeployed,
                    onClick: () => {
                        setSelectedAppDetails(appInfo)
                        onClickShowBulkRestartModal()
                    },
                },
            ],
            isChecked: selectedAppDetailsList.some(({ appId }) => appId === appInfo.appId),
            onLastDeployedImageClick: openCommitInfoModal(appInfo.ciArtifactId),
            onCommitClick: openCommitInfoModal(appInfo.ciArtifactId),
            deployedAtLink: getDeploymentHistoryLink(appInfo.appId, appInfo.pipelineId, envId),
            redirectLink: getAppRedirectLink(appInfo.appId, +envId),
        }),
    )

    // RENDERERS
    const renderOverviewModal = () => {
        if (isAppSelected && location.search?.includes(URL_SEARCH_PARAMS.BULK_RESTART_WORKLOAD)) {
            return (
                <RestartWorkloadModal
                    selectedAppDetailsList={selectedApps}
                    envName={appListData.environment}
                    envId={envId}
                    setRestartLoader={setRestartLoader}
                    restartLoader={restartLoader}
                    hibernateInfoMap={hibernateInfoMap}
                    isDeploymentBlockedViaWindow={isDeploymentBlockedViaWindow}
                    onClose={resetSelectedAppDetails}
                />
            )
        }

        if (isAppSelected && openedHibernateModalType) {
            return (
                <HibernateModal
                    selectedAppDetailsList={selectedApps}
                    appDetailsList={appGroupListData.apps}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenedHibernateModalType={setOpenedHibernateModalType}
                    setAppStatusResponseList={setAppStatusResponseList}
                    setShowHibernateStatusDrawer={setShowHibernateStatusDrawer}
                    isDeploymentWindowLoading={isDeploymentLoading}
                    showDefaultDrawer={showDefaultDrawer}
                    openedHibernateModalType={openedHibernateModalType}
                    isDeploymentBlockedViaWindow={isDeploymentBlockedViaWindow}
                    onClose={resetSelectedAppDetails}
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

        if (ClonePipelineModal && isAppSelected && openClonePipelineConfig) {
            return (
                <ClonePipelineModal
                    sourceEnvironmentName={appListData.environment}
                    selectedAppDetailsList={selectedApps}
                    handleCloseClonePipelineModal={handleCloseClonePipelineModal}
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

    return environmentOverviewTableRows.length > 0 ? (
        <>
            <Switch>
                {BulkManageTrafficDrawer && (
                    <Route path={`${path}/${URLS.MANAGE_TRAFFIC}`}>
                        <BulkManageTrafficDrawer
                            envId={+envId}
                            envName={appListData.environment}
                            appInfoList={appListData?.appInfoList}
                            initialSelectedAppList={selectedAppDetailsList}
                            onClose={handleCloseManageTrafficDrawer}
                        />
                    </Route>
                )}
            </Switch>
            <div
                ref={parentRef}
                className="env-overview-container flex-grow-1 dc__overflow-auto dc__content-center bg__primary p-20 dc__position-rel"
            >
                {/* SIDE INFO COLUMN */}
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

                {/* OVERVIEW TABLE */}
                <div className="mw-none">
                    <div className="dc__align-self-stretch flex dc__content-space left fs-14 h-30 fw-6 lh-20 cn-9 mb-12">
                        <span className="flex">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                        </span>
                        {window._env_.FEATURE_MANAGE_TRAFFIC_ENABLE && ManageTrafficButton && (
                            <ManageTrafficButton to={getManageTrafficPath()} />
                        )}
                    </div>
                    <EnvironmentOverviewTable
                        rows={environmentOverviewTableRows}
                        isVirtualEnv={isVirtualEnv}
                        onCheckboxSelect={handleCheckboxSelect}
                    />
                </div>
                {/* MODALS */}
                {renderOverviewModal()}

                {/* BULK SELECTION WIDGET */}
                {!!selectedAppDetailsList.length && (
                    <EnvironmentOverviewBulkSelectionWidget
                        parentRef={parentRef}
                        count={selectedAppDetailsList.length}
                        onClose={handleBulkSelectionWidgetClose}
                        popUpMenuItems={[
                            ...(window._env_.FEATURE_MANAGE_TRAFFIC_ENABLE && getManageTrafficMenuButtonConfig
                                ? [getManageTrafficMenuButtonConfig({ onClick: handleOpenManageTrafficDrawer })]
                                : []),
                            ...(ClonePipelineMenuButton && appListData.environment
                                ? [
                                      <ClonePipelineMenuButton
                                          sourceEnvironmentName={appListData.environment}
                                          onClick={() => {
                                              setOpenClonePipelineConfig(true)
                                          }}
                                      />,
                                  ]
                                : []),
                        ]}
                    >
                        <div className="flex dc__gap-4">
                            <Button
                                icon={<Icon name="ic-arrows-clockwise" color={null} />}
                                dataTestId="environment-overview-action-widget-restart-workloads"
                                style={ButtonStyleType.neutral}
                                variant={ButtonVariantType.borderLess}
                                ariaLabel="Restart Workloads"
                                size={ComponentSizeType.small}
                                onClick={onClickShowBulkRestartModal}
                            />
                            <Button
                                icon={<Icon name="ic-hibernate-circle" color={null} />}
                                dataTestId="environment-overview-action-widget-hibernate"
                                style={ButtonStyleType.neutral}
                                variant={ButtonVariantType.borderLess}
                                ariaLabel="Hibernate Applications"
                                size={ComponentSizeType.small}
                                onClick={openHibernateModalPopup}
                            />
                            <Button
                                icon={<Icon name="ic-sun" color={null} />}
                                dataTestId="environment-overview-action-widget-unhibernate"
                                style={ButtonStyleType.neutral}
                                variant={ButtonVariantType.borderLess}
                                ariaLabel="Unhibernate Applications"
                                size={ComponentSizeType.small}
                                onClick={openUnHibernateModalPopup}
                            />
                        </div>
                    </EnvironmentOverviewBulkSelectionWidget>
                )}
            </div>
        </>
    ) : null
}

export default EnvironmentOverview

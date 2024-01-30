import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    AppStatus,
    Progressing,
    getRandomColor,
    processDeployedTime,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import { ReactComponent as GridIcon } from '../../../../assets/icons/ic-grid-view.svg'
import { StatusConstants } from '../../../app/list-new/Constants'
import { EditableTextArea } from '../../../common'
import { GROUP_LIST_HEADER, OVERVIEW_HEADER } from '../../Constants'
import { getDeploymentStatus } from '../../AppGroup.service'
import {
    AppGroupDetailDefaultType,
    AppGroupListType,
    AppInfoListType,
    AppListDataType,
    ManageAppsResponse,
    StatusDrawer,
} from '../../AppGroup.types'
import './envOverview.scss'
import { Moment12HourFormat } from '../../../../config'
import { EditDescRequest } from '../../../app/types'
import { ReactComponent as ActivityIcon } from '../../../../assets/icons/ic-activity.svg'
import { ReactComponent as DockerIcon } from '../../../../assets/icons/git/docker.svg'
import { ReactComponent as HibernateIcon } from '../../../../assets/icons/ic-hibernate-3.svg'
import { ReactComponent as UnhibernateIcon } from '../../../../assets/icons/ic-unhibernate.svg'
import { ReactComponent as DevtronIcon } from '../../../../assets/icons/ic-devtron-app.svg'
import { ReactComponent as GridIconBlue } from '../../../../assets/icons/ic-grid-view-blue.svg'
import { ReactComponent as ArrowLineDown } from '../../../../assets/icons/ic-arrow-line-down.svg'
import { HibernateModal } from './HibernateModal'
import { UnhibernateModal } from './UnhibernateModal'
import HibernateStatusListDrawer from './HibernateStatusListDrawer'
import { BIO_MAX_LENGTH, BIO_MAX_LENGTH_ERROR } from './constants'

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
    })
    const [appStatusResponseList, setAppStatusResponseList] = useState<ManageAppsResponse[]>([])
    const timerId = useRef(null)
    const [selectedAppIds, setSelectedAppIds] = useState<number[]>([])
    const [openHiberateModal, setOpenHiberateModal] = useState<boolean>(false)
    const [openUnhiberateModal, setOpenUnhiberateModal] = useState<boolean>(false)
    const [isHovered, setIsHovered] = useState<number>(null)
    const [isLastDeployedExpanded, setIsLastDeployedExpanded] = useState<boolean>(false)
    const lastDeployedClassName = isLastDeployedExpanded ? 'last-deployed-expanded' : ''

    useEffect(() => {
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        }
    }, [])

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
                setLoading(false)

                parseAppListData(appGroupListData, statusRecord)
            }
        } catch (err) {
            showError(err)
        }
    }

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked, value } = e.target

        if (value === 'ALL') {
            if (checked) {
                setSelectedAppIds(appListData.appInfoList.map((item) => item.appId))
            } else {
                setSelectedAppIds([])
            }
        } else if (checked) {
            setSelectedAppIds([...selectedAppIds, +value])
        } else {
            setSelectedAppIds(selectedAppIds.filter((item) => item !== +value))
        }
    }

    const toggleIsLastDeployedExpanded = () => {
        setIsLastDeployedExpanded(!isLastDeployedExpanded)
    }

    const getDeploymentHistoryLink = (appId: number, pipelineId: number) =>
        `/application-group/${envId}/cd-details/${appId}/${pipelineId}/`

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
            }
            parsedData.appInfoList.push(appInfo)
        })

        parsedData.appInfoList = parsedData.appInfoList.sort((a, b) => a.application.localeCompare(b.application))

        setAppListData(parsedData)
    }

    const closePopup = () => {
        setShowHibernateStatusDrawer({
            ...showHibernateStatusDrawer,
            showStatus: false,
        })
    }

    const openHiberateModalPopup = () => {
        setOpenHiberateModal(true)
    }

    const openUnhiberateModalPopup = () => {
        setOpenUnhiberateModal(true)
    }

    if (loading) {
        return (
            <div className="loading-state">
                <Progressing pageLoader />
            </div>
        )
    }

    const renderAppInfoRow = (item: AppInfoListType, index: number) => {
        const isSelected = selectedAppIds.includes(item.appId)
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
                    className={`pl-16 pr-16 app-deployment-info-row-leftsection h-100 dc__border-right-n1 dc__align-items-center display-grid dc__position-sticky sticky-column ${
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
                    <div className="cn-7 fs-13 flexbox">
                        <Tippy content={item.lastDeployedImage} className="default-tt" placement="auto">
                            <div className="env-deployments-info-row__last-deployed-cell bcn-1 br-6 pl-6 pr-6 flex dc__gap-4">
                                <DockerIcon className="icon-dim-14" />
                                {isLastDeployedExpanded ? (
                                    <div className="mono dc__ellipsis-left direction-left">
                                        {item.lastDeployedImage}
                                    </div>
                                ) : (
                                    <>
                                        <div>...</div>
                                        <div className="mono dc__ellipsis-left direction-left text-overflow-clip">
                                            {item.lastDeployedImage.split(':').at(-1)}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Tippy>
                    </div>
                )}
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

    return appListData ? (
        <div className="env-overview-container dc__content-center bcn-0  pt-20 pb-20 pl-20 pr-20">
            <div>{renderSideInfoColumn()}</div>
            <div className="dc__h-fit-content">
                <div className="flex column left">
                    <div className="dc__align-self-stretch flex dc__content-space left fs-14 h-30 fw-6 lh-20 cn-9 mb-12">
                        <span className="flex">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                        </span>
                        {selectedAppIds.length > 0 && (
                            <div className="flexbox dc__gap-6">
                                <button
                                    onClick={openHiberateModalPopup}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex h-28"
                                >
                                    <HibernateIcon className="icon-dim-12 mr-4" />
                                    Hibernate
                                </button>
                                <button
                                    onClick={openUnhiberateModalPopup}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex h-28"
                                >
                                    <UnhibernateIcon className="icon-dim-12 mr-4" />
                                    Unhibernate
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="app-deployments-info-wrapper dc__overflow-scroll w-100 dc__position-rel min-w-500">
                        <div
                            className={`app-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7 ${lastDeployedClassName}`}
                        >
                            <div className="pl-16 pr-16 app-deployment-info-row-leftsection dc__border-right-n1 display-grid dc__position-sticky sticky-column bcn-0 h-100 dc__align-items-center">
                                <label className="dc__position-rel pointer m-0-imp">
                                    <input
                                        type="checkbox"
                                        className="form__checkbox"
                                        value="ALL"
                                        onChange={handleSelect}
                                        checked={selectedAppIds.length === appListData.appInfoList.length}
                                    />
                                    <span
                                        className={`form__checkbox-container ${
                                            selectedAppIds.length === appListData.appInfoList.length
                                                ? 'tick-icon'
                                                : selectedAppIds.length > 0
                                                  ? 'any-selected'
                                                  : ''
                                        }`}
                                    />
                                </label>
                                {!isVirtualEnv && <ActivityIcon className="icon-dim-16" />}
                                <span>{OVERVIEW_HEADER.APPLICATION}</span>
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
                            <span>{OVERVIEW_HEADER.DEPLOYED_BY}</span>
                        </div>
                        <div>{appListData.appInfoList.map((item, index) => renderAppInfoRow(item, index))}</div>
                    </div>
                </div>
            </div>
            {openHiberateModal && (
                <HibernateModal
                    selectedAppIds={selectedAppIds}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenHiberateModal={setOpenHiberateModal}
                    setAppStatusResponseList={setAppStatusResponseList}
                    setShowHibernateStatusDrawer={setShowHibernateStatusDrawer}
                />
            )}
            {openUnhiberateModal && (
                <UnhibernateModal
                    selectedAppIds={selectedAppIds}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenUnhiberateModal={setOpenUnhiberateModal}
                    setAppStatusResponseList={setAppStatusResponseList}
                    setShowHibernateStatusDrawer={setShowHibernateStatusDrawer}
                />
            )}
            {showHibernateStatusDrawer.showStatus && (
                <HibernateStatusListDrawer
                    closePopup={closePopup}
                    isLoading={false}
                    responseList={appStatusResponseList}
                    getAppListData={getAppListData}
                    isHibernateOperation={showHibernateStatusDrawer.hibernationOperation}
                />
            )}
        </div>
    ) : null
}

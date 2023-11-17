import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Checkbox, Progressing, getRandomColor, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as GridIcon } from '../../../../assets/icons/ic-grid-view.svg'
import AppStatus from '../../../app/AppStatus'
import { StatusConstants } from '../../../app/list-new/Constants'
import { EditableTextArea, processDeployedTime } from '../../../common'
import { GROUP_LIST_HEADER, OVERVIEW_HEADER } from '../../Constants'
import { editDescription, getDeploymentStatus } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, AppGroupListType, AppInfoListType, AppListDataType } from '../../AppGroup.types'
import './envOverview.scss'
import moment from 'moment'
import { Moment12HourFormat } from '../../../../config'
import { EditDescRequest } from '../../../app/types'
import { toast } from 'react-toastify'
import { ReactComponent as ActivityIcon } from '../../../../assets/icons/ic-activity.svg'
import { ReactComponent as DockerIcon } from '../../../../assets/icons/git/docker.svg'
import { ReactComponent as HibernateIcon } from '../../../../assets/icons/ic-hibernate-3.svg'
import { ReactComponent as UnhibernateIcon } from '../../../../assets/icons/ic-unhibernate.svg'
import { ReactComponent as DevtronIcon } from '../../../../assets/icons/ic-devtron-app.svg'
import Tippy from '@tippyjs/react'
import { HibernateModal } from './HibernateModal'
import { UnhibernateModal } from './UnhibernateModal'

export default function EnvironmentOverview({
    appGroupListData,
    filteredAppIds,
    isVirtualEnv,
    getAppListData,
}: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const [appListData, setAppListData] = useState<AppListDataType>()
    const [loading, setLoading] = useState<boolean>()
    const [description, setDescription] = useState<string>(appGroupListData.description)
    const timerId = useRef(null)

    const [selectedAppIds, setSelectedAppIds] = useState<number[]>([])
    const [openHiberateModal, setOpenHiberateModal] = useState<boolean>(false)
    const [openUnhiberateModal, setOpenUnhiberateModal] = useState<boolean>(false)
    const [isHovered, setIsHovered] = useState<number>(null)

    useEffect(() => {
        setDescription(appGroupListData.description)
    }, [appGroupListData.description])

    useEffect(() => {
        return () => {
            if (timerId.current) clearInterval(timerId.current)
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchDeployments()
        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) clearInterval(timerId.current)
        }
    }, [appGroupListData])

    async function fetchDeployments() {
        try {
            const response = await getDeploymentStatus(+envId, filteredAppIds)
            if (response?.result) {
                let statusRecord = {}
                response.result.forEach((item) => {
                    statusRecord = { ...statusRecord, [item.appId]: item.deployStatus }
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
                // setSelectAll(true)
                setSelectedAppIds(appListData.appInfoList.map((item) => item.appId))
            } else {
                // setSelectAll(false)
                setSelectedAppIds([])
            }
        } else {
            if (checked) {
                setSelectedAppIds([...selectedAppIds, +value])
            } else {
                setSelectedAppIds(selectedAppIds.filter((item) => item !== +value))
            }
        }
    }

    const parseAppListData = (data: AppGroupListType, statusRecord: Record<string, string>): void => {
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
                deploymentStatus: statusRecord[app.appId],
                lastDeployed: app.lastDeployedTime,
                lastDeployedBy: app.lastDeployedBy,
                lastDeployedImage: app.lastDeployedImage,
            }
            parsedData.appInfoList.push(appInfo)
        })
        parsedData.appInfoList = parsedData.appInfoList.sort((a, b) => a.application.localeCompare(b.application))
        setAppListData(parsedData)
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
                className="pl-16 app-deployments-info-row display-grid dc__align-items-center"
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
            >
                {!(isHovered === index) && !isSelected ? (
                    <DevtronIcon className="icon-dim-20" />
                ) : (
                    <label className="dc__position-rel pointer m-0-imp">
                        <input
                            type="checkbox"
                            className="form__checkbox"
                            value={item.appId}
                            onChange={handleSelect}
                            checked={isSelected}
                        />
                        <span className={`form__checkbox-container ${isSelected ? 'tick-icon' : ''}`}></span>
                    </label>
                )}
                {!isVirtualEnv && (
                    <AppStatus
                        appStatus={item.lastDeployed ? item.appStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                    />
                )}
                <span className="fs-13 fw-4 cn-7">{item.application}</span>
                <AppStatus
                    appStatus={item.lastDeployed ? item.deploymentStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                    isDeploymentStatus={true}
                    isVirtualEnv={isVirtualEnv}
                />
                <div className="cn-7 fs-13">
                    <Tippy content={item.lastDeployedImage} className="default-tt" placement="auto">
                        <div
                            className={`env-deployments-info-row__last-deployed-cell bcn-1 br-6 pl-6 pr-6 flexbox dc__align-items-center dc__gap-4 dc_width-max-content`}
                        >
                            <DockerIcon className="icon-dim-14" />
                            <>
                                <div>...</div>
                                <div className="mono dc__ellipsis-left direction-left text-overflow-clip">
                                    {item?.lastDeployedImage.split(':').at(-1)}
                                </div>
                            </>
                        </div>
                    </Tippy>
                </div>
                <span className="fs-13 fw-4 cn-9 dc__ellipsis-right dc__word-break flex left dc__gap-6">
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
                    <span style={{ color: 'var(--B500)' }}>{processDeployedTime(item?.lastDeployed, true)}</span>
                </span>
            </div>
        )
    }

    const renderSideInfoColumn = () => {
        // const { appName, description, gitMaterials = [], createdOn, createdBy, projectName, chartUsed } = appMetaInfo

        const handleSaveDescription = async (value: string) => {
            const payload: EditDescRequest = {
                id: appGroupListData.environmentId,
                environment_name: appGroupListData.environmentName,
                cluster_id: appGroupListData.clusterId,
                namespace: appGroupListData.namespace,
                active: true,
                default: appGroupListData.environmentType === 'Non-Production' ? false : true,
                description: value?.trim(),
            }
            try {
                await editDescription(payload)
                toast.success('Successfully saved')
                appGroupListData.description = value
                setDescription(value)
            } catch (err) {
                showError(err)
                throw err
            }
        }

        return (
            <aside className="flexbox-col dc__gap-16">
                <div className="flexbox-col dc__gap-12">
                    <div>
                        <div className="mxh-64 dc__mxw-120 mh-40 w-100 h-100 flexbox">
                            <img
                                // src={chartUsed.chartAvatar}
                                alt="App icon"
                                // className={`dc__chart-grid-item__icon ${chartUsed.chartAvatar ? '' : 'icon-dim-48'}`}
                            />
                        </div>
                    </div>

                    <div className="fs-16 fw-7 lh-24 cn-9 dc__word-break font-merriweather">{'hlll'}</div>
                    <EditableTextArea
                        emptyState={'you can add description here'}
                        placeholder={''}
                        rows={4}
                        initialText={description}
                        updateContent={handleSaveDescription}
                        validations={{
                            maxLength: {
                                value: 40,
                                message: 'max length is 40',
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
                <div className="dc__border-top-n1" />
            </aside>
        )
    }

    return appListData ? (
        <div className="env-overview-container flexbox bcn-0 dc__overflow-hidden">
            <div className="pt-16 pb-16 pl-20 pr-20 w-300 dc__border-right">{renderSideInfoColumn()}</div>
            <div className="dc__overflow-scroll">
                <div className="flex column left pt-16 ml-20 pr-20 list-container">
                    <div className="dc__align-self-stretch flex dc__content-space left fs-14 fw-6 lh-20 cn-9 mb-12">
                        <span className="flex">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                        </span>
                        {selectedAppIds.length > 0 && (
                            <div className="flexbox dc__gap-6">
                                <button
                                    onClick={() => setOpenHiberateModal(true)}
                                    className="bcn-0 fs-12 dc__border dc__border-radius-4-imp flex"
                                >
                                    <HibernateIcon className="icon-dim-12 mr-4" />
                                    Hibernate
                                </button>
                                <button
                                    onClick={() => setOpenUnhiberateModal(true)}
                                    className="bcn-0 fs-12 dc__border flex"
                                >
                                    <UnhibernateIcon className="icon-dim-12 mr-4" />
                                    Unhibernate
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="app-deployments-info-wrapper w-100">
                        <div className="pl-16 app-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7">
                            <label className="dc__position-rel pointer m-0-imp">
                                <input
                                    type="checkbox"
                                    className="form__checkbox"
                                    value={'ALL'}
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
                                ></span>
                            </label>
                            {!isVirtualEnv && <ActivityIcon className="icon-dim-16" />}
                            <span>{OVERVIEW_HEADER.APPLICATION}</span>
                            <span>{OVERVIEW_HEADER.DEPLOYMENT_STATUS}</span>
                            <span>{OVERVIEW_HEADER.LAST_DEPLOYED}</span>
                            <span>Deployed By</span>
                        </div>
                        {appListData.appInfoList.map((item, index) => renderAppInfoRow(item, index))}
                    </div>
                </div>
            </div>
            {openHiberateModal && (
                <HibernateModal
                    selectedAppIds={selectedAppIds}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenHiberateModal={setOpenHiberateModal}
                    getAppListData={getAppListData}
                />
            )}
            {openUnhiberateModal && (
                <UnhibernateModal
                    selectedAppIds={selectedAppIds}
                    envId={envId}
                    envName={appListData.environment}
                    setOpenUnhiberateModal={setOpenUnhiberateModal}
                    getAppListData={getAppListData}
                />
            )}
        </div>
    ) : null
}

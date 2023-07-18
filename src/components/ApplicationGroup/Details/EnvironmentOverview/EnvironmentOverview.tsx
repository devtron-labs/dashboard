import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as GridIcon } from '../../../../assets/icons/ic-grid-view.svg'
import AppStatus from '../../../app/AppStatus'
import { StatusConstants } from '../../../app/list-new/Constants'
import { processDeployedTime } from '../../../common'
import { GROUP_LIST_HEADER, OVERVIEW_HEADER } from '../../Constants'
import { getDeploymentStatus } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, AppGroupListType, AppInfoListType, AppListDataType } from '../../AppGroup.types'
import './envOverview.scss'

export default function EnvironmentOverview({
    appGroupListData,
    filteredAppIds,
    isVirtualEnv,
}: AppGroupDetailDefaultType) {
    const { envId } = useParams<{ envId: string }>()
    const [appListData, setAppListData] = useState<AppListDataType>()
    const [loading, setLoading] = useState<boolean>()
    const timerId = useRef(null)

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
        return (
            <div
                key={`${item.application}-${index}`}
                className="app-deployments-info-row display-grid dc__align-items-center"
            >
                <span className="fs-13 fw-4 cn-7">{item.application}</span>
                {!isVirtualEnv && (
                    <AppStatus
                        appStatus={item.lastDeployed ? item.appStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                    />
                )}
                <AppStatus
                    appStatus={item.lastDeployed ? item.deploymentStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                    isDeploymentStatus={true}
                    isVirtualEnv={isVirtualEnv}
                />
                <span className="fs-13 fw-4 cn-7">{processDeployedTime(item.lastDeployed, true)}</span>
            </div>
        )
    }

    return appListData ? (
        <div className="env-overview-container display-grid bcn-0 dc__overflow-hidden">
            <div className="pt-16 pb-16 pl-20 pr-20 dc__border-right">
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">{GROUP_LIST_HEADER.ENVIRONMENT}</div>
                    <div className="fs-13 fw-4 lh-20 cn-9">{appListData.environment}</div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">{GROUP_LIST_HEADER.NAMESPACE}</div>
                    <div className="fs-13 fw-4 lh-20 cn-9 dc__break-word">{appListData.namespace} </div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">{GROUP_LIST_HEADER.CLUSTER}</div>
                    <div className="fs-13 fw-4 lh-20 cn-9 dc__break-word">{appListData.cluster}</div>
                </div>
            </div>
            <div className="dc__overflow-scroll">
                <div className="flex column left pt-16 pb-16 pl-20 pr-20">
                    <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12">
                        <GridIcon className="icon-dim-20 mr-8 scn-9" /> {GROUP_LIST_HEADER.APPLICATIONS}
                    </div>
                    <div className="app-deployments-info-wrapper w-100">
                        <div className="app-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7">
                            <span>{OVERVIEW_HEADER.APPLICATION}</span>
                            {!isVirtualEnv && <span>{OVERVIEW_HEADER.APP_STATUS}</span>}
                            <span>{OVERVIEW_HEADER.DEPLOYMENT_STATUS}</span>
                            <span>{OVERVIEW_HEADER.LAST_DEPLOYED}</span>
                        </div>
                        <div className="app-deployments-info-body">
                            {appListData.appInfoList.map((item, index) => renderAppInfoRow(item, index))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null
}

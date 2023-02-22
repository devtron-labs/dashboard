import React, { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReactComponent as GridIcon } from '../../../assets/icons/ic-grid-view.svg'
import { URLS } from '../../../config'
import AppStatus from '../../app/AppStatus'
import { StatusConstants } from '../../app/list-new/Constants'
import { getAppList } from '../../app/service'
import { Progressing, processDeployedTime, showError } from '../../common'
import { GROUP_LIST_HEADER, OVERVIEW_HEADER } from '../Constants'
import { AppInfoListType, AppListDataType } from '../EnvironmentGroup.types'
import { getDeploymentStatus } from '../EnvironmentListService'
import './envOverview.scss'

export default function EnvironmentOverview() {
    const { envId } = useParams<{ envId: string }>()
    const [appListData, setAppListData] = useState<AppListDataType>()
    const [loading, setLoading] = useState<boolean>()
    const timerId = useRef(null)

    async function fetchDeployments() {
        try {
            const response = await Promise.all([getAppList({ environments: [+envId] }), getDeploymentStatus(+envId)])
            if (response?.[0]?.result && response[1]?.result) {
                let statusRecord = {}
                response[1].result.forEach((item) => {
                    statusRecord = { ...statusRecord, [item.appId]: item.deployStatus }
                })
                setLoading(false)
                parseAppListData(response[0]?.result, statusRecord)
            }
        } catch (err) {
            showError(err)
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchDeployments()
        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) clearInterval(timerId.current)
        }
    }, [envId])

    const parseAppListData = (data: any, statusRecord: Record<string, string>): void => {
        const parsedData = {
            environment: '',
            namespace: '',
            cluster: '',
            appInfoList: [],
        }

        data?.appContainers?.forEach((app) => {
            app.environments.forEach((env) => {
                if (!(parsedData.environment || parsedData.namespace || parsedData.cluster)) {
                    parsedData.environment = env.environmentName
                    parsedData.namespace = env.namespace
                    parsedData.cluster = env.clusterName
                }
                const appInfo = {
                    appId: env.appId,
                    envId: env.envId,
                    application: env.appName,
                    appStatus: env.appStatus,
                    deploymentStatus: statusRecord[env.appId],
                    lastDeployed: env.lastDeployedTime,
                }
                parsedData.appInfoList.push(appInfo)
            })
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
                <AppStatus appStatus={item.lastDeployed ? item.appStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower} />
                <AppStatus appStatus={item.lastDeployed ? item.deploymentStatus : '-'} isDeploymentStatus={true} />
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
                    <div className="fs-13 fw-4 lh-20 cn-9">{appListData.namespace} </div>
                </div>
                <div className="mb-16">
                    <div className="fs-12 fw-4 lh-20 cn-7">{GROUP_LIST_HEADER.CLUSTER}</div>
                    <div className="fs-13 fw-4 lh-20 cn-9">{appListData.cluster}</div>
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
                            <span>{OVERVIEW_HEADER.APP_STATUS}</span>
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

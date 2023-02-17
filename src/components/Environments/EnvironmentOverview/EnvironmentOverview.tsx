import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReactComponent as GridIcon } from '../../../assets/icons/ic-grid-view.svg'
import { URLS } from '../../../config'
import AppStatus from '../../app/AppStatus'
import { renderDeployedTime } from '../../app/details/appOverview/AppOverview'
import { StatusConstants } from '../../app/list-new/Constants'
import { getAppList } from '../../app/service'
import { Progressing, useAsync } from '../../common'
import './envOverview.scss'

interface AppInfoListType {
    application: string
    appStatus: string
    deploymentStatus: string
    lastDeployed: string
    appId: number,
    envId: number,
}

interface AppListDataType {
    environment: string
    namespace: string
    cluster: string
    appInfoList: AppInfoListType[]
}

export default function EnvironmentOverview() {
    const { envId } = useParams<{ envId }>()
    const [appListData, SetAppListData] = useState<AppListDataType>()
    const [loading, appList] = useAsync(() => getAppList({ environments: [+envId], size: 20 }), [envId])

    useEffect(() => {
        if (appList?.result) {
            parseAppListData(appList?.result)
        }
    }, [appList?.result])

    const parseAppListData = (data) => {
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
                let appInfo = {
                    appId: env.appId,
                    envId: env.envId,
                    application: env.appName,
                    appStatus: env.appStatus,
                    deploymentStatus: env.cdStageStatus,
                    lastDeployed: env.lastDeployedTime,
                }
                parsedData.appInfoList.push(appInfo)
            })
        })

        SetAppListData(parsedData)
    }

    if (loading) {
        return <div className='loading-state'>
            <Progressing pageLoader />
        </div>
    }
    
    const renderAppInfoRow = (item,index) => {
        return (
            <div
                key={`${item.application}-${index}`}
                className="app-deployments-info-row display-grid dc__align-items-center"
            >
                <Link to={`${URLS.APP}/${item.appId}/details/${envId}/`} className="fs-13">
                    {item.application}
                </Link>
                <AppStatus appStatus={item.lastDeployed ? item.appStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower} />
                <AppStatus
                    appStatus={item.lastDeployed ? item.deploymentStatus : '-'}
                />
                <span className="fs-13 fw-4 cn-7">{renderDeployedTime(item, true)}</span>
            </div>
        )
    }

    return (
        appListData ? (
            <div className="env-overview-container display-grid bcn-0 dc__overflow-hidden">
                <div className="pt-16 pb-16 pl-20 pr-20 dc__border-right">
                    <div className="mb-16">
                        <div className="fs-12 fw-4 lh-20 cn-7">Environment</div>
                        <div className="fs-13 fw-4 lh-20 cn-9">{appListData.environment}</div>
                    </div>
                    <div className="mb-16">
                        <div className="fs-12 fw-4 lh-20 cn-7">Namespace</div>
                        <div className="fs-13 fw-4 lh-20 cn-9">{appListData.namespace} </div>
                    </div>
                    <div className="mb-16">
                        <div className="fs-12 fw-4 lh-20 cn-7">Cluster</div>
                        <div className="fs-13 fw-4 lh-20 cn-9">{appListData.cluster}</div>
                    </div>
                </div>
                <div className="dc__overflow-scroll">
                    <div className="flex column left pt-16 pb-16 pl-20 pr-20">
                        <div className="flex left fs-14 fw-6 lh-20 cn-9 mb-12">
                            <GridIcon className="icon-dim-20 mr-8 scn-9" /> Applications
                        </div>
                        <div className="app-deployments-info-wrapper w-100">
                            <div className="app-deployments-info-header display-grid dc__align-items-center dc__border-bottom-n1 dc__uppercase fs-12 fw-6 cn-7">
                                <span>Application</span>
                                <span>APP STATUS</span>
                                <span>Deployment STATUS</span>
                                <span>Last deployed</span>
                            </div>
                            <div className="app-deployments-info-body">
                                {appListData.appInfoList.map((item, index) => renderAppInfoRow(item,index)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ): null
    )
}


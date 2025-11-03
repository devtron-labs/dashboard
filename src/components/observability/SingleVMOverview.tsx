import { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    GenericSectionErrorState,
    handleUTCTime,
    PageHeader,
    useBreadcrumb
} from '@devtron-labs/devtron-fe-common-lib/dist'

import ObservabilityIconComponent from './ObservabilityIcon'

import { MetricsInfoCard } from './MetricsInfoCard'
import './styles.scss'
import { GlanceMetricsKeys } from './types'
import { MetricsInfoLoadingCard, useGetGlanceConfig } from './utils'

let interval
const SingleVMOverview = () => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()
    console.log(data)
    const match = useRouteMatch()

    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [fetchingExternalApps, setFetchingExternalApps] = useState<boolean>(false)
    const renderDataSyncingText = () => <span className="dc__loading-dots">Syncing</span>
    useEffect(() => {
        if (isDataSyncing) {
            setLastDataSyncTimeString(renderDataSyncingText)
        } else {
            const _lastDataSyncTime = Date()
            setLastDataSyncTimeString(`Last synced ${handleUTCTime(_lastDataSyncTime, true)}`)
            interval = setInterval(() => {
                setLastDataSyncTimeString(`Last synced ${handleUTCTime(_lastDataSyncTime, true)}`)
            }, 1000)
        }
        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isDataSyncing])

    const { breadcrumbs } = useBreadcrumb({
        alias: {
            observability: {
                component: <ObservabilityIconComponent />,
                linked: true,
            },
            customer: {
                component: <BreadcrumbText heading="VMs" isActive />,
                linked: false,
            },
        },
    })

    const renderBody = () => {
        if (isFetching) {
            return (
                <div className="dc__grid glance-cards-wrapper">
                    {Object.keys(GlanceMetricsKeys).map((key) => (
                        <MetricsInfoLoadingCard key={key} />
                    ))}
                </div>
            )
        }

        if (isError) {
            return (
                <GenericSectionErrorState
                    subTitle=""
                    reload={refetch}
                    rootClassName="bg__primary br-8 border__secondary"
                />
            )
        }
        // alert(JSON.stringify(data))
        return (
            <div className="dc__grid workflow-overview-cards-wrapper">
                {data.map((value) => {
                    return <MetricsInfoCard key={value.metricTitle} {...value} />
                })}
            </div>
        )
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />
    const searchKey = ''
    const handleSearch = () => { }
    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto bg__secondary">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
            <div className="flexbox-col dc__gap-32 bg__secondary p-20">
                <div className="flexbox-col dc__gap-12">
                    <div className="flexbox dc__content-space dc__gap-16">
                        <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                    </div>
                    {renderBody()}
                </div>
                <div className="flexbox-col dc__gap-12">
                    <div className="flexbox dc__content-space dc__gap-16">
                        <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">Statistics</h3>
                    </div>
                    <div className="dc__grid workflow-overview-cards-wrapper">
                        <div className="flexbox-col bg__primary br-8 border__secondary">
                            <div className="flex left px-16 py-12 border__secondary--bottom">
                                <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                            </div>
                            <div className="flex h-200">
                                <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                            </div>
                        </div>
                        <div className="flexbox-col bg__primary br-8 border__secondary">
                            <div className="flex left px-16 py-12 border__secondary--bottom">
                                <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                            </div>
                            <div className="flex h-200">
                                <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                            </div>
                        </div>
                        <div className="flexbox-col bg__primary br-8 border__secondary">
                            <div className="flex left px-16 py-12 border__secondary--bottom">
                                <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                            </div>
                            <div className="flex h-200">
                                <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                            </div>
                        </div>
                        <div className="flexbox-col bg__primary br-8 border__secondary">
                            <div className="flex left px-16 py-12 border__secondary--bottom">
                                <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                            </div>
                            <div className="flex h-200">
                                <img src='https://community.grafana.com/t/drill-down-in-bar-graph/70193' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default SingleVMOverview;

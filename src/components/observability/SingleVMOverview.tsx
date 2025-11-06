import { useEffect, useState } from 'react'

import {
    BreadCrumb,
    BreadcrumbText,
    GenericSectionErrorState,
    handleUTCTime,
    PageHeader,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib/dist'

import { MetricsInfoCard } from './MetricsInfoCard'
import ObservabilityIconComponent from './ObservabilityIcon'
import { GlanceMetricsKeys } from './types'
import { MetricsInfoLoadingCard, useGetGlanceConfig } from './utils'

import './styles.scss'

let interval
const SingleVMOverview = () => {
    const { isFetching, data, isError, refetch } = useGetGlanceConfig()
    console.log(data)

    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

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
                {data.glanceConfig.map((value) => (
                    <MetricsInfoCard key={value.metricTitle} {...value} />
                ))}
            </div>
        )
    }

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const renderLastSyncComponent = () => (
        <div className="flex fs-13">
            {lastDataSyncTimeString && (
                <>
                    <span data-testid="sync-now-text">{lastDataSyncTimeString}</span>
                    {!isDataSyncing && (
                        <>
                            &nbsp;
                            <button
                                className="btn btn-link p-0 fw-6 cb-5 mb-2"
                                type="button"
                                onClick={syncNow}
                                data-testid="sync-now-button"
                            >
                                Sync now
                            </button>
                        </>
                    )}
                </>
            )}
            {fetchingExternalApps && renderDataSyncingText()}
        </div>
    )
    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
            <div className="flexbox-col dc__gap-32 dc__overflow-auto p-20 flex-grow-1 bg__secondary">
                {renderLastSyncComponent()}

                <div className="flexbox-col dc__gap-16">
                    <div className="flexbox dc__content-space dc__gap-16">
                        <h3 className="m-0 cn-9 fs-20 fw-4 lh-1-5">At a Glance</h3>
                    </div>
                </div>
                <div className="flexbox-col dc__gap-12">{renderBody()}</div>
                <div className="dc__grid workflow-overview-cards-wrapper">
                    <div className="flexbox-col bg__primary br-8 border__secondary">
                        <div className="flex left px-16 py-12 border__secondary--bottom">
                            <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                        </div>
                        <div className="flex h-200">
                            <img src="https://community.grafana.com/t/drill-down-in-bar-graph/70193" alt="" />
                        </div>
                    </div>
                    <div className="flexbox-col bg__primary br-8 border__secondary">
                        <div className="flex left px-16 py-12 border__secondary--bottom">
                            <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                        </div>
                        <div className="flex h-200">
                            <img src="https://community.grafana.com/t/drill-down-in-bar-graph/70193" alt="" />
                        </div>
                    </div>
                    <div className="flexbox-col bg__primary br-8 border__secondary">
                        <div className="flex left px-16 py-12 border__secondary--bottom">
                            <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                        </div>
                        <div className="flex h-200">
                            <img src="https://community.grafana.com/t/drill-down-in-bar-graph/70193" alt="" />
                        </div>
                    </div>
                    <div className="flexbox-col bg__primary br-8 border__secondary">
                        <div className="flex left px-16 py-12 border__secondary--bottom">
                            <span className="fs-14 fw-6 lh-1-5 cn-9">CPU</span>
                        </div>
                        <div className="flex h-200">
                            <img src="https://community.grafana.com/t/drill-down-in-bar-graph/70193" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SingleVMOverview

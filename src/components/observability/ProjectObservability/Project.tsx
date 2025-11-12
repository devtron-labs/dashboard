import { useEffect, useState } from 'react'
import { Route, useRouteMatch } from 'react-router-dom'

import { BreadCrumb, handleUTCTime, TabGroup, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'

import { Overview } from '../Overview'
import { getBreadCrumbObj, getTabsObj } from '../utils'
import ProjectList from './ProjectList'

let interval
const Project = () => {
    const { url } = useRouteMatch()

    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()

    // TODO: Remove later
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

    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const rightComponent = (
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

    const renderProjectTabs = () => (
        <TabGroup tabs={getTabsObj('project', url)} rightComponent={rightComponent} hideTopPadding />
    )

    const { breadcrumbs } = useBreadcrumb(getBreadCrumbObj('project', url))

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto">
            <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                <Route path={`${url}/overview`}>
                    <Overview view="project" url={url} />
                </Route>
                <Route path={`${url}/projects`}>
                    <ProjectList renderTabs={renderProjectTabs} renderBreadcrumbs={renderBreadcrumbs} />
                </Route>
            </div>
        </div>
    )
}

export default Project

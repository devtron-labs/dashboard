import { useEffect, useState } from 'react'
import { Route, useRouteMatch } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    ComponentSizeType,
    handleUTCTime,
    PageHeader,
    SearchBar,
    TabGroup,
    TabProps,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import ObservabilityIconComponent from '../ObservabilityIcon'
import ProjectList from './ProjectList'
import { ProjectOverview } from './ProjectOverview'

let interval
const Project = () => {
    const match = useRouteMatch()

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
    const tabs: TabProps[] = [
        {
            id: 'project_overview',
            label: 'Overview',
            tabType: 'navLink',
            props: {
                to: `${match.url}/overview`,
            },
        },
        {
            id: 'project_list',
            label: 'Projects',
            tabType: 'navLink',
            props: {
                to: `${match.url}/projects`,
            },
        },
    ]

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
        <div>
            <div className="dc__border-bottom dc__position-sticky dc__top-0 dc__zi-1 bg__primary">
                <div className="en-2 bw-1 dc__top-radius-4 bg__primary dc__no-bottom-border px-20">
                    <TabGroup tabs={tabs} rightComponent={rightComponent} />
                </div>
            </div>
            <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                <div className=" pr-20 pl-20 pt-12 pb-12">
                    <Route path={`${match.url}/overview`}>
                        <ProjectOverview />
                    </Route>
                    <Route path={`${match.url}/projects`}>
                        <ProjectList />
                    </Route>
                </div>
            </div>
        </div>
    )

    const { breadcrumbs } = useBreadcrumb({
        alias: {
            observability: {
                component: <ObservabilityIconComponent />,
                linked: true,
            },
            customer: {
                component: <BreadcrumbText heading="Projects" isActive />,
                linked: false,
            },
        },
    })
    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />
    const searchKey = ''
    const handleSearch = () => { }
    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
            <div className="search-filter-section">
                <SearchBar
                    containerClassName="w-250"
                    dataTestId="search-project-env"
                    initialSearchText={searchKey}
                    inputProps={{
                        placeholder: 'Search project',
                    }}
                    handleEnter={handleSearch}
                    size={ComponentSizeType.medium}
                    keyboardShortcut="/"
                />
            </div>
            {renderProjectTabs()}
        </div>
    )
}

export default Project

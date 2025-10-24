import { useState,useEffect } from "react"
import ProjectList from "./ProjectList"
import { BreadCrumb, BreadcrumbText, ComponentSizeType, handleUTCTime, PageHeader, SearchBar, SegmentedControl, SegmentedControlProps, TabGroup, TabProps, useBreadcrumb, useUrlFilters } from ".yalc/@devtron-labs/devtron-fe-common-lib/dist"
import { URLS } from "@Config/routes"
import ObservabilityIconComponent from "./ObservabilityIcon"
import ProjectOverview from "./ProjectOverview"
import './styles.scss'
import { TabDetailsSearchParams, TabDetailsSegment } from "./types"
let interval
const Project = () => {
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    const [fetchingExternalApps, setFetchingExternalApps] = useState<boolean>(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
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
            
    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }
    const tabs: TabProps = [
        {
            id: 'project_overview',
            label: 'Overview',
            tabType: 'button',
            active: selectedTabIndex == 0,
            props: {
                onClick: () => {
                    setSelectedTabIndex(0)
                },
            },
        },
        {
            id: 'project_list',
            label: 'Projects',
            tabType: 'button',
            active: selectedTabIndex == 1,
            props: {
                onClick: () => {
                    setSelectedTabIndex(1)
                },
            },
        }
    ]
            
    const syncNow = (): void => {
        setSyncListData(!syncListData)
    }

    const renderProjectOverview = () => {
        return <ProjectOverview />
    }

    const renderProjectList = () => {
        return <ProjectList />
    }

    const TAB_DETAILS_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'Overview',
        value: TabDetailsSegment.OVERVIEW,
    },
    {
        label: 'Projects',
        value: TabDetailsSegment.PROJECTS,
    }
]

const parseChartDetailsSearchParams = (searchParams: URLSearchParams): TabDetailsSearchParams => ({
    tab: (searchParams.get('tab') as TabDetailsSegment) || TabDetailsSegment.OVERVIEW,
})

const { tab, updateSearchParams } = useUrlFilters<void, TabDetailsSearchParams>({
        parseSearchParams: parseChartDetailsSearchParams,
    })

    const handleSegmentChange: SegmentedControlProps['onChange'] = (selectedSegment) => {
        const updatedTab = selectedSegment.value as TabDetailsSegment

        if (updatedTab === TabDetailsSegment.PROJECTS) {
            renderProjectList()
        }

        updateSearchParams({ tab: updatedTab })
    }

    const renderProjectTabs = () => {
        const rightComponent = (
            <div className="flex fs-13">
                {lastDataSyncTimeString &&
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
                }
                {fetchingExternalApps && renderDataSyncingText()}
            </div>
        )

        const renderSegments = () => {
        switch (tab) {
            case TabDetailsSegment.OVERVIEW:
                return (
                    renderProjectOverview()
                )
            case TabDetailsSegment.PROJECTS:
                return renderProjectList()
            default:
                return null
        }
    }
        
        return (
            <div>
                <div className="dc__border-bottom dc__position-sticky dc__top-0 dc__zi-1 bg__primary">
                    <div className="en-2 bw-1 dc__top-radius-4 bg__primary dc__no-bottom-border px-20">
                        {/* <TabGroup tabs={tabs} rightComponent={rightComponent}/> */}
                        <SegmentedControl
                                        name="chart-details-segmented-control"
                                        segments={TAB_DETAILS_SEGMENTS}
                                        value={tab}
                                        onChange={handleSegmentChange}
                                    />
                    </div>
                </div>
                <div className="en-2 bw-1 br-4 dc__no-top-radius dc__no-top-border bg__primary mb-20">
                    <div className=" pr-20 pl-20 pt-12 pb-12">
                        {/* {selectedTabIndex == 0 && renderProjectOverview()}
                        {selectedTabIndex == 1 && renderProjectList()} */}
                        {renderSegments()}
                    </div>
                </div>
            </div>
        )
    }

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
    const searchKey = ""
    const handleSearch = () => {}
    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto bg__secondary">
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

export default Project;
import { useEffect, useState } from 'react'

import {
    BreadCrumb,
    BreadcrumbText,
    ComponentSizeType,
    handleUTCTime,
    PageHeader,
    SearchBar,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import ObservabilityIconComponent from '../ObservabilityIcon'
import { CustomerList } from './CustomerList'

let interval
const Customers = () => {
    const [lastDataSyncTimeString, setLastDataSyncTimeString] = useState<React.ReactNode>('')
    const [isDataSyncing, setDataSyncing] = useState(false)
    const [syncListData, setSyncListData] = useState<boolean>()
    // TODO: Remove later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fetchingExternalApps, setFetchingExternalApps] = useState<boolean>(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateDataSyncing = (loading: boolean): void => {
        setDataSyncing(loading)
    }

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

    const { breadcrumbs } = useBreadcrumb({
        alias: {
            observability: {
                component: <ObservabilityIconComponent />,
                linked: true,
            },
            customers: {
                component: <BreadcrumbText heading="Customers" isActive />,
                linked: false,
            },
            ':customerId': {
                component: <BreadcrumbText heading="test" isActive />,
                linked: false,
            },
        },
    })
    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />
    const searchKey = ''
    const handleSearch = () => {}
    return (
        <div className="observability-overview flex-grow-1 dc__overflow-auto bg__secondary">
            <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
            <div className="flex dc__content-space  p-16 w-100 dc__gap-8 ">
                <div className="flexbox dc__align-items-center dc__mxw-fit-content">
                    <SearchBar
                        containerClassName="w-250"
                        dataTestId="search-customer-env"
                        initialSearchText={searchKey}
                        inputProps={{
                            placeholder: 'Search customer',
                        }}
                        handleEnter={handleSearch}
                        size={ComponentSizeType.medium}
                        keyboardShortcut="/"
                    />
                </div>
                {renderLastSyncComponent()}
            </div>

            <CustomerList />
        </div>
    )
}

export default Customers

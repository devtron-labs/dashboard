import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    BreadCrumb,
    FiltersTypeEnum,
    PageHeader,
    PaginationEnum,
    ROUTER_URLS,
    Table,
    TableProps,
    useBreadcrumb,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import AuditLogDetail from './AuditLogDetail'
import AuditLogsTableWrapper from './AuditLogsTableWrapper'
import { getAuditLogFilterOptions, getAuditLogList, getAuditLogs } from './service'
import {
    AuditLogDetailType,
    AuditLogRowType,
    AuditLogTableAdditionalProps,
    NormalizedAuditLogApiResponse,
} from './types'
import { getAuditLogColumns, parseAuditLogURLParams } from './utils'

const EMPTY_AUDIT_LOGS: AuditLogDetailType[] = []
const EMPTY_FILTER_OPTIONS: AuditLogTableAdditionalProps['filterOptions'] = {
    typeOptions: [],
    moduleOptions: [],
}

const AuditLogsList = () => {
    const columns = useMemo(() => getAuditLogColumns(), [])
    const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogDetailType | null>(null)
    const navigate = useNavigate()

    const { breadcrumbs } = useBreadcrumb(ROUTER_URLS.AUDIT_LOGS, {
        alias: {
            'audit-logs': {
                component: <span className="fs-16 fw-6 cn-9 lh-1-5">Audit Logs</span>,
                linked: false,
            },
        },
    })

    const { data: auditLogs = EMPTY_AUDIT_LOGS, isLoading: areAuditLogsLoading } = useQuery<
        NormalizedAuditLogApiResponse,
        AuditLogDetailType[],
        ['audit-logs'],
        false
    >({
        queryFn: ({ signal }) => getAuditLogs({}, signal),
        queryKey: ['audit-logs'],
        select: (response) => response.data,
    })

    const filterOptions = useMemo(
        () => (auditLogs.length ? getAuditLogFilterOptions(auditLogs) : EMPTY_FILTER_OPTIONS),
        [auditLogs],
    )

    const handleSelectAuditLog = useCallback((auditLog: AuditLogDetailType) => {
        setSelectedAuditLog(auditLog)
    }, [])

    const handleCloseDetail = useCallback(() => {
        setSelectedAuditLog(null)
    }, [])

    const handleRowClick = useCallback<
        NonNullable<TableProps<AuditLogRowType, FiltersTypeEnum.URL, AuditLogTableAdditionalProps>['onRowClick']>
    >((row) => handleSelectAuditLog(row.data as AuditLogDetailType), [handleSelectAuditLog])

    const clearFilters = useCallback(() => {
        navigate(ROUTER_URLS.AUDIT_LOGS)
    }, [navigate])

    const auditLogBreadcrumb = () => <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.AUDIT_LOGS} />

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden bg__primary">
            <PageHeader breadCrumbs={auditLogBreadcrumb} isBreadcrumbs />

            <Table<AuditLogRowType, FiltersTypeEnum.URL, AuditLogTableAdditionalProps>
                id="table__audit-logs"
                columns={columns}
                ViewWrapper={AuditLogsTableWrapper}
                filtersVariant={FiltersTypeEnum.URL}
                additionalFilterProps={{
                    initialSortKey: 'timeStamp',
                    parseSearchParams: parseAuditLogURLParams,
                }}
                paginationVariant={PaginationEnum.PAGINATED}
                getRows={getAuditLogList}
                filter={null}
                loading={areAuditLogsLoading}
                onRowClick={handleRowClick}
                clearFilters={clearFilters}
                emptyStateConfig={{
                    noRowsConfig: {
                        title: 'No audit logs found',
                        subTitle: 'Audit trail entries will show up here once actions are performed.',
                    },
                    noRowsForFilterConfig: {
                        title: 'No audit logs found',
                        subTitle: 'Try adjusting your search or filters',
                        clearFilters,
                    },
                }}
                additionalProps={{ filterOptions, onSelectAuditLog: handleSelectAuditLog }}
            />

            {selectedAuditLog && <AuditLogDetail auditLog={selectedAuditLog} onClose={handleCloseDetail} />}
        </div>
    )
}

export default AuditLogsList

import { useCallback, useMemo, useState } from 'react'

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
import { getAuditLogFilterOptions, getAuditLogList } from './service'
import { AuditLogDetailType, AuditLogRowType, AuditLogTableAdditionalProps } from './types'
import { getAuditLogColumns, parseAuditLogURLParams } from './utils'

const EMPTY_FILTER_OPTIONS: AuditLogTableAdditionalProps['filterOptions'] = {
    typeOptions: [],
    moduleOptions: [],
}

const AuditLogsList = () => {
    const columns = useMemo(() => getAuditLogColumns(), [])
    const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogDetailType | null>(null)

    const { breadcrumbs } = useBreadcrumb(ROUTER_URLS.AUDIT_LOGS, {
        alias: {
            'audit-logs': {
                component: <span className="fs-16 fw-6 cn-9 lh-1-5">Audit Logs</span>,
                linked: false,
            },
        },
    })

    const { data: filterOptions = EMPTY_FILTER_OPTIONS } = useQuery<
        Awaited<ReturnType<typeof getAuditLogFilterOptions>>,
        AuditLogTableAdditionalProps['filterOptions'],
        ['audit-log-filter-options'],
        false
    >({
        queryFn: getAuditLogFilterOptions,
        queryKey: ['audit-log-filter-options'],
        select: (data) => data,
    })

    const handleSelectAuditLog = useCallback((auditLog: AuditLogDetailType) => {
        setSelectedAuditLog(auditLog)
    }, [])

    const handleCloseDetail = useCallback(() => {
        setSelectedAuditLog(null)
    }, [])

    const handleRowClick = useCallback<
        NonNullable<TableProps<AuditLogRowType, FiltersTypeEnum.URL, AuditLogTableAdditionalProps>['onRowClick']>
    >((row) => handleSelectAuditLog(row.data as AuditLogDetailType), [handleSelectAuditLog])

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
                    initialSortKey: 'timestamp',
                    parseSearchParams: parseAuditLogURLParams,
                    defaultPageSize: 5,
                }}
                paginationVariant={PaginationEnum.PAGINATED}
                getRows={getAuditLogList}
                onRowClick={handleRowClick}
                emptyStateConfig={{
                    noRowsConfig: {
                        title: 'No audit logs found',
                        subTitle: 'Audit trail entries will show up here once actions are performed.',
                        noImage: true,
                    },
                }}
                filter={null}
                additionalProps={{ filterOptions, onSelectAuditLog: handleSelectAuditLog }}
            />

            {selectedAuditLog && <AuditLogDetail auditLog={selectedAuditLog} onClose={handleCloseDetail} />}
        </div>
    )
}

export default AuditLogsList

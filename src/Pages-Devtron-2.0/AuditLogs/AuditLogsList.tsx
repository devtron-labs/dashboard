import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import {
    BreadCrumb,
    ErrorScreenManager,
    FiltersTypeEnum,
    PageHeader,
    PaginationEnum,
    Progressing,
    ROUTER_URLS,
    Table,
    useBreadcrumb,
    useQuery,
} from '@devtron-labs/devtron-fe-common-lib'

import AuditLogsTableWrapper from './AuditLogsTableWrapper'
import { getAuditLogFilterOptions, getAuditLogList } from './service'
import { AuditLogRowType, AuditLogTableAdditionalProps } from './types'
import { getAuditLogColumns, parseAuditLogURLParams, useGetAuditLogDetailsResponse } from './utils'

const EMPTY_FILTER_OPTIONS: AuditLogTableAdditionalProps['filterOptions'] = {
    typeOptions: [],
    moduleOptions: [],
}

const AuditLogsList = () => {
    const columns = useMemo(() => getAuditLogColumns(), [])
    const { auditLogId } = useParams()

    const { auditLogLoading, auditLogError, reloadAuditLog } = useGetAuditLogDetailsResponse(auditLogId)

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

    if (auditLogLoading) {
        return (
            <div className="flex-grow-1 bg__primary">
                <Progressing pageLoader />
            </div>
        )
    }

    if (auditLogError) {
        return <ErrorScreenManager code={auditLogError.code} reload={reloadAuditLog} />
    }

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
                emptyStateConfig={{
                    noRowsConfig: {
                        title: 'No audit logs found',
                        subTitle: 'Audit trail entries will show up here once actions are performed.',
                        noImage: true,
                    },
                }}
                filter={null}
                additionalProps={{ filterOptions }}
            />
        </div>
    )
}

export default AuditLogsList

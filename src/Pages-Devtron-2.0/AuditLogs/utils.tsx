import { generatePath, NavLink } from 'react-router-dom'
import dayjs from 'dayjs'

import {
    DATE_TIME_FORMATS,
    FiltersTypeEnum,
    getAlphabetIcon,
    ROUTER_URLS,
    TableCellComponentProps,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { getAuditLogDetail } from './service'
import { AuditLogFilterKeys, AuditLogFiltersType, AuditLogRowType, AuditLogsTableProps } from './types'

const TimestampCellComponent = ({ value }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="fs-13 fw-4 cn-9 lh-20">
            {value ? dayjs(String(value)).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT) : '-'}
        </span>
    </div>
)

const ActionCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <NavLink
        type="button"
        className="dc__unset-button-styles flex left"
        to={generatePath(ROUTER_URLS.AUDIT_LOGS_DETAIL, {
            auditLogId: String(row.data.auditLogId),
        })}
    >
        <span className="dc__link fs-13 lh-20 dc__truncate">{row.data.action}</span>
    </NavLink>
)

const UserCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="flex dc__gap-6 fs-13 fw-4 cn-9 lh-20">
            {getAlphabetIcon(row.data.user, 'dc__no-shrink m-0-imp icon-dim-20')}
            {row.data.user}
        </span>
    </div>
)

export const getAuditLogColumns = (): AuditLogsTableProps['columns'] => [
    {
        field: 'timestamp',
        label: 'Timestamp',
        size: { fixed: 220 },
        isSortable: true,
        CellComponent: TimestampCellComponent,
    },
    {
        field: 'action',
        label: 'Action',
        size: null,
        isSortable: true,
        CellComponent: ActionCellComponent,
    },
    {
        field: 'type',
        label: 'Type',
        size: { fixed: 130 },
        isSortable: true,
    },
    {
        field: 'user',
        label: 'User',
        size: { fixed: 180 },
        isSortable: true,
        CellComponent: UserCellComponent,
    },
    {
        field: 'resource',
        label: 'Resource',
        size: { fixed: 180 },
        isSortable: true,
    },
    {
        field: 'module',
        label: 'Module',
        size: { fixed: 190 },
        isSortable: true,
    },
]

export const parseAuditLogURLParams = (searchParams: URLSearchParams): AuditLogFiltersType => ({
    [AuditLogFilterKeys.TYPE]: searchParams.getAll(AuditLogFilterKeys.TYPE),
    [AuditLogFilterKeys.MODULE]: searchParams.getAll(AuditLogFilterKeys.MODULE),
})

export const getAuditLogFilterLabel = (filterKey: string) => {
    switch (filterKey) {
        case AuditLogFilterKeys.TYPE:
            return 'Type'
        case AuditLogFilterKeys.MODULE:
            return 'Module'
        default:
            return filterKey
    }
}

export const useGetAuditLogDetailsResponse = (auditLogId) => {
    const [auditLogLoading, auditLog, auditLogError, reloadAuditLog] = useAsync(() => getAuditLogDetail(auditLogId), [])
    return { auditLogLoading, auditLog, auditLogError, reloadAuditLog }
}

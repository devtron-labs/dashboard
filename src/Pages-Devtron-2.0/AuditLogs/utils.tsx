import dayjs from 'dayjs'

import {
    capitalizeFirstLetter,
    DATE_TIME_FORMATS,
    FiltersTypeEnum,
    getAlphabetIcon,
    TableCellComponentProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { AuditLogFilterKeys, AuditLogFiltersType, AuditLogRowType, AuditLogsTableProps } from './types'

const TimestampCellComponent = ({ value }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="fs-13 fw-4 cn-9 lh-20">
            {value ? dayjs(String(value)).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT) : 'test'}
        </span>
    </div>
)

const ActionCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="dc__link fs-13 lh-20 dc__truncate">{`${capitalizeFirstLetter(row.data.action)}d ${row.data.resourceName} ${row.data.resourceType} `}</span>
    </div>
)

const UserCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="flex dc__gap-6 fs-13 fw-4 cn-9 lh-20">
            {getAlphabetIcon(row.data.user, 'dc__no-shrink m-0-imp icon-dim-20')}
            {row.data.user}
        </span>
    </div>
)

const ModuleCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="flex dc__gap-6 fs-13 fw-4 cn-9 lh-20">{capitalizeFirstLetter(row.data.module)}</span>
    </div>
)

const TypeCellComponent = ({ row }: TableCellComponentProps<AuditLogRowType, FiltersTypeEnum.URL>) => (
    <div className="flex left py-12">
        <span className="flex dc__gap-6 fs-13 fw-4 cn-9 lh-20">{capitalizeFirstLetter(row.data.requestMethod)}</span>
    </div>
)

const compareDates = (first: unknown, second: unknown) =>
    new Date(String(first ?? '')).getTime() - new Date(String(second ?? '')).getTime()

const compareStrings = (first: unknown, second: unknown) => String(first ?? '').localeCompare(String(second ?? ''))

export const getAuditLogColumns = (): AuditLogsTableProps['columns'] => [
    {
        field: 'timeStamp',
        label: 'Timestamp',
        size: { fixed: 220 },
        isSortable: true,
        comparator: compareDates,
        CellComponent: TimestampCellComponent,
    },
    {
        field: 'action',
        label: 'Action',
        size: null,
        isSortable: true,
        comparator: compareStrings,
        CellComponent: ActionCellComponent,
    },
    {
        field: 'requestMethod',
        label: 'Type',
        size: { fixed: 130 },
        isSortable: true,
        comparator: compareStrings,
        CellComponent: TypeCellComponent,
    },
    {
        field: 'user',
        label: 'User',
        size: { fixed: 180 },
        isSortable: true,
        comparator: compareStrings,
        CellComponent: UserCellComponent,
    },
    {
        field: 'resourceType',
        label: 'Resource Type',
        size: { fixed: 180 },
        isSortable: true,
        comparator: compareStrings,
    },
    {
        field: 'resourceName',
        label: 'Resource Name',
        size: { fixed: 200 },
        isSortable: true,
        comparator: compareStrings,
    },
    {
        field: 'module',
        label: 'Module',
        size: { fixed: 190 },
        isSortable: true,
        comparator: compareStrings,
        CellComponent: ModuleCellComponent,
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

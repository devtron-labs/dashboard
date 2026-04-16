import {
    FiltersTypeEnum,
    SelectPickerOptionType,
    TableProps,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

export enum AuditLogFilterKeys {
    TYPE = 'type',
    MODULE = 'module',
}

export enum AuditLogSortableKeys {
    TIMESTAMP = 'timestamp',
    ACTION = 'action',
    TYPE = 'type',
    USER = 'user',
    RESOURCE = 'resource',
    MODULE = 'module',
}

export type AuditLogFiltersType = {
    [AuditLogFilterKeys.TYPE]: string[]
    [AuditLogFilterKeys.MODULE]: string[]
}

export interface AuditLogRowType {
    auditLogId: number
    timestamp: string
    action: string
    type: string
    user: string
    resource: string
    module: string
}

export interface AuditLogDetailType extends AuditLogRowType {
    payload: Record<string, unknown>
}

export interface AuditLogParamsType extends Record<'auditLogId', string> {}

export type AuditLogFilterOptionsType = {
    typeOptions: SelectPickerOptionType<string>[]
    moduleOptions: SelectPickerOptionType<string>[]
}

export type AuditLogTableAdditionalProps = {
    filterOptions: AuditLogFilterOptionsType
}

export type AuditLogsTableProps = TableProps<AuditLogRowType, FiltersTypeEnum.URL, AuditLogTableAdditionalProps>

export type GetAuditLogListProps = AuditLogFiltersType &
    Parameters<NonNullable<AuditLogsTableProps['getRows']>>[0] & {
        signal: AbortSignal
    }

export type AuditLogsTableWrapperProps = TableViewWrapperProps<
    AuditLogRowType,
    FiltersTypeEnum.URL,
    AuditLogFiltersType & AuditLogTableAdditionalProps
>

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
    RESOURCE_NAME = 'resourceName',
    RESOURCE_TYPE = 'resourceType',
    MODULE = 'module',
}

export type AuditLogFiltersType = {
    [AuditLogFilterKeys.TYPE]: string[]
    [AuditLogFilterKeys.MODULE]: string[]
}

export interface AuditLogRowType {
    auditLogId: number
    timeStamp: string
    action: string
    requestMethod: string
    user: string
    resourceName: string
    resourceType: string
    module: string
}

export interface AuditLogDetailType extends AuditLogRowType {
    payload: Record<string, unknown>
}

export interface AuditLogApiResponse {
    auditLogs: {
        data: AuditLogDetailType[]
    }
}

export type AuditLogFilterOptionsType = {
    typeOptions: SelectPickerOptionType<string>[]
    moduleOptions: SelectPickerOptionType<string>[]
}

export type AuditLogTableAdditionalProps = {
    filterOptions: AuditLogFilterOptionsType
    onSelectAuditLog: (auditLog: AuditLogDetailType) => void
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

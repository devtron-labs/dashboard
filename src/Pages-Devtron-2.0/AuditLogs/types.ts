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
    jsonFormatLog?: string
    payload?: Record<string, unknown> | string
}

export interface AuditLogApiResponse {
    data?: AuditLogDetailType[]
    offset?: number
    size?: number
    totalCount?: number
    auditLogs?: {
        data?: AuditLogDetailType[]
        offset?: number
        size?: number
        totalCount?: number
    }
}

export type NormalizedAuditLogApiResponse = Required<
    Pick<AuditLogApiResponse, 'data' | 'offset' | 'size' | 'totalCount'>
>

export type AuditLogFilterOptionsType = {
    typeOptions: SelectPickerOptionType<string>[]
    moduleOptions: SelectPickerOptionType<string>[]
}

export type AuditLogTableAdditionalProps = {
    filterOptions: AuditLogFilterOptionsType
    onSelectAuditLog: (auditLog: AuditLogDetailType) => void
}

export type AuditLogsTableProps = TableProps<AuditLogRowType, FiltersTypeEnum.URL, AuditLogTableAdditionalProps>

export type GetAuditLogsParams = Partial<AuditLogFiltersType> &
    Parameters<NonNullable<AuditLogsTableProps['getRows']>>[0]

export type AuditLogsTableWrapperProps = TableViewWrapperProps<
    AuditLogRowType,
    FiltersTypeEnum.URL,
    AuditLogFiltersType & AuditLogTableAdditionalProps
>

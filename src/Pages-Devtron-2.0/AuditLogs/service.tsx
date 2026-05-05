import { get, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'

import {
    AuditLogApiResponse,
    AuditLogDetailType,
    AuditLogFilterKeys,
    AuditLogFilterOptionsType,
    AuditLogsTableProps,
    GetAuditLogsParams,
    NormalizedAuditLogApiResponse,
} from './types'

const AUDIT_LOG_ENDPOINT = 'audit-log'

const normalizeAuditLogResponse = (response?: AuditLogApiResponse): NormalizedAuditLogApiResponse => {
    const {
        data = response?.data ?? [],
        offset = response?.offset ?? 0,
        size = response?.size ?? data.length,
        totalCount = response?.totalCount ?? data.length,
    } = response?.auditLogs ?? {}

    return {
        data,
        offset,
        size,
        totalCount,
    }
}

export const getAuditLogs = async (
    params?: Partial<GetAuditLogsParams>,
    signal?: AbortSignal,
): Promise<NormalizedAuditLogApiResponse> => {
    const {
        offset = 0,
        pageSize,
        searchKey,
        sortBy,
        sortOrder,
        [AuditLogFilterKeys.TYPE]: type,
        [AuditLogFilterKeys.MODULE]: module,
    } = params ?? {}

    const url = getUrlWithSearchParams(AUDIT_LOG_ENDPOINT, {
        offset,
        size: pageSize,
        searchKey,
        sortBy,
        sortOrder,
        type,
        module,
    })
    const { result } = await get<AuditLogApiResponse>(url, { signal })

    return normalizeAuditLogResponse(result)
}

export const getAuditLogList: AuditLogsTableProps['getRows'] = async (
    {
        offset,
        pageSize,
        searchKey,
        sortBy,
        sortOrder,
        [AuditLogFilterKeys.TYPE]: type = [],
        [AuditLogFilterKeys.MODULE]: module = [],
    }: GetAuditLogsParams,
    signal,
) => {
    const auditLogResponse = await getAuditLogs(
        {
            offset,
            pageSize,
            searchKey,
            sortBy,
            sortOrder,
            [AuditLogFilterKeys.TYPE]: type,
            [AuditLogFilterKeys.MODULE]: module,
        },
        signal,
    )
    const pageAuditLogs =
        auditLogResponse.data.length > pageSize
            ? auditLogResponse.data.slice(offset, offset + pageSize)
            : auditLogResponse.data

    return {
        rows: pageAuditLogs.map((auditLog, index) => ({
            id: `${auditLog.auditLogId}-${offset + index}`,
            data: auditLog,
        })),
        totalRows: auditLogResponse.totalCount,
    }
}

export const getAuditLogFilterOptions = (auditLogs: AuditLogDetailType[]): AuditLogFilterOptionsType => {
    const toOptions = (values: string[]) =>
        [...new Set(values.filter(Boolean))]
            .sort((first, second) => first.localeCompare(second))
            .map((value) => ({ label: value, value }))

    return {
        typeOptions: toOptions(auditLogs.map(({ requestMethod: type }) => type)),
        moduleOptions: toOptions(auditLogs.map(({ module }) => module)),
    }
}

import { get, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

import {
    AuditLogApiResponse,
    AuditLogDetailType,
    AuditLogFilterKeys,
    AuditLogFilterOptionsType,
    AuditLogRowType,
    AuditLogSortableKeys,
    GetAuditLogListProps,
} from './types'

const AUDIT_LOG_ENDPOINT = 'audit-log'

const fetchAuditLogs = async (signal?: AbortSignal): Promise<AuditLogDetailType[]> => {
    const response = await get<AuditLogApiResponse>(AUDIT_LOG_ENDPOINT, { signal })
    return response.result?.auditLogs?.data ?? []
}

const matchesSearch = (auditLog: AuditLogDetailType, searchKey: string) => {
    if (!searchKey) {
        return true
    }

    const normalizedSearchKey = searchKey.toLowerCase()

    return [
        auditLog.action,
        auditLog.user,
        auditLog.resourceName,
        auditLog.resourceType,
        auditLog.module,
        auditLog.requestMethod,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearchKey)
}

const getSortedAuditLogs = (
    auditLogs: AuditLogDetailType[],
    sortBy: string | undefined,
    sortOrder: SortingOrder | undefined,
) => {
    const sortingKey = (sortBy as AuditLogSortableKeys) || AuditLogSortableKeys.TIMESTAMP
    const effectiveSortOrder = sortOrder || SortingOrder.DESC

    return [...auditLogs].sort((first, second) => {
        const firstValue = first[sortingKey]
        const secondValue = second[sortingKey]

        const comparison =
            sortingKey === AuditLogSortableKeys.TIMESTAMP
                ? new Date(firstValue).getTime() - new Date(secondValue).getTime()
                : String(firstValue).localeCompare(String(secondValue))

        return effectiveSortOrder === SortingOrder.ASC ? comparison : -comparison
    })
}

export const getAuditLogList = async ({
    offset,
    pageSize,
    searchKey,
    sortBy,
    sortOrder,
    signal,
    [AuditLogFilterKeys.TYPE]: type = [],
    [AuditLogFilterKeys.MODULE]: module = [],
}: GetAuditLogListProps): Promise<{ rows: { id: string; data: AuditLogRowType }[]; totalRows: number }> => {
    const auditLogs = await fetchAuditLogs(signal)

    const filteredAuditLogs = auditLogs.filter(
        (auditLog) =>
            matchesSearch(auditLog, searchKey) &&
            (!type.length || type.includes(auditLog.requestMethod)) &&
            (!module.length || module.includes(auditLog.module)),
    )

    const sortedAuditLogs = getSortedAuditLogs(filteredAuditLogs, sortBy, sortOrder)
    const paginatedAuditLogs = sortedAuditLogs.slice(offset, offset + pageSize)

    return {
        rows: paginatedAuditLogs.map((auditLog) => ({
            id: String(auditLog.auditLogId),
            data: auditLog,
        })),
        totalRows: filteredAuditLogs.length,
    }
}

export const getAuditLogFilterOptions = async (): Promise<AuditLogFilterOptionsType> => {
    const auditLogs = await fetchAuditLogs()

    const toOptions = (values: string[]) =>
        [...new Set(values.filter(Boolean))]
            .sort((first, second) => first.localeCompare(second))
            .map((value) => ({ label: value, value }))

    return {
        typeOptions: toOptions(auditLogs.map(({ requestMethod: type }) => type)),
        moduleOptions: toOptions(auditLogs.map(({ module }) => module)),
    }
}

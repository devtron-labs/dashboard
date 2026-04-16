import { ResponseType, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

import {
    AuditLogDetailType,
    AuditLogFilterKeys,
    AuditLogFilterOptionsType,
    AuditLogRowType,
    AuditLogSortableKeys,
    GetAuditLogListProps,
} from './types'

const MOCK_AUDIT_LOGS: AuditLogDetailType[] = [
    {
        auditLogId: 101,
        timestamp: '2026-04-08T10:15:00Z',
        action: 'Application updated',
        type: 'UPDATE',
        user: 'shivani@devtron.ai',
        resource: 'frontend-service',
        module: 'Application Management',
        payload: { before: { replicas: 2 }, after: { replicas: 3 }, env: 'production' },
    },
    {
        auditLogId: 102,
        timestamp: '2026-04-08T09:42:00Z',
        action: 'Deployment triggered',
        type: 'DEPLOY',
        user: 'rahul@devtron.ai',
        resource: 'payments-service',
        module: 'Application Management',
        payload: { image: 'payments:v2.4.1', pipelineId: 98, triggerType: 'manual' },
    },
    {
        auditLogId: 103,
        timestamp: '2026-04-08T08:30:00Z',
        action: 'Policy enabled',
        type: 'CONFIGURE',
        user: 'sre@devtron.ai',
        resource: 'restrict-prod-deployments',
        module: 'Security Center',
        payload: { policy: 'restrict-prod-deployments', state: 'enabled' },
    },
    {
        auditLogId: 104,
        timestamp: '2026-04-07T16:10:00Z',
        action: 'Cluster added',
        type: 'CREATE',
        user: 'infra@devtron.ai',
        resource: 'gke-prod-cluster',
        module: 'Infrastructure Management',
        payload: { clusterName: 'gke-prod-cluster', provider: 'gke', region: 'asia-south1' },
    },
    {
        auditLogId: 105,
        timestamp: '2026-04-07T15:00:00Z',
        action: 'Chart version promoted',
        type: 'PROMOTE',
        user: 'release@devtron.ai',
        resource: 'customer-portal',
        module: 'Software Release Management',
        payload: { chartVersion: '1.4.0', release: 'spring-release', target: 'staging' },
    },
    {
        auditLogId: 106,
        timestamp: '2026-04-07T13:25:00Z',
        action: 'Backup scheduled',
        type: 'CREATE',
        user: 'ops@devtron.ai',
        resource: 'nightly-backup',
        module: 'Data Protection Management',
        payload: { schedule: '0 1 * * *', storageLocation: 's3-prod-backups' },
    },
    {
        auditLogId: 107,
        timestamp: '2026-04-07T12:05:00Z',
        action: 'Restore triggered',
        type: 'RESTORE',
        user: 'ops@devtron.ai',
        resource: 'checkout-db',
        module: 'Data Protection Management',
        payload: { backupName: 'checkout-db-2026-04-07', destinationCluster: 'dr-cluster' },
    },
    {
        auditLogId: 108,
        timestamp: '2026-04-07T11:15:00Z',
        action: 'Build triggered',
        type: 'TRIGGER',
        user: 'automation@devtron.ai',
        resource: 'catalog-service',
        module: 'Automation & Enablement',
        payload: { pipeline: 'catalog-build', branch: 'main', commit: 'a1b2c3d' },
    },
    {
        auditLogId: 109,
        timestamp: '2026-04-06T18:40:00Z',
        action: 'Cost configuration updated',
        type: 'UPDATE',
        user: 'finops@devtron.ai',
        resource: 'aws-prod',
        module: 'Cost Visibility',
        payload: { currency: 'USD', idleCostThreshold: 20 },
    },
    {
        auditLogId: 110,
        timestamp: '2026-04-06T14:10:00Z',
        action: 'Role mapping updated',
        type: 'UPDATE',
        user: 'platform-admin@devtron.ai',
        resource: 'sso-role-map',
        module: 'Global Configurations',
        payload: { role: 'super-admin', groups: ['platform-team', 'sre'] },
    },
    {
        auditLogId: 111,
        timestamp: '2026-04-05T09:55:00Z',
        action: 'Webhook deleted',
        type: 'DELETE',
        user: 'notifications@devtron.ai',
        resource: 'slack-prod-alerts',
        module: 'Global Configurations',
        payload: { webhookName: 'slack-prod-alerts', integration: 'Slack' },
    },
    {
        auditLogId: 112,
        timestamp: '2026-04-04T07:20:00Z',
        action: 'Vulnerability policy acknowledged',
        type: 'ACKNOWLEDGE',
        user: 'security@devtron.ai',
        resource: 'cve-policy-2026-04',
        module: 'Security Center',
        payload: { severity: 'critical', justification: 'Mitigated by network policy' },
    },
]

const matchesSearch = (auditLog: AuditLogDetailType, searchKey: string) => {
    if (!searchKey) {
        return true
    }

    const normalizedSearchKey = searchKey.toLowerCase()

    return [auditLog.action, auditLog.user, auditLog.resource, auditLog.module, auditLog.type]
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

// TODO: Remove later
export const getAuditListResponse = async (): Promise<ResponseType<AuditLogDetailType[]>> => {
    const response = {
        status: 'OK',
        code: 200,
        result: MOCK_AUDIT_LOGS,
    }
    return response
}

export const getAuditLogList = async ({
    offset,
    pageSize,
    searchKey,
    sortBy,
    sortOrder,
    [AuditLogFilterKeys.TYPE]: type = [],
    [AuditLogFilterKeys.MODULE]: module = [],
}: GetAuditLogListProps): Promise<{ rows: { id: string; data: AuditLogRowType }[]; totalRows: number }> => {
    const filteredAuditLogs = (await getAuditListResponse()).result?.filter(
        (auditLog) =>
            matchesSearch(auditLog, searchKey) &&
            (!type.length || type.includes(auditLog.type)) &&
            (!module.length || module.includes(auditLog.module)),
    )

    const sortedAuditLogs = getSortedAuditLogs(filteredAuditLogs, sortBy, sortOrder)
    const paginatedAuditLogs = sortedAuditLogs.slice(offset, offset + pageSize)

    return {
        rows: paginatedAuditLogs.map(({ ...auditLog }) => ({
            id: String(auditLog.auditLogId),
            data: auditLog,
        })),
        totalRows: filteredAuditLogs.length,
    }
}

export const getAuditLogFilterOptions = async (): Promise<AuditLogFilterOptionsType> => ({
    typeOptions: [...new Set(MOCK_AUDIT_LOGS.map(({ type }) => type))]
        .sort((first, second) => first.localeCompare(second))
        .map((value) => ({ label: value, value })),
    moduleOptions: [...new Set(MOCK_AUDIT_LOGS.map(({ module }) => module))]
        .sort((first, second) => first.localeCompare(second))
        .map((value) => ({ label: value, value })),
})

export const getAuditLogDetail = async (auditLogId: string): Promise<AuditLogDetailType | null> =>
    MOCK_AUDIT_LOGS.find((auditLog) => String(auditLog.auditLogId) === auditLogId) ?? null

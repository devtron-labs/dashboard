import dayjs from 'dayjs'

import { DATE_TIME_FORMATS, post, stringComparatorBySortOrder, TableProps } from '@devtron-labs/devtron-fe-common-lib'

import { getVulnerabilityFilterData } from '@Components/security/security.service'
import { SeverityFilterValues } from '@Components/security/SecurityScansTab/types'
import { Routes } from '@Config/constants'
import { getAppListMin } from '@Services/service'

import { DISCOVERY_AGE_FILTER_OPTIONS, FIX_AVAILABLE_FILTER_OPTIONS } from '../constants'
import { CVEDetails, CVEListFilterData, CVEListFilters, VulnerabilityDTO } from './types'

export const getCVEListFilters = async (): Promise<CVEListFilterData> => {
    const [appListResponse, filtersResponse] = await Promise.all([getAppListMin(), getVulnerabilityFilterData()])

    return {
        application: (appListResponse?.result || [])
            .map((app) => ({
                label: app.name,
                value: `${app.id}`,
            }))
            .sort((a, b) => stringComparatorBySortOrder(a.label, b.label)),
        ...filtersResponse,
        ageOfDiscovery: DISCOVERY_AGE_FILTER_OPTIONS,
        fixAvailability: FIX_AVAILABLE_FILTER_OPTIONS,
    }
}

export const getCVEList: TableProps<CVEDetails>['getRows'] = async (
    {
        offset,
        pageSize,
        searchKey,
        sortBy,
        sortOrder,
        ...filters
    }: Parameters<TableProps['getRows']>[0] & Record<CVEListFilters, string[]>,
    signal: AbortSignal,
) => {
    const { application, environment, ageOfDiscovery, fixAvailability, severity, cluster } = filters
    const response = await post<VulnerabilityDTO>(
        Routes.SECURITY_SCAN_VULNERABILITIES,
        {
            offset,
            size: pageSize,
            sortBy,
            sortOrder,
            cveName: searchKey,
            appIds: application.map(Number),
            envIds: environment.map(Number),
            severity: severity.map((severityFilterValue) => SeverityFilterValues[severityFilterValue]),
            clusterIds: cluster.map(Number),
            fixAvailability,
            ageOfDiscovery,
        },
        { signal },
    )
    return {
        rows: (response.result?.list ?? []).map((cve) => ({
            data: {
                ...cve,
                discoveredAt: dayjs(cve.discoveredAt).format(DATE_TIME_FORMATS.WEEKDAY_WITH_DATE_MONTH_AND_YEAR),
            },
            id: Object.values(cve).join('-'),
        })),
        totalRows: response.result?.total ?? 0,
    }
}

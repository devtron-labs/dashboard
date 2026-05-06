import { post, useQuery } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { SeverityFilterValues } from '../SecurityScansTab/types'
import { CVEListFilters } from './CVEList/types'
import { VulnerabilitySummaryDTO } from './types'

export const useGetVulnerabilitySummary = (payload: Partial<Record<CVEListFilters, string[]>>) => {
    const { application, environment, cluster, severity, fixAvailability, ageOfDiscovery } = payload

    return useQuery<VulnerabilitySummaryDTO>({
        queryKey: [
            'vulnerability-summary',
            { application, environment, cluster, severity, fixAvailability, ageOfDiscovery },
        ],
        queryFn: ({ signal }) =>
            post(
                Routes.VULNERABILITY_SUMMARY,
                {
                    appIds: application?.map(Number) || [],
                    envIds: environment?.map(Number) || [],
                    clusterIds: cluster?.map(Number) || [],
                    severity: severity?.map((sev) => SeverityFilterValues[sev]) || [],
                    fixAvailability: fixAvailability || [],
                    ageOfDiscovery: ageOfDiscovery || [],
                },
                { signal },
            ),
        select: (data) => data.result,
    })
}

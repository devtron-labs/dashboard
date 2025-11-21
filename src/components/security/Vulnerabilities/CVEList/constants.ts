import { GroupedFilterSelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { CVEListFilters } from './types'

export const CVE_LIST_GROUP_FILTER_OPTIONS: GroupedFilterSelectPickerProps<CVEListFilters>['options'] = [
    {
        items: [
            { id: 'application', label: 'Application' },
            { id: 'environment', label: 'Environment' },
            { id: 'severity', label: 'Severity' },
            { id: 'cluster', label: 'Cluster' },
            { id: 'fixAvailability', label: 'Fix Availability' },
            { id: 'ageOfDiscovery', label: 'Age of Discovery' },
        ],
    },
]

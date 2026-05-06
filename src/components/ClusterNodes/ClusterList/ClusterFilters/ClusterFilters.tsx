/*
 * Copyright (c) 2024. Devtron Inc.
 */

import {
    ClusterFiltersType,
    getSelectPickerOptionByValue,
    handleAnalyticsEvent,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterFiltersProps } from './types'

const clusterFiltersOptions: SelectPickerOptionType<ClusterFiltersType>[] = [
    {
        label: 'All Clusters',
        value: ClusterFiltersType.ALL_CLUSTERS,
    },
    {
        label: 'Healthy',
        value: ClusterFiltersType.HEALTHY,
    },
    {
        label: 'Unhealthy',
        value: ClusterFiltersType.UNHEALTHY,
    },
    {
        label: 'Connection Failed',
        value: ClusterFiltersType.CONNECTION_FAILED,
    },
]

export const ClusterFilters = ({ clusterFilter, setClusterFilter }: ClusterFiltersProps) => {
    handleAnalyticsEvent({
        category: 'Cluster List Filter',
        action: 'RB_FILTER_CLUSTER_HEALTH',
    })
    const handleFilterChange: SelectPickerProps<ClusterFiltersType>['onChange'] = ({ value }) => {
        setClusterFilter(value)
    }

    return (
        <div className="w-150">
            <SelectPicker
                inputId="cluster-list-filters"
                classNamePrefix="cluster-list-filters"
                options={clusterFiltersOptions}
                onChange={handleFilterChange}
                value={getSelectPickerOptionByValue(clusterFiltersOptions, clusterFilter)}
                fullWidth
            />
        </div>
    )
}

/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { ClusterFiltersType } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterFiltersProps {
    clusterFilter: ClusterFiltersType
    setClusterFilter: (clusterFilter: ClusterFiltersType) => void
}

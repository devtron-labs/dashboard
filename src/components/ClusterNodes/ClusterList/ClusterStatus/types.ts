/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { ClusterStatusType } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterStatusProps {
    status: ClusterStatusType
    errorInNodeListing?: string
}

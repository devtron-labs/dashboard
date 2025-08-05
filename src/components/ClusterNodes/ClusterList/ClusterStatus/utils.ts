/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { ClusterStatusType, InstallationClusterStatus, StatusType } from '@devtron-labs/devtron-fe-common-lib'

export const getClusterStatus = (status: ClusterStatusType | InstallationClusterStatus) => {
    switch (status) {
        case InstallationClusterStatus.Installed:
        case InstallationClusterStatus.Updated:
            return StatusType.SUCCEEDED

        case InstallationClusterStatus.Deleting:
            return StatusType.DELETING

        case InstallationClusterStatus.Deleted:
            return 'deleted'

        case InstallationClusterStatus.Creating:
        case InstallationClusterStatus.Updating:
            return StatusType.PROGRESSING

        case ClusterStatusType.CONNECTION_FAILED:
        case InstallationClusterStatus.Failed:
            return StatusType.FAILED

        case ClusterStatusType.HEALTHY:
            return StatusType.HEALTHY

        default:
            return StatusType.DEGRADED
    }
}

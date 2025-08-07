/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

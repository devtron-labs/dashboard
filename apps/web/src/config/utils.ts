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

import { DEVTRON_DEFAULT_RELEASE_NAME, DEVTRON_DEFAULT_NAMESPACE, DEVTRON_DEFAULT_CLUSTER_ID } from '.'

export const checkIfDevtronOperatorHelmRelease = (
    releaseName: string,
    namespace: string,
    clusterId: string,
): boolean => {
    return (
        releaseName === DEVTRON_DEFAULT_RELEASE_NAME &&
        namespace === DEVTRON_DEFAULT_NAMESPACE &&
        clusterId === DEVTRON_DEFAULT_CLUSTER_ID
    )
}

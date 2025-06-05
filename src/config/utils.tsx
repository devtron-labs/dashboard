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

import { Icon, IconBaseSizeType } from '@devtron-labs/devtron-fe-common-lib'

import { AppOverviewProps } from '@Components/app/types'

import { APP_TYPE, DEVTRON_DEFAULT_CLUSTER_ID, DEVTRON_DEFAULT_NAMESPACE, DEVTRON_DEFAULT_RELEASE_NAME } from '.'

export const checkIfDevtronOperatorHelmRelease = (releaseName: string, namespace: string, clusterId: string): boolean =>
    releaseName === DEVTRON_DEFAULT_RELEASE_NAME &&
    namespace === DEVTRON_DEFAULT_NAMESPACE &&
    clusterId === DEVTRON_DEFAULT_CLUSTER_ID

export const getAppIconWithBackground = (appType: AppOverviewProps['appType'], iconSize: IconBaseSizeType = 20) => {
    switch (appType) {
        case APP_TYPE.DEVTRON_APPS:
            return <Icon name="ic-devtron-app" color={null} size={iconSize} />
        case APP_TYPE.JOB:
            return <Icon name="ic-devtron-job" color={null} size={iconSize} />
        default:
            return null
    }
}

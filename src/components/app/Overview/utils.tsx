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

import { AppOverviewProps } from '../types'
import { DefaultJobNote, DefaultAppNote, DefaultHelmChartNote } from '../list-new/Constants'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'
import { ResourceKindType } from '@devtron-labs/devtron-fe-common-lib'
import { getAppIconWithBackground } from '@Config/utils'

const {
    OVERVIEW: { APP_DESCRIPTION, JOB_DESCRIPTION },
} = EMPTY_STATE_STATUS

export const getResourceKindFromAppType = (appType: AppOverviewProps['appType']) => {
    switch (appType) {
        case 'app':
            return ResourceKindType.devtronApplication
        case 'job':
            return ResourceKindType.job
        case 'helm-chart':
            return ResourceKindType.helmChart
    }
}

export const getAppConfig = (appType: AppOverviewProps['appType'], iconSize = 48) => {
    switch (appType) {
        case 'app':
            return {
                resourceName: 'application',
                defaultNote: DefaultAppNote,
                icon: getAppIconWithBackground(appType, iconSize),
                defaultDescription: APP_DESCRIPTION,
            }
        case 'job':
            return {
                resourceName: 'job',
                defaultNote: DefaultJobNote,
                icon: getAppIconWithBackground(appType, iconSize),
                defaultDescription: JOB_DESCRIPTION,
            }
        case 'helm-chart':
            return {
                resourceName: 'application',
                defaultNote: DefaultHelmChartNote,
                icon: null,
                defaultDescription: APP_DESCRIPTION,
            }
    }
}

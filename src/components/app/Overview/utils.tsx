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
import { IconBaseSizeType, ResourceKindType, SegmentedControlProps } from '@devtron-labs/devtron-fe-common-lib'
import { getAppIconWithBackground } from '@Config/utils'
import { OVERVIEW_TABS } from './constants'
import { importComponentFromFELibrary } from '@Components/common'

const {
    OVERVIEW: { APP_DESCRIPTION, JOB_DESCRIPTION },
} = EMPTY_STATE_STATUS

const DependencyList = importComponentFromFELibrary('DependencyList')
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

export const getAppConfig = (appType: AppOverviewProps['appType'], iconSize: IconBaseSizeType = 48) => {
    const icon = getAppIconWithBackground(appType, iconSize)
    switch (appType) {
        case 'app':
            return {
                resourceName: 'application',
                defaultNote: DefaultAppNote,
                icon,
                defaultDescription: APP_DESCRIPTION,
            }
        case 'job':
            return {
                resourceName: 'job',
                defaultNote: DefaultJobNote,
                icon,
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

export const BASE_OVERVIEW_SEGMENTED_CONTROL_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'About',
        value: OVERVIEW_TABS.ABOUT,
    },
]

export const DEVTRON_APPS_OVERVIEW_CONTROL_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'Environments',
        value: OVERVIEW_TABS.ENVIRONMENTS,
    },
    ...(DependencyList
        ? [
              {
                  label: 'Dependencies',
                  value: OVERVIEW_TABS.DEPENDENCIES,
              },
          ]
        : []),
]

export const getOverviewSegmentControlOptions = (appType: AppOverviewProps['appType']) => {
    if (appType === 'job') {
        return [
            ...BASE_OVERVIEW_SEGMENTED_CONTROL_SEGMENTS,
            {
                label: 'Job Pipelines',
                value: OVERVIEW_TABS.JOB_PIPELINES,
            },
        ]
    }

    return [...BASE_OVERVIEW_SEGMENTED_CONTROL_SEGMENTS, ...DEVTRON_APPS_OVERVIEW_CONTROL_SEGMENTS]
}

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

import { SegmentedControlProps } from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetailsSegment } from './types'

export const CHART_DETAILS_SEGMENTS: SegmentedControlProps['segments'] = [
    {
        label: 'Readme',
        value: ChartDetailsSegment.README,
    },
    {
        label: 'Preset Values',
        value: ChartDetailsSegment.PRESET_VALUES,
    },
    {
        label: 'Deployments',
        value: ChartDetailsSegment.DEPLOYMENTS,
    },
]

export const CHART_DETAILS_PORTAL_CONTAINER_ID = 'chart-details-portal-container'

export const CHART_DETAILS_NEW_PRESET_VALUE_ID = '0'

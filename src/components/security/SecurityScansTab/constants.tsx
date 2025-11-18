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

import { ScanDetailsType, ScanTypeOptions } from './types'

export const INITIAL_SCAN_DETAILS: ScanDetailsType = {
    appId: 0,
    envId: 0,
}

export const SCANNED_UNSCANNED_CONTROL_SEGMENTS: SegmentedControlProps['segments'] = [
    { label: 'Scanned', value: ScanTypeOptions.SCANNED },
    { label: 'Not scanned', value: ScanTypeOptions.NOT_SCANNED },
]

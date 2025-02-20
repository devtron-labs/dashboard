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

import { Dayjs } from 'dayjs'
import { MARK_AS_STALE_DATA_CUT_OFF_MINS } from '../../ResourceBrowser/Constants'
import { DynamicTabsVariantType, ParsedTabsData, ParsedTabsDataV1 } from './types'
import { TAB_DATA_VERSION } from './constants'

export const checkIfDataIsStale = (start: Dayjs, now: Dayjs): boolean =>
    now.diff(start, 'minutes') > MARK_AS_STALE_DATA_CUT_OFF_MINS

export const getClassNameForVariant = (variant: DynamicTabsVariantType) => {
    const prefix = 'variant__'

    switch (variant) {
        case DynamicTabsVariantType.ROUNDED:
            return `${prefix}rounded bg__primary`
        case DynamicTabsVariantType.RECTANGULAR:
            return `${prefix}rectangular bg__tertiary`
        default:
            return ''
    }
}

export const convertV1TabsDataToV2 = (tabsData: ParsedTabsDataV1 | ParsedTabsData): ParsedTabsData => {
    if (tabsData.version === TAB_DATA_VERSION) {
        return tabsData
    }

    return {
        data: { [tabsData.key]: tabsData.data },
        version: TAB_DATA_VERSION,
    }
}

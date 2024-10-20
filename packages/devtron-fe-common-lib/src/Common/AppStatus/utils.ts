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

import { TIMELINE_STATUS } from '../../Shared/constants'

export const triggerStatus = (triggerDetailStatus: string): string => {
    const triggerStatus = triggerDetailStatus?.toUpperCase()
    if (triggerStatus === TIMELINE_STATUS.ABORTED || triggerStatus === TIMELINE_STATUS.DEGRADED) {
        return 'Failed'
    }
    if (triggerStatus === TIMELINE_STATUS.HEALTHY) {
        return 'Succeeded'
    }
    if (triggerStatus === TIMELINE_STATUS.INPROGRESS) {
        return 'Inprogress'
    }
    return triggerDetailStatus
}

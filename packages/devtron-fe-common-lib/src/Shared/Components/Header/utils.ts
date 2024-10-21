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

import { updatePostHogEvent } from './service'
import { LOGIN_COUNT } from '../../../Common'

const millisecondsInDay = 86400000
export const getDateInMilliseconds = (days) => 1 + new Date().valueOf() + (days ?? 0) * millisecondsInDay

export const handlePostHogEventUpdate = async (e, eventName?: string): Promise<void> => {
    const payload = {
        eventType: eventName || e.target?.dataset.posthog,
        key: LOGIN_COUNT,
        value: '',
        active: true,
    }
    await updatePostHogEvent(payload)
}

export const setActionWithExpiry = (key: string, days: number): void => {
    localStorage.setItem(key, `${getDateInMilliseconds(days)}`)
}

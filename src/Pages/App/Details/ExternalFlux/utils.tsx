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

import { EXTERNAL_FLUX_APP_STATUS } from './types'

// In case of FluxCD Apps True means app is Ready and False denotes app is not ready
export const getAppStatus = (appStatus: string): string => {
    if (appStatus === 'True') {
        return EXTERNAL_FLUX_APP_STATUS.READY
    }
    if (appStatus === 'False') {
        return EXTERNAL_FLUX_APP_STATUS.NOT_READY
    }
    return appStatus
}

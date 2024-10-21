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

import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { ScopedVariablesDataType } from './types'
import { Routes } from '../../config'

// Services
export const getScopedVariablesJSON = () => get(Routes.SCOPED_GLOBAL_VARIABLES_DETAIL)

export const postScopedVariables = (scopedVariables: ScopedVariablesDataType) => {
    const payload = {
        manifest: scopedVariables,
    }
    return post(Routes.SCOPED_GLOBAL_VARIABLES, payload)
}

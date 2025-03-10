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

import {
    AppConfigProps,
    get,
    trash,
    ROUTES as CommonRoutes,
    getUrlWithSearchParams,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../../../config'

export const getGitProviderMin = () => {
    const URL = `${Routes.GIT_PROVIDER_MIN}`
    return get(URL)
}

export const getGitProviderMinAuth = (appId) => {
    const URL = `${Routes.APP}/${appId}/autocomplete/git`
    return get(URL)
}

export function deleteApp(appId: string, isTemplateView: AppConfigProps['isTemplateView']) {
    const URL = isTemplateView
        ? getUrlWithSearchParams(CommonRoutes.RESOURCE_TEMPLATE, {
              id: appId,
          })
        : `${Routes.APP}/${appId}`

    return trash(URL)
}

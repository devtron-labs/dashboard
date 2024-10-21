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

import { SELECT_ALL_VALUE, URLS } from '../../../config'
import { ENVIRONMENT_FILTER_SEARCH_KEY } from './constants'
import { LinkedCIAppUrlProps } from './types'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    environment: searchParams.get(ENVIRONMENT_FILTER_SEARCH_KEY) || SELECT_ALL_VALUE,
})

export const getLinkedCITippyContent = (workflowCount: number = 0) =>
    `This build pipeline is linked as image source in ${workflowCount} ${workflowCount === 1 ? 'workflow' : 'workflows'}.`

export const getLinkedCIAppUrl = ({ appId, environmentId }: LinkedCIAppUrlProps): string => {
    const envId = environmentId ? `/${environmentId}` : ''
    const link = `${URLS.APP}/${appId}/${URLS.APP_DETAILS}${envId}`
    return link
}

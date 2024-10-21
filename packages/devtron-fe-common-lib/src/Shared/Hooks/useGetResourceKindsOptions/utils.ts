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

import { ResourceKindType } from '@Shared/types'
import { UseGetResourceKindsOptionsProps } from './types'

export const getResourcesToFetchMap = (resourcesToFetch: UseGetResourceKindsOptionsProps['resourcesToFetch']) =>
    resourcesToFetch.reduce<Record<UseGetResourceKindsOptionsProps['resourcesToFetch'][0], boolean>>(
        (acc, resource) => {
            acc[resource] = true

            return acc
        },
        {
            [ResourceKindType.devtronApplication]: false,
            [ResourceKindType.project]: false,
            [ResourceKindType.cluster]: false,
            [ResourceKindType.environment]: false,
        },
    )

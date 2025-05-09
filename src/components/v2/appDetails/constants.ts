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

import { StatusType } from '@devtron-labs/devtron-fe-common-lib/'

export enum ApplicationsGAEvents {
    REFRESH_DEVTRON_APP_RESOURCE_TREE = 'REFRESH_DEVTRON_APP_RESOURCE_TREE',
    REFRESH_HELM_APP_RESOURCE_TREE = 'REFRESH_HELM_APP_RESOURCE_TREE',
    REFRESH_ARGO_APP_RESOURCE_TREE = 'REFRESH_ARGO_APP_RESOURCE_TREE',
    REFRESH_FLUX_APP_RESOURCE_TREE = 'REFRESH_FLUX_APP_RESOURCE_TREE',
}

export const EXPLAIN_AI_EXCLUDED_STATUS = new Set([StatusType.HEALTHY.toLowerCase(), 'running', 'completed', 'ready'])

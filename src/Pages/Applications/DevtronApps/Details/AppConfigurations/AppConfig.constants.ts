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

import { BASE_CONFIGURATION_ENV_ID, EnvResourceType } from '@devtron-labs/devtron-fe-common-lib'

export const BASE_CONFIGURATIONS = {
    id: BASE_CONFIGURATION_ENV_ID,
    name: 'Base Configurations',
}

const resourceTypes = Object.values(EnvResourceType)
export const ENV_CONFIG_PATH_REG = new RegExp(`(${resourceTypes.join('|')})`)

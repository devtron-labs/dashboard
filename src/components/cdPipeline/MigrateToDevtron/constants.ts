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

import { GenericSectionErrorStateProps } from '@devtron-labs/devtron-fe-common-lib'

export const GENERIC_SECTION_ERROR_STATE_COMMON_PROPS: Readonly<
    Pick<GenericSectionErrorStateProps, 'rootClassName' | 'description'>
> = {
    rootClassName: 'dc__mxw-400',
    description: '',
}

export const TARGET_ENVIRONMENT_INFO_LIST = {
    heading: 'Target environment',
    infoList: [
        'A deployment pipeline will be created for the target environment.',
        'Environment is a unique combination of cluster and namespace in Devtron.',
    ],
}
